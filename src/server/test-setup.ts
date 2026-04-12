import { Database } from 'bun:sqlite'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../../generated/prisma/client.ts'

const migrationSql = readFileSync(
  join(
    import.meta.dir,
    '../../prisma/migrations/20260401081517_init/migration.sql',
  ),
  'utf-8',
)

export function createTestDb(name: string) {
  const dbPath = `${name}.db`

  // Use bun:sqlite to apply migrations
  const db = new Database(dbPath)
  db.exec(migrationSql)
  db.close()

  const url = `file:./${dbPath}`
  const adapter = new PrismaLibSql({ url })
  const prisma = new PrismaClient({ adapter })

  return {
    prisma,
    cleanup: async () => {
      await prisma.$disconnect()
      const { rm } = await import('node:fs/promises')
      await rm(dbPath, { force: true })
      await rm(`${dbPath}-journal`, { force: true })
    },
  }
}
