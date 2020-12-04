import React, { useContext, createContext, useEffect } from 'react'
import { getTracker } from 'ducks/tracking/tracker'

export { getTracker }

export const trackEvent = options => {
  const tracker = getTracker()
  tracker.trackEvent(options)
}

export const TrackerContext = createContext()

export const TrackerProvider = ({ children }) => {
  const tracker = getTracker()
  return (
    <TrackerContext.Provider value={tracker}>
      {children}
    </TrackerContext.Provider>
  )
}

export const useTracker = () => {
  return useContext(TrackerContext)
}

const DOUBLE_HIT_THRESHOLD = 300
let lastTrackedPage, lastTrackTime
const enhancedTrackPage = (tracker, pageNameArg) => {
  let parentPage = getParentPage(lastTrackedPage)
  let pageName =
    typeof pageNameArg === 'function'
      ? pageNameArg(lastTrackedPage, parentPage)
      : pageNameArg

  if (pageName === false) {
    return
  }

  const trackTime = Date.now()
  if (
    lastTrackTime &&
    lastTrackedPage === pageName &&
    trackTime - lastTrackTime < DOUBLE_HIT_THRESHOLD
  ) {
    // Prevent double hits
    return
  }

  lastTrackTime = trackTime
  lastTrackedPage = pageName
  tracker.trackPage(pageName)
}

export const trackPage = pageName => {
  const tracker = getTracker()
  enhancedTrackPage(tracker, pageName)
}

export const trackParentPage = () => {
  const tracker = getTracker()
  enhancedTrackPage(tracker, (lastPage, parentPage) => {
    return parentPage
  })
}

export const useTrackPage = pageName => {
  const tracker = useTracker()

  useEffect(() => {
    if (!pageName || !tracker) {
      return
    }

    enhancedTrackPage(tracker, pageName)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

export const getPageLastPart = pageName => {
  if (!pageName) {
    return null
  }
  const lastIndex = pageName.lastIndexOf(':')
  return pageName.substring(lastIndex + 1)
}
export const getParentPage = pageName => {
  if (!pageName) {
    return null
  }
  const lastIndex = pageName.lastIndexOf(':')
  return pageName.substring(0, lastIndex)
}
