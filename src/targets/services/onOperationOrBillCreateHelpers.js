import fetch from 'node-fetch'
global.fetch = fetch
import get from 'lodash/get'
import set from 'lodash/set'

import logger from 'cozy-logger'
import flag from 'cozy-flags'

import { sendNotifications } from 'ducks/notifications/services'
import matchFromBills from 'ducks/billsMatching/matchFromBills'
import matchFromTransactions from 'ducks/billsMatching/matchFromTransactions'
import { logResult } from 'ducks/billsMatching/utils'

import { TRANSACTION_DOCTYPE, BILLS_DOCTYPE } from 'doctypes'
import isCreatedDoc from 'utils/isCreatedDoc'
import { findAppSuggestions } from 'ducks/appSuggestions/services'
import { fetchChangesOrAll } from './helpers/helpers'
import assert from '../../utils/assert'

export const log = logger.namespace('onOperationOrBillCreate')

export const doBillsMatching = async (client, setting, options = {}) => {
  // Bills matching
  log('info', 'Bills matching')
  const billsLastSeq =
    options.lastSeq || setting.billsMatching.billsLastSeq || '0'

  try {
    log('info', '⌛ Fetching bills changes...')
    const billsChanges = await fetchChangesOrAll(
      client,
      BILLS_DOCTYPE,
      billsLastSeq
    )
    billsChanges.documents = billsChanges.documents.filter(isCreatedDoc)

    setting.billsMatching.billsLastSeq = billsChanges.newLastSeq

    if (billsChanges.documents.length === 0) {
      log('info', '[matching service] No new bills since last execution')
    } else {
      log(
        'info',
        `[matching service] ${billsChanges.documents.length} new bills since last execution. Trying to find transactions for them`
      )

      const result = await matchFromBills(billsChanges.documents)
      logResult(result)
    }
  } catch (e) {
    log('error', `❗ [matching service] ${e}`)
  }
}

export const doTransactionsMatching = async (client, setting, options = {}) => {
  assert(setting, 'No setting passed')
  log('info', '⌛ Do transaction matching...')
  const transactionsLastSeq =
    options.lastSeq || get(setting, 'billsMatching.transactionsLastSeq') || '0'

  try {
    log('info', '⌛ Fetching transactions changes...')
    const transactionsChanges = await fetchChangesOrAll(
      client,
      TRANSACTION_DOCTYPE,
      transactionsLastSeq
    )

    set(
      setting,
      'billsMatching.transactionsLastSeq',
      transactionsChanges.newLastSeq
    )

    if (transactionsChanges.documents.length === 0) {
      log('info', '[matching service] No new operations since last execution')
    } else {
      log(
        'info',
        `[matching service] ${transactionsChanges.documents.length} new transactions since last execution. Trying to find bills for them`
      )

      const result = await matchFromTransactions(transactionsChanges.documents)
      logResult(result)
    }
  } catch (e) {
    log('error', `❗ [matching service] ${e}`)
  }
}

export const doSendNotifications = async (setting, notifChanges) => {
  assert(setting, 'No setting passed')
  log('info', '⌛ Do send notifications...')
  try {
    const transactionsToNotify = notifChanges.documents
    await sendNotifications(setting, transactionsToNotify)
    set(
      setting,
      'notifications.lastSeq',
      get(setting, 'billsMatching.transactionsLastSeq')
    )
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    log('warn', '❗ Error while sending notifications : ' + e)
  }
}

export const doAppSuggestions = async setting => {
  assert(setting, 'No setting passed')
  log('info', '⌛ Do apps suggestions...')
  try {
    await findAppSuggestions(setting)
  } catch (e) {
    log('warn', '❗ Error while finding app suggestions: ' + e)
  }
}

export const updateSettings = async (client, settings) => {
  log('info', '⌛ Updating settings...')
  const { data: newSettings } = await client.save(settings)
  log('info', '✅ Settings updated')
  return newSettings
}

export const launchBudgetAlertService = async client => {
  log('info', '⌛ Launching budget alert service...')
  const jobs = client.collection('io.cozy.jobs')
  await jobs.create('service', {
    name: 'budgetAlerts',
    slug: flag('banking.banking-app-slug') || 'banks'
  })
  log('info', '✅ Budget alert service launched')
}

export const setFlagsFromSettings = settings => {
  // The flag is needed to use local model when getting a transaction category ID
  flag('local-model-override', settings.community.localModelOverride.enabled)

  flag(
    'late-health-reimbursement-limit',
    settings.notifications.lateHealthReimbursement.value
  )
}
