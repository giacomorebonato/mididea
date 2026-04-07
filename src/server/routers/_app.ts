import { router } from '../trpc'
import { compositionRouter } from './composition'
import { postRouter } from './post'
import { userRouter } from './user'

export const appRouter = router({
  user: userRouter,
  post: postRouter,
  composition: compositionRouter,
})

export type AppRouter = typeof appRouter
