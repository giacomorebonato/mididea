#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import path from 'node:path'
/**
 * Frontend build script — useful for inspecting production output.
 * In production, Bun.serve() handles HTML imports with automatic
 * caching and minification, so a separate build step is optional.
 */
import plugin from 'bun-plugin-tailwind'

const outdir = path.join(process.cwd(), 'dist')

if (existsSync(outdir)) {
  await rm(outdir, { recursive: true, force: true })
}

console.log('\nBuilding frontend...\n')

const start = performance.now()

const entrypoints = [...new Bun.Glob('**/*.html').scanSync('src')]
  .map((f) => path.resolve('src', f))
  .filter((f) => !f.includes('node_modules'))

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [plugin],
  minify: true,
  target: 'browser',
  sourcemap: 'linked',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
})

if (!result.success) {
  console.error('Build failed:')
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const table = result.outputs.map((o) => ({
  File: path.relative(process.cwd(), o.path),
  Type: o.kind,
  Size: formatSize(o.size),
}))

console.table(table)
console.log(
  `\nBuild completed in ${(performance.now() - start).toFixed(0)}ms\n`,
)
