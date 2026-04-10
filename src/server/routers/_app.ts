import { router } from '../trpc'
import { collaborationRouter } from './collaboration'
import { compositionRouter } from './composition'
import { postRouter } from './post'
import { userRouter } from './user'

export const appRouter = router({
  user: userRouter,
  post: postRouter,
  composition: compositionRouter,
  collaboration: collaborationRouter,
})

export type AppRouter = typeof appRouter
