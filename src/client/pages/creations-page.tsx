import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { authClient } from '../auth'
import { InvitationBanner } from '../components/invitation-banner'
import { trpc } from '../trpc'

export function CreationsPage() {
  const session = authClient.useSession()
  const userId = session.data?.user?.id

  const { data, isLoading, fetchNextPage, hasNextPage } =
    trpc.composition.list.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: (last) => last.nextCursor },
    )

  const compositions = data?.pages.flatMap((p) => p.items) ?? []
  const compositionIds = compositions.map((c) => c.id)

  const { data: likedIds = [] } = trpc.composition.myLikes.useQuery(
    { compositionIds },
    { enabled: !!userId && compositionIds.length > 0 },
  )

  const utils = trpc.useUtils()

  const toggleLike = trpc.composition.toggleLike.useMutation({
    onSuccess: () => {
      utils.composition.list.invalidate()
      utils.composition.myLikes.invalidate()
    },
  })

  const deleteComposition = trpc.composition.delete.useMutation({
    onSuccess: () => {
      utils.composition.list.invalidate()
      utils.composition.mine.invalidate()
    },
  })

  const handleLoad = (data: string) => {
    try {
      const state = JSON.parse(data)
      localStorage.setItem('mididea-sequencer-state', JSON.stringify(state))
      window.location.href = '/'
    } catch {
      // invalid data
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Creations</h1>
        <InvitationBanner />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Creations</h1>

      {compositions.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              No compositions yet. Create one from the sequencer!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {compositions.map((c) => {
            const isLiked = likedIds.includes(c.id)
            const isOwner = userId === c.authorId

            return (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    by {c.author.name ?? 'Anonymous'} ·{' '}
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardFooter className="gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike.mutate({ compositionId: c.id })}
                    disabled={!userId || toggleLike.isPending}
                  >
                    {isLiked ? '\u2764\ufe0f' : '\u2661'} {c.likeCount}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoad(c.data)}
                  >
                    Load
                  </Button>
                  {isOwner && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteComposition.mutate({ id: c.id })}
                      disabled={deleteComposition.isPending}
                    >
                      Delete
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
