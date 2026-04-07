import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../generated/prisma/client.ts'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      emailVerified: true,
      posts: {
        create: [
          {
            title: 'Getting Started with Bun',
            content: 'Bun is an all-in-one JavaScript runtime & toolkit.',
            published: true,
          },
          {
            title: 'Type-Safe APIs with tRPC',
            content: 'tRPC lets you build end-to-end typesafe APIs.',
            published: true,
          },
        ],
      },
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob',
      emailVerified: true,
      posts: {
        create: [
          {
            title: 'Deploy to Fly.io',
            content:
              'Fly.io makes it easy to deploy full-stack apps close to your users.',
            published: true,
          },
          {
            title: 'Draft Post',
            content: "This is a draft that hasn't been published yet.",
            published: false,
          },
        ],
      },
    },
  })

  console.log(`Seeded: ${alice.name}, ${bob.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
