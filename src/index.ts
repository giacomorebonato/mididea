import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { serve } from 'bun'
import { env } from './env'
import index from './index.html'
import { auth, getLastOtp } from './server/auth'
import { createContext } from './server/context'
import { appRouter } from './server/routers/_app'

const testRoutes: Record<string, (req: Request) => Response> =
  process.env.NODE_ENV === 'test'
    ? {
        '/api/test/last-otp': (req: Request) => {
          const url = new URL(req.url)
          const email = url.searchParams.get('email')
          if (!email) {
            return Response.json(
              { error: 'email query param required' },
              { status: 400 },
            )
          }
          const otp = getLastOtp(email)
          if (!otp) {
            return Response.json({ error: 'no otp found' }, { status: 404 })
          }
          return Response.json({ otp })
        },
      }
    : {}

const server = serve({
  port: env.PORT,
  hostname: '0.0.0.0',
  routes: {
    '/api/health': () => Response.json({ status: 'ok' }),

    '/api/auth/*': (req) => auth.handler(req),

    '/api/trpc/*': (req) =>
      fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: () => createContext({ req }),
      }),

    ...testRoutes,

    '/*': index,
  },

  development: !env.isProd && {
    hmr: true,
    console: true,
  },
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...')
  server.stop()
  process.exit(0)
})

console.log(`Server running at ${server.url}`)
