import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '../auth'

interface AuthInlineProps {
  onSuccess: () => void
}

export function AuthInline({ onSuccess }: AuthInlineProps) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const handleSendCode = async () => {
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
      setCodeSent(true)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await authClient.emailOtp.verifyEmail({ email, otp })
      if (result.error) {
        setError(result.error.message ?? 'Invalid code')
        return
      }
      onSuccess()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!codeSent) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="inline-email">Email</Label>
          <Input
            id="inline-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          className="w-full"
          onClick={handleSendCode}
          disabled={loading || !email.trim()}
        >
          {loading ? 'Sending...' : 'Send code'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Code sent to {email}</p>
      <div className="space-y-2">
        <Label htmlFor="inline-otp">Code</Label>
        <Input
          id="inline-otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          maxLength={6}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        className="w-full"
        onClick={handleVerify}
        disabled={loading || otp.length < 6}
      >
        {loading ? 'Verifying...' : 'Verify'}
      </Button>
    </div>
  )
}
