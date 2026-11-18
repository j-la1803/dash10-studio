// Preserve the approved outlined glyph paths; only remove frame and change canvas/fill.
import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
const original = await readFile('public/brand/logo/dash10-monogram-black.svg', 'utf8')
const group = original.match(/<g[\s\S]*<\/g>/)[0].replace(/fill="#[A-Fa-f0-9]+"/, 'fill="#000000"')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="28 28 104 104"><title>Dash 10</title>${group}</svg>`
await writeFile('public/favicon.svg', svg)
for (const size of [16, 32, 48, 180]) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(size === 180 ? 'public/apple-touch-icon.png' : `public/favicon-${size}.png`)
}
// ICO with a transparent PNG payload, supported by modern browsers.
const png = await readFile('public/favicon-32.png')
const header = Buffer.alloc(22)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)
header[6] = 32
header[7] = 32
header.writeUInt16LE(1, 10)
header.writeUInt16LE(32, 12)
header.writeUInt32LE(png.length, 14)
header.writeUInt32LE(22, 18)
await writeFile('public/favicon.ico', Buffer.concat([header, png]))
