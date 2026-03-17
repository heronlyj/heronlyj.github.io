import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const repoRoot = process.cwd()
const sourceDir = path.join(repoRoot, 'site-src')
const distDir = path.join(sourceDir, '.vitepress', 'dist')

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Missing source dir: ${sourceDir}`)
}

execSync('npm run docs:build', { stdio: 'inherit' })

if (!fs.existsSync(distDir)) {
  throw new Error(`Build output not found: ${distDir}`)
}

const preserve = new Set([
  '.git',
  'site-src',
  'node_modules',
  'package.json',
  'package-lock.json',
  '.gitignore',
  'README.md',
  'scripts'
])

for (const entry of fs.readdirSync(repoRoot)) {
  if (preserve.has(entry)) continue
  fs.rmSync(path.join(repoRoot, entry), { recursive: true, force: true })
}

copyDir(distDir, repoRoot)
fs.writeFileSync(path.join(repoRoot, '.nojekyll'), '')
console.log('Published VitePress output to repository root.')

function copyDir(src, dst) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const dstPath = path.join(dst, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(dstPath, { recursive: true })
      copyDir(srcPath, dstPath)
    } else {
      fs.mkdirSync(path.dirname(dstPath), { recursive: true })
      fs.copyFileSync(srcPath, dstPath)
    }
  }
}
