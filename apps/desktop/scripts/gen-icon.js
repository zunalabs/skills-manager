#!/usr/bin/env node
// Converts public/icon.svg → build/icon.png (1024×1024) for electron-builder
const { Resvg } = require('@resvg/resvg-js')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const svgPath = path.join(root, 'public', 'icon.svg')
const outDir = path.join(root, 'build')
const outPath = path.join(outDir, 'icon.png')

const svg = fs.readFileSync(svgPath)
const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1024 } })
const pngData = resvg.render()
const pngBuffer = pngData.asPng()

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(outPath, pngBuffer)
console.log('Generated', outPath)
