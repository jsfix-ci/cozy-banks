import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import useBreakpoints from 'cozy-ui/transpiled/react/hooks/useBreakpoints'

const useScrollToOnMount = (node, scrollTop, scrollLeft) => {
  useEffect(
    () => {
      if (node && scrollTop !== undefined) {
        node.scrollTop = scrollTop
      }
      if (node && scrollLeft !== undefined) {
        node.scrollLeft = scrollLeft
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}

const getMainNode = isMobile => {
  return isMobile
    ? document.scrollingElement || document.documentElement
    : document.querySelector('[role="main"]')
}

/**
 * Decorates a components so that it scrolls to the top of the main
 * scrolling container when mounted.
 */
const ScrollToTopOnMountWrapper = () => {
  const breakpoints = useBreakpoints()
  const node = getMainNode(breakpoints.isMobile)
  useScrollToOnMount(node, 0)
  return <Outlet />
}

export default ScrollToTopOnMountWrapper
