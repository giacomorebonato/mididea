import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getTRPCClientOptions, queryClient } from './client/query-client'
import { router } from './client/router'
import { OrientationProvider } from './client/sequencer/orientation-context'
import { trpc } from './client/trpc'
import { ErrorBoundary } from './components/error-boundary'
import './index.css'

const trpcClient = trpc.createClient(getTRPCClientOptions())

function App() {
  return (
    <StrictMode>
      <ErrorBoundary>
        <OrientationProvider>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
            </QueryClientProvider>
          </trpc.Provider>
        </OrientationProvider>
      </ErrorBoundary>
    </StrictMode>
  )
}

const elem = document.getElementById('root')!

if (import.meta.hot) {
  // biome-ignore lint/suspicious/noAssignInExpressions: Bun HMR pattern for persisting root across hot reloads
  const root = (import.meta.hot.data.root ??= createRoot(elem))
  root.render(<App />)
} else {
  createRoot(elem).render(<App />)
}
