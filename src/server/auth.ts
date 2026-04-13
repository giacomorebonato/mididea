import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOTP } from 'better-auth/plugins'
import { prisma } from '../db'
import { env } from '../env'

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
        console.log(`[DEV] OTP for ${email}: ${otp}`)
      },
      otpLength: 6,
      expiresIn: 300,
    }),
  ],
})
