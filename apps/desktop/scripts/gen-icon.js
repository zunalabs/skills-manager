#!/usr/bin/env node
// Copies the branded app icon into electron-builder's expected location.
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const sourcePath = path.join(root, 'public', 'brand', 'app-icon.png')
const outDir = path.join(root, 'build')
const outPath = path.join(outDir, 'icon.png')

fs.mkdirSync(outDir, { recursive: true })
fs.copyFileSync(sourcePath, outPath)
console.log('Generated', outPath)
