/* global __TARGET__ */

// Uncomment to activate why-did-you-render
// https://github.com/welldone-software/why-did-you-render
// import './wdyr'

import 'utils/react-exposer'
import 'whatwg-fetch'
import 'styles/main'

import 'cozy-ui/transpiled/react/stylesheet.css'
import 'cozy-ui/dist/cozy-ui.utils.min.css'

import React from 'react'
import { render } from 'react-dom'
import { loadState, persistState } from 'store/persistedState'
import configureStore from 'store/configureStore'
import 'number-to-locale-string'
import FastClick from 'fastclick'

import { setupLocale as setupD3Locale } from 'utils/d3'
import { isIOSApp } from 'cozy-device-helper'
import Alerter from 'cozy-ui/transpiled/react/Alerter'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import flag from 'cozy-flags'
import { handleOAuthResponse } from 'cozy-harvest-lib'

import { setupHistory } from 'utils/history'
import {
  getClient,
  CleanupStoreClientPlugin,
  StartupChecksPlugin
} from 'ducks/client'
import 'utils/flag'
import { checkToRefreshToken } from 'utils/token'
import { makeItShine } from 'utils/display.debug'
import PinPlugin from 'ducks/pin/plugin'
import cozyBar from 'utils/cozyBar'

import { getLanguageFromDOM } from 'utils/lang'

import './logger'
import parseCozyData from 'utils/cozyData'

if (__TARGET__ === 'mobile') {
  require('styles/mobile.styl')
}

let store, client, history, lang, root

const initRender = () => {
  if (handleOAuthResponse()) {
    render(
      <Spinner size="xxlarge" middle={true} />,
      document.querySelector('[role=application]')
    )
    return
  }
  const AppContainer = require('./AppContainer').default
  root = render(
    <AppContainer
      store={store}
      client={client}
      lang={lang}
      history={history}
    />,
    document.querySelector('[role=application]', root)
  )
}

const setupApp = async persistedState => {
  const root = document.querySelector('[role=application]')
  lang = getLanguageFromDOM(root)

  setupD3Locale(lang)

  history = setupHistory()

  client = await getClient(persistedState)
  store = configureStore(client, persistedState)
  client.registerPlugin(CleanupStoreClientPlugin, { store })
  client.registerPlugin(PinPlugin)
  client.registerPlugin(flag.plugin)
  client.registerPlugin(StartupChecksPlugin, {
    launchTriggers: [
      {
        slug: 'banks',
        name: 'autogroups',
        type: '@event',
        policy: 'never-executed'
      }
    ],

    // Delay startup checks to lessen the load at page startup
    delay: 5000
  })

  const refreshFlags = async () => {
    // TODO Remove else block after https://github.com/cozy/cozy-libs/pull/1115
    // is merged
    if (client.plugins.flags.refresh) {
      await client.plugins.flags.refresh()
    } else {
      await flag.initializeFromRemote(client)
    }
  }

  document.addEventListener('resume', () => {
    refreshFlags()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshFlags()
    }
  })

  client.setStore(store)

  persistState(store)

  if (__TARGET__ !== 'mobile') {
    const {
      app: { icon, name },
      locale
    } = parseCozyData(root)
    !flag('authentication') &&
      cozyBar.init({
        appName: name,
        cozyClient: client,
        iconPath: icon,
        lang: locale,
        replaceTitleOnMobile: true
      })
  } else {
    const onStartOrResume = checkToRefreshToken(client, store, () => {
      if (flag('debug')) {
        Alerter.info('Token refreshed')
      }
    })
    document.addEventListener('deviceready', onStartOrResume)
    document.addEventListener('resume', onStartOrResume)
  }

  initRender()
}

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line
  loadState().then(setupApp)

  // We add fastclick only for iOS since Chrome removed this behavior (iOS also, but
  // we still use UIWebview and not WKWebview... )
  if (isIOSApp()) {
    FastClick.attach(document.body)
  }
})

if (module.hot) {
  module.hot.accept('./AppContainer', () =>
    requestAnimationFrame(() => {
      makeItShine(document.body)
      initRender()
    })
  )
}
