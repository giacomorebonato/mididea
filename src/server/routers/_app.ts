import { router } from '../trpc'
import { collaborationRouter } from './collaboration'
import { compositionRouter } from './composition'
import { userRouter } from './user'

export const appRouter = router({
  user: userRouter,
  composition: compositionRouter,
  collaboration: collaborationRouter,
})

export type AppRouter = typeof appRouter
