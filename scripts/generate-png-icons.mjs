import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([lenBuf, toCrc, crcBuf]);
}

function generatePng(width, height) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: 2 (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw pixel data: each scanline starts with filter byte 0 followed by width * 3 bytes (R, G, B)
  const rowLen = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowLen);
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Base background: #0B0F19 (11, 15, 25)
      let r = 11;
      let g = 15;
      let b = 25;

      if (dist < radius) {
        // Inner circle with emerald to cyan gradient
        const t = (x / width);
        // Emerald: 16, 185, 129
        // Cyan: 6, 182, 212
        if (dist > radius - 6) {
          // Glow border
          r = 6;
          g = 182;
          b = 212;
        } else if (dist < radius * 0.4) {
          // Center core
          r = 16;
          g = 185;
          b = 129;
        } else {
          // Gradient disc
          r = Math.round(16 * (1 - t) + 6 * t);
          g = Math.round(185 * (1 - t) + 182 * t);
          b = Math.round(129 * (1 - t) + 212 * t);
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve('public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), generatePng(192, 192));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), generatePng(512, 512));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), generatePng(512, 512));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), generatePng(180, 180));
console.log('PWA PNG icons generated successfully.');
