import React, { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import flag from 'cozy-flags'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import useBreakpoints from 'cozy-ui/transpiled/react/hooks/useBreakpoints'

import { PageTitle } from 'components/Title'
import Padded from 'components/Padded'
import Header from 'components/Header'
import { Tab, Tabs } from 'cozy-ui/transpiled/react/MuiTabs'
import Divider from 'cozy-ui/transpiled/react/MuiCozyTheme/Divider'

export const tabNames = ['configuration', 'accounts', 'groups']

if (flag('banks.tags.enabled')) {
  tabNames.push('tags')
}

const TabsHeader = () => {
  const { isMobile } = useBreakpoints()
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  let defaultTab = location.pathname.replace('/settings/', '')

  if (tabNames.indexOf(defaultTab) === -1) defaultTab = 'configuration'

  const goTo = useCallback(url => () => navigate(url), [navigate])

  return (
    <>
      <Padded className={isMobile ? 'u-p-0' : 'u-pb-half'}>
        <PageTitle>{t('Settings.title')}</PageTitle>
      </Padded>
      <Header fixed theme={isMobile ? 'inverted' : 'normal'}>
        <Tabs value={tabNames.indexOf(defaultTab)}>
          {tabNames.map((tabName, i) => (
            <Tab
              disableRipple
              classes={{ root: i === 0 && !isMobile ? 'u-ml-2' : 0 }}
              key={tabName}
              name={tabName}
              onClick={goTo(`/settings/${tabName}`)}
              label={t(`Settings.${tabName}`)}
            />
          ))}
        </Tabs>
        {isMobile ? null : <Divider />}
      </Header>
    </>
  )
}

export default TabsHeader
