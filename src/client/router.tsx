import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { CreationsPage } from './pages/creations-page'
import { RootLayout } from './pages/root-layout'
import { SequencerPage } from './sequencer/sequencer-page'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SequencerPage,
})

const creationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/creations',
  component: CreationsPage,
})

const routeTree = rootRoute.addChildren([indexRoute, creationsRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
