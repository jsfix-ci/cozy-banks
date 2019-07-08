import fetch from 'node-fetch'
import CozyClient from 'cozy-client'
import { TRANSACTION_DOCTYPE, ACCOUNT_DOCTYPE } from 'doctypes'
import { BankTransaction } from 'cozy-doctypes'
import { groupBy } from 'lodash'
import logger from 'cozy-logger'
import {
  getPeriod,
  fetchTransactionsForPeriod,
  getMeanOnPeriod
} from 'ducks/stats/services'
import { getCategoryId } from 'ducks/categories/helpers'

global.fetch = fetch

const log = logger.namespace('stats')

const schema = {
  transactions: {
    doctype: TRANSACTION_DOCTYPE,
    attributes: {},
    relationships: {
      account: {
        type: 'belongs-to-in-place',
        doctype: ACCOUNT_DOCTYPE
      }
    }
  },
  stats: {
    doctype: 'io.cozy.bank.accounts.stats',
    attributes: {},
    relationships: {
      account: {
        type: 'has-one',
        doctype: ACCOUNT_DOCTYPE
      }
    }
  }
}

const client = new CozyClient({
  uri: process.env.COZY_URL.trim(),
  schema,
  token: process.env.COZY_CREDENTIALS.trim()
})

BankTransaction.registerClient(client)

const main = async () => {
  const period = getPeriod()
  const transactions = await fetchTransactionsForPeriod(period)

  log(
    'info',
    `${transactions.length} transactions between ${period.start} and ${
      period.end
    }`
  )

  const transactionsByAccount = groupBy(
    transactions,
    transaction => transaction.account
  )

  Object.entries(transactionsByAccount).forEach(([accountId, transactions]) => {
    // TODO get `local-model-override` setting and put it in a flag
    const transactionsByCategory = groupBy(transactions, getCategoryId)

    const stats = {
      periodStart: period.start,
      periodEnd: period.end,
      income: getMeanOnPeriod(transactionsByCategory['200110'], period),
      additionalIncome: getMeanOnPeriod(
        transactionsByCategory['200180'],
        period
      ),
      mortgage: getMeanOnPeriod(transactionsByCategory['401010'], period),
      loans: getMeanOnPeriod(
        [
          ...(transactionsByCategory['401010'] || []),
          ...(transactionsByCategory['400120'] || []),
          ...(transactionsByCategory['400930'] || []),
          ...(transactionsByCategory['400210'] || [])
        ],
        period
      ),
      currency: 'EUR',
      relationships: {
        account: {
          data: { _id: accountId, _type: ACCOUNT_DOCTYPE }
        }
      }
    }

    log('info', `stats for account ${accountId}`)
    /* eslint-disable no-console */
    console.log(stats)
    console.log()
    /* eslint-enable no-console */
  })
}

main()
