// Load a self-contained content/*.ts module from plain Node (no bundler, Node 20).
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import ts from 'typescript'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export async function loadTs(rel) {
  const src = await readFile(path.join(ROOT, rel), 'utf8')
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  })
  const dir = path.join(ROOT, 'node_modules', '.cache', 'cc-content')
  await mkdir(dir, { recursive: true })
  const out = path.join(dir, path.basename(rel).replace(/\.ts$/, '') + '-' + Date.now() + '.mjs')
  await writeFile(out, outputText)
  try {
    return await import(pathToFileURL(out).href)
  } finally {
    await rm(out, { force: true })
  }
}

export function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    try { process.loadEnvFile(path.join(ROOT, f)) } catch {}
  }
}
