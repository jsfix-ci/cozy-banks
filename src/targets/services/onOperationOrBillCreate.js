import fetch from 'node-fetch'
global.fetch = fetch

import CozyClient from 'cozy-client'
import flag from 'cozy-flags'
import { Document } from 'cozy-doctypes'

import { fetchSettings } from 'ducks/settings/helpers'

import { TRANSACTION_DOCTYPE } from 'doctypes'
import { fetchChangesOrAll, getOptions } from './helpers/helpers'
import {
  log,
  setFlagsFromSettings,
  doBillsMatching,
  updateSettings,
  doTransactionsMatching,
  doSendNotifications,
  doAppSuggestions,
  launchBudgetAlertService
} from './onOperationOrBillCreateHelpers'

const onOperationOrBillCreate = async (client, options) => {
  log('info', `COZY_CREDENTIALS: ${process.env.COZY_CREDENTIALS}`)
  log('info', `COZY_URL: ${process.env.COZY_URL}`)
  log('info', `COZY_JOB_ID: ${process.env.COZY_JOB_ID}`)

  log('info', '⌛ Fetching settings...')
  let setting = await fetchSettings(client)
  log('info', '✅ Settings fetched')

  setFlagsFromSettings(setting)

  // We fetch the notifChanges before anything else because we need to know if
  // some transactions are totally new in `TransactionGreater` notification.
  // These transactions may be updated by the matching algorithm, and thus
  // may be missed by `TransactionGreater` because their `_rev` don't start with `1`
  const notifLastSeq = setting.notifications.lastSeq
  log('info', '⌛ Fetching transaction changes...')
  const notifChanges = await fetchChangesOrAll(
    client,
    TRANSACTION_DOCTYPE,
    notifLastSeq
  )
  log('info', '✅ Transaction changes fetched')

  if (options.billsMatching !== false) {
    await doBillsMatching(client, setting, options.billsMatching)
    setting = await updateSettings(client, setting)
  } else {
    log('info', '➡️ Skip bills matching')
  }

  if (options.transactionsMatching !== false) {
    await doTransactionsMatching(client, setting, options.transactionsMatching)
    setting = await updateSettings(client, setting)
  } else {
    log('info', '➡️ Skip transactions matching')
  }

  // Select which notifications should be be sent
  // BalanceLower - does not depend on transactions modifications
  // TransactionGreater
  // HealthBillLinked
  // LateHealthReimbursement
  // DelayedDebit - does not depend on transactions modifications
  await doSendNotifications(setting, notifChanges)
  setting = await updateSettings(client, setting)

  await doAppSuggestions(setting)
  setting = await updateSettings(client, setting)

  await launchBudgetAlertService(client)
}

const attachProcessEventHandlers = () => {
  process.on('uncaughtException', err => {
    log('warn', JSON.stringify(err.stack))
  })

  process.on('unhandledRejection', err => {
    log('warn', JSON.stringify(err.stack))
  })
}

const main = async () => {
  attachProcessEventHandlers()
  const client = CozyClient.fromEnv(process.env)
  Document.registerClient(client)
  client.registerPlugin(flag.plugin)
  await client.plugins.flags.initializing
  const options = await getOptions(client)
  log('info', 'Options:')
  log('info', JSON.stringify(options))
  await onOperationOrBillCreate(client, options)
}

main().catch(e => {
  log('critical', e)
  process.exit(1)
})
