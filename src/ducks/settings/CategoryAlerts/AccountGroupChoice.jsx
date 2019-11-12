import React from 'react'
import PropTypes from 'prop-types'
import { queryConnect } from 'cozy-client'
import { accountsConn, groupsConn } from 'doctypes'
import Row from 'components/Row'
import { translate, Label } from 'cozy-ui/transpiled/react'
import AccountIcon from 'components/AccountIcon'
import { getGroupLabel } from 'ducks/groups/helpers'
import { getAccountLabel } from 'ducks/account/helpers.js'

/**
 * Displays Rows to select among either
 *
 * - all accounts
 * - an account
 * - a group
 */
export const AccountGroupChoice = ({
  current,
  accounts: accountsCol,
  groups: groupsCol,
  onSelect,
  t
}) => {
  const accounts = accountsCol.data || []
  const groups = groupsCol.data || []
  return (
    <div>
      <div>
        <Row
          label={t('AccountSwitch.all_accounts')}
          isSelected={!current}
          onClick={() => onSelect(null)}
        />
      </div>
      <div className="u-ph-1">
        <Label>{t('AccountSwitch.accounts')}</Label>
      </div>
      {accounts.map(account => (
        <Row
          icon={<AccountIcon account={account} />}
          key={account._id}
          isSelected={current && current._id === account._id}
          label={getAccountLabel(account)}
          onClick={() => onSelect(account)}
        />
      ))}
      <div className="u-ph-1">
        <Label>{t('AccountSwitch.groups')}</Label>
      </div>
      {groups.map(group => (
        <Row
          key={group._id}
          isSelected={current && current._id === group._id}
          label={getGroupLabel(group, t)}
          onClick={() => onSelect(group)}
        />
      ))}
    </div>
  )
}

AccountGroupChoice.propTypes = {
  onChoose: PropTypes.func.isRequired
}

export const DumbAccountGroupChoice = translate()(AccountGroupChoice)

export default queryConnect({
  accounts: accountsConn,
  groups: groupsConn
})(DumbAccountGroupChoice)
