import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import App from 'components/App'
import { isWebApp } from 'cozy-device-helper'
import flag from 'cozy-flags'

import { CategoriesPage } from 'ducks/categories'
import {
  Settings,
  AccountsSettings,
  GroupsSettings,
  ExistingGroupSettings,
  NewGroupSettings,
  TagsSettings,
  Configuration
} from 'ducks/settings'
import { Balance, BalanceDetailsPage } from 'ducks/balance'
import {
  DebugRecurrencePage,
  RecurrencesPage,
  RecurrencePage
} from 'ducks/recurrence'
import { TransferPage } from 'ducks/transfers'
import { SearchPage } from 'ducks/search'
import { AnalysisPage } from 'ducks/analysis'
import UserActionRequired from 'components/UserActionRequired'
import ScrollToTopOnMountWrapper from 'components/scrollToTopOnMount'
import PlannedTransactionsPage from 'ducks/future/PlannedTransactionsPage'
import SetFilterAndRedirect from 'ducks/balance/SetFilterAndRedirect'
import TagPage from 'ducks/tags/TagPage'

// Use a function to delay instantation and have access to AppRoute.renderExtraRoutes
const AppRoute = () => (
  <Routes>
    <Route element={<UserActionRequired />}>
      <Route path="/" element={<App />}>
        <Route element={<ScrollToTopOnMountWrapper />}>
          {isWebApp() && (
            <Route index element={<Navigate to="balances" replace />} />
          )}
          <Route path="balances">
            <Route index element={<Balance />} />
            <Route path="details" element={<BalanceDetailsPage />} />
            <Route path="future" element={<PlannedTransactionsPage />} />
            <Route
              path=":accountOrGroupId/:page"
              element={<SetFilterAndRedirect />}
            />
          </Route>
          <Route path="categories">
            <Route
              path="*"
              element={<Navigate to="analysis/categories" replace />}
            />
          </Route>
          <Route path="recurrence">
            <Route
              path="*"
              element={<Navigate to="analysis/recurrence" replace />}
            />
          </Route>
          <Route path="analysis" element={<AnalysisPage />}>
            <Route path="categories">
              <Route index element={<CategoriesPage />} />
              <Route
                path=":categoryName/:subcategoryName"
                element={<CategoriesPage />}
              />
              <Route path=":categoryName" element={<CategoriesPage />} />
            </Route>
            <Route path="recurrence">
              <Route index element={<RecurrencesPage />} />
              <Route path=":bundleId" element={<RecurrencePage />} />
            </Route>
          </Route>
          <Route path="settings">
            <Route path="groups/new" element={<NewGroupSettings />} />
            <Route path="groups/:groupId" element={<ExistingGroupSettings />} />
            <Route
              path="accounts/:accountId"
              element={<Navigate to="accounts" replace />}
            />
            <Route element={<Settings />}>
              <Route index element={<Configuration />} />
              <Route path="accounts" element={<AccountsSettings />} />
              <Route path="groups" element={<GroupsSettings />} />
              {flag('banks.tags.enabled') && (
                <Route path="tags" element={<TagsSettings />} />
              )}
              <Route path="configuration" element={<Configuration />} />
            </Route>
          </Route>
          {flag('banks.tags.enabled') && (
            <Route path="tag/:tagId" element={<TagPage />} />
          )}
          <Route path="transfers" element={<TransferPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="search/:search" element={<SearchPage />} />
          <Route path="recurrencedebug" element={<DebugRecurrencePage />} />
          {AppRoute.renderExtraRoutes()}
          {isWebApp() && (
            <Route path="*" element={<Navigate to="balances" replace />} />
          )}
        </Route>
      </Route>
    </Route>
  </Routes>
)

// Ability to overrides easily
AppRoute.renderExtraRoutes = () => null

export default AppRoute
