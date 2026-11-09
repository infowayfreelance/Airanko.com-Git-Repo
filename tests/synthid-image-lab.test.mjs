import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../public/synthid-image-tool/index.html', import.meta.url), 'utf8')
const script = html.split('<script>')[1]?.split('</script>')[0] || ''
const part = (start, end) => {
  const i = script.indexOf(start), j = script.indexOf(end, i + start.length)
  assert(i >= 0 && j > i, 'Expected function source found')
  return script.slice(i, j)
}

test('image-only, private workflow and honest verification status', () => {
  assert.match(html, /PNG, JPG, WebP/)
  assert.match(html, /SynthID removal is <strong>not verified<\/strong>/)
  assert.match(html, /https:\/\/synthid\.com\//)
  assert.match(html, /No server uploads/)
  assert(!/fetch\(|XMLHttpRequest\(|sendBeacon\(/.test(script), 'No upload/network method in app script')
  assert.match(html, /Download all as ZIP/)
})

test('pixel processing preserves transparency and high decoded-image fidelity', () => {
  const source = part('const seedHash=', ' const toBlob=')
  const { reshape, calcQuality } = new Function(source + ';return {reshape,calcQuality}')()
  const width = 160, height = 100
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (i / 4) % 256
    data[i + 1] = 85
    data[i + 2] = 195
    data[i + 3] = i % 16 === 0 ? 0 : 255
  }
  const original = data.slice()
  reshape({ data }, width, height, 1.9, 121212)
  const quality = calcQuality(original, data)
  assert(quality.changedPct > 1, 'Pixel content must actually change')
  assert(quality.psnr > 38, 'Visual distortion should be small')
  for (let i = 3; i < data.length; i += 4) assert.equal(data[i], original[i], 'Alpha must stay unchanged')
})

test('batch ZIP has valid local and central directory headers', async () => {
  const source = part('const crcTable=', " $('download-all').addEventListener")
  const { zipFiles } = new Function("const fileOutputName=it=>it.name;" + source + ";return {zipFiles}")()
  const blob = await zipFiles([
    { name: 'one.png', blob: new Blob(['abc']) },
    { name: 'two.webp', blob: new Blob(['defg']) },
  ])
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const d = new DataView(bytes.buffer)
  assert.equal(d.getUint32(0, true), 0x04034b50)
  assert.equal(d.getUint32(bytes.length - 22, true), 0x06054b50)
  assert.equal(d.getUint16(bytes.length - 12, true), 2)
})
