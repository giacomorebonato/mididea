import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOTP } from 'better-auth/plugins'
import { prisma } from '../db'
import { env } from '../env'

const testOtpStore = new Map<string, string>()

export function getLastOtp(email: string): string | undefined {
  return testOtpStore.get(email)
}

export function clearLastOtp(email: string): void {
  testOtpStore.delete(email)
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp }) => {
        if (env.isProd) {
          const { Resend } = await import('resend')
          const resend = new Resend(env.RESEND_API_KEY)
          await resend.emails.send({
            from: env.RESEND_FROM_EMAIL,
            to: email,
            subject: 'Your verification code',
            text: `Your verification code is: ${otp}\n\nIt expires in 5 minutes.`,
          })
        } else if (process.env.NODE_ENV === 'test') {
          testOtpStore.set(email, otp)
        } else {
          console.log(`[DEV] OTP for ${email}: ${otp}`)
        }
      },
      otpLength: 6,
      expiresIn: 300,
    }),
  ],
})
