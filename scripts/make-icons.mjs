import { deflateSync } from "node:zlib"
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const letters = {
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#", "#...#", "#...#"],
  B: ["###..", "#..#.", "###..", "#..#.", "#..#.", "#..#.", "###.."],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const name = Buffer.from(type)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])))
  return Buffer.concat([length, name, data, crc])
}

function png(size) {
  const rows = []
  const scale = Math.max(1, Math.floor(size / 32))
  const text = "MBA"
  const glyphWidth = 5 * scale
  const gap = scale
  const textWidth = text.length * glyphWidth + (text.length - 1) * gap
  const textHeight = 7 * scale
  const originX = Math.floor((size - textWidth) / 2)
  const originY = Math.floor((size - textHeight) / 2)

  for (let y = 0; y < size; y += 1) {
    const row = Buffer.alloc(1 + size * 3)
    for (let x = 0; x < size; x += 1) {
      let on = false
      const glyphY = Math.floor((y - originY) / scale)
      if (glyphY >= 0 && glyphY < 7) {
        let cursor = originX
        for (const character of text) {
          const glyphX = Math.floor((x - cursor) / scale)
          if (glyphX >= 0 && glyphX < 5 && letters[character][glyphY][glyphX] === "#") {
            on = true
          }
          cursor += glyphWidth + gap
        }
      }
      const offset = 1 + x * 3
      const color = on ? 255 : 17
      row[offset] = color
      row[offset + 1] = color
      row[offset + 2] = color
    }
    rows.push(row)
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 2
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    signature,
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public")
writeFileSync(join(publicDir, "icon-192.png"), png(192))
writeFileSync(join(publicDir, "icon-512.png"), png(512))
writeFileSync(join(publicDir, "apple-touch-icon.png"), png(180))
