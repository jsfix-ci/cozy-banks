import React, { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Tab, Tabs } from 'cozy-ui/transpiled/react/MuiTabs'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import Header from 'components/Header'

export const tabRoutes = {
  categories: 'analysis/categories',
  recurrence: 'analysis/recurrence'
}

export const activeTab = location =>
  location.pathname.includes('categories') ? 'categories' : 'recurrence'
export const tabNames = ['categories', 'recurrence']

const AnalysisTabs = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()
  const goTo = useCallback(url => () => navigate(url), [navigate])
  return (
    <Header fixed theme="inverted">
      <Tabs value={tabNames.indexOf(activeTab(location))}>
        {tabNames.map(tabName => (
          <Tab
            disableRipple
            label={t(`Nav.${tabName}`)}
            key={tabName}
            name={tabName}
            onClick={goTo(tabRoutes[tabName])}
          />
        ))}
      </Tabs>
    </Header>
  )
}

AnalysisTabs.PropTypes = {}

export default React.memo(AnalysisTabs)
