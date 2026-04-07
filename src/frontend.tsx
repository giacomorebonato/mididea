import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getTRPCClientOptions, queryClient } from './client/query-client'
import { router } from './client/router'
import { trpc } from './client/trpc'
import { OrientationProvider } from './client/sequencer/orientation-context'
import './index.css'

const trpcClient = trpc.createClient(getTRPCClientOptions())

function App() {
  return (
    <StrictMode>
      <OrientationProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </trpc.Provider>
      </OrientationProvider>
    </StrictMode>
  )
}

// biome-ignore lint/style/noNonNullAssertion: root element always exists in index.html
const elem = document.getElementById('root')!

if (import.meta.hot) {
  // biome-ignore lint/suspicious/noAssignInExpressions: Bun HMR pattern for persisting root across hot reloads
  const root = (import.meta.hot.data.root ??= createRoot(elem))
  root.render(<App />)
} else {
  createRoot(elem).render(<App />)
}
