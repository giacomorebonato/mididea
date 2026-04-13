import { useState } from 'react'
import { authClient } from '@/client/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AuthButtonProps {
  onSuccess?: () => void
}

export function AuthButton({ onSuccess }: AuthButtonProps) {
  const session = authClient.useSession()
  const [open, setOpen] = useState(false)
  const [flowState, setFlowState] = useState<
    'idle' | 'codeSent' | 'verifying' | 'done'
  >('idle')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (session.data?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {session.data.user.name ?? session.data.user.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            authClient.signOut().then(() => window.location.reload())
          }
        >
          Sign out
        </Button>
      </div>
    )
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      })
      if (result.error) {
        setError(result.error.message ?? 'Failed to send code')
        return
      }
      setFlowState('codeSent')
    } catch (_err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFlowState('verifying')

    try {
      const result = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      })
      if (result.error) {
        setError(result.error.message ?? 'Verification failed')
        setFlowState('codeSent')
        return
      }
      setFlowState('done')
      setOpen(false)
      setEmail('')
      setOtp('')
      setFlowState('idle')
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.reload()
      }
    } catch (_err) {
      setError('Something went wrong')
      setFlowState('codeSent')
    }
  }

  const handleClose = () => {
    setOpen(false)
    setFlowState('idle')
    setEmail('')
    setOtp('')
    setError('')
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Sign in
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          {flowState === 'idle' && (
            <form
              onSubmit={handleSendCode}
              className="bg-card border rounded-xl p-6 w-full max-w-sm space-y-4"
            >
              <h2 className="text-lg font-semibold">Sign in</h2>
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send code'}
                </Button>
              </div>
            </form>
          )}

          {(flowState === 'codeSent' || flowState === 'verifying') && (
            <form
              onSubmit={handleVerify}
              className="bg-card border rounded-xl p-6 w-full max-w-sm space-y-4"
            >
              <h2 className="text-lg font-semibold">Enter code</h2>
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to {email}
              </p>
              <div className="space-y-2">
                <Label htmlFor="auth-otp">Verification code</Label>
                <Input
                  id="auth-otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={flowState === 'verifying'}>
                  {flowState === 'verifying' ? 'Verifying...' : 'Verify'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFlowState('idle')
                    setOtp('')
                    setError('')
                  }}
                >
                  Use a different email
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  )
}
