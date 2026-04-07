const isProd = process.env.NODE_ENV === 'production'

function required(name: string): string {
  const value = process.env[name]
  if (!value && isProd) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value ?? ''
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  BETTER_AUTH_SECRET: isProd
    ? required('BETTER_AUTH_SECRET')
    : (process.env.BETTER_AUTH_SECRET ??
      'dev-secret-change-in-production-min-32-chars'),
  BETTER_AUTH_URL: isProd
    ? required('BETTER_AUTH_URL')
    : (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'),
  isProd,
} as const
