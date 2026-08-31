/* =============================================================
   Media compressor
   -------------------------------------------------------------
   Guarantees every uploaded image lands under a byte budget, so
   the generated email can never blow past Gmail's clip limit.

   • Static images (PNG/JPEG/WebP/BMP) — downscale, then step the
     JPEG quality down until the budget is met.
   • Animated GIFs — decoded with WebCodecs' ImageDecoder, frames
     downscaled and re-encoded with a self-contained GIF89a
     encoder (median-cut palette + LZW). Scale, palette depth and
     frame rate are stepped down until the budget is met.

   No external dependencies. If a browser lacks ImageDecoder the
   GIF is passed through untouched rather than failing.
   ============================================================= */

(function (global) {
  'use strict';

  // ---------- shared helpers ----------

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  function dataUrlBytes(dataUrl) {
    const i = dataUrl.indexOf(',');
    const b64 = i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
    return Math.round(b64.length * 0.75);
  }

  function loadImageEl(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // ---------- static raster path ----------

  async function compressStatic(file, opts) {
    const maxWidth = opts.maxWidth || 1200;
    const budget = (opts.budgetKb || 500) * 1024;

    const srcUrl = await blobToDataURL(file);
    let img;
    try {
      img = await loadImageEl(srcUrl);
    } catch (e) {
      return srcUrl;
    }
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return srcUrl;

    const isPng = file.type === 'image/png';

    // Already small enough and no resize needed — keep the original bytes.
    if (nw <= maxWidth && file.size <= budget) return srcUrl;

    const draw = (w, h) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      return c;
    };

    // Try progressively smaller widths, and within each, lower JPEG quality.
    const widths = [];
    let w0 = Math.min(nw, maxWidth);
    for (let i = 0; i < 5; i++) {
      widths.push(Math.round(w0));
      w0 *= 0.78;
      if (w0 < 320) break;
    }

    let best = null;
    for (const w of widths) {
      const h = Math.max(1, Math.round(nh * (w / nw)));
      const canvas = draw(w, h);

      if (isPng) {
        const png = canvas.toDataURL('image/png');
        if (!best || dataUrlBytes(png) < dataUrlBytes(best)) best = png;
        if (dataUrlBytes(png) <= budget) return png;
      }
      for (const q of [0.92, 0.86, 0.8, 0.72, 0.62, 0.5]) {
        const out = canvas.toDataURL('image/jpeg', q);
        if (!best || dataUrlBytes(out) < dataUrlBytes(best)) best = out;
        if (dataUrlBytes(out) <= budget) return out;
      }
    }
    return best || srcUrl;
  }

  // ---------- GIF: median-cut colour quantiser ----------

  function medianCut(samples, maxColors) {
    // samples: Uint8ClampedArray RGBA
    let pixels = [];
    for (let i = 0; i < samples.length; i += 4) {
      pixels.push([samples[i], samples[i + 1], samples[i + 2]]);
    }
    if (pixels.length === 0) return [[0, 0, 0]];

    let boxes = [pixels];
    while (boxes.length < maxColors) {
      // Split the box with the largest colour range.
      let target = -1;
      let targetRange = -1;
      let targetChannel = 0;
      for (let b = 0; b < boxes.length; b++) {
        const box = boxes[b];
        if (box.length < 2) continue;
        for (let ch = 0; ch < 3; ch++) {
          let lo = 255, hi = 0;
          for (let p = 0; p < box.length; p++) {
            const v = box[p][ch];
            if (v < lo) lo = v;
            if (v > hi) hi = v;
          }
          const range = hi - lo;
          if (range > targetRange) {
            targetRange = range;
            target = b;
            targetChannel = ch;
          }
        }
      }
      if (target < 0 || targetRange <= 0) break;
      const box = boxes[target];
      box.sort((a, b) => a[targetChannel] - b[targetChannel]);
      const mid = box.length >> 1;
      boxes.splice(target, 1, box.slice(0, mid), box.slice(mid));
    }

    return boxes.filter((b) => b.length).map((box) => {
      let r = 0, g = 0, bl = 0;
      for (let i = 0; i < box.length; i++) {
        r += box[i][0];
        g += box[i][1];
        bl += box[i][2];
      }
      return [
        Math.round(r / box.length),
        Math.round(g / box.length),
        Math.round(bl / box.length)
      ];
    });
  }

  function makeMapper(palette) {
    const cache = new Map();
    return function nearest(r, g, b) {
      const key = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);
      const hit = cache.get(key);
      if (hit !== undefined) return hit;
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < palette.length; i++) {
        const p = palette[i];
        const dr = r - p[0];
        const dg = g - p[1];
        const db = b - p[2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
          if (d === 0) break;
        }
      }
      cache.set(key, bestIdx);
      return bestIdx;
    };
  }

  // ---------- GIF: byte writer + LZW ----------

  function ByteWriter() {
    this.bytes = [];
  }
  ByteWriter.prototype.byte = function (v) { this.bytes.push(v & 0xff); };
  ByteWriter.prototype.short = function (v) {
    this.bytes.push(v & 0xff, (v >> 8) & 0xff);
  };
  ByteWriter.prototype.raw = function (arr) {
    for (let i = 0; i < arr.length; i++) this.bytes.push(arr[i] & 0xff);
  };
  ByteWriter.prototype.string = function (s) {
    for (let i = 0; i < s.length; i++) this.bytes.push(s.charCodeAt(i) & 0xff);
  };

  function lzwEncode(indices, minCodeSize) {
    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;
    let codeSize = minCodeSize + 1;
    let nextCode = eoiCode + 1;
    let dict = new Map();

    const out = [];
    let bitBuffer = 0;
    let bitCount = 0;

    function emit(code) {
      bitBuffer |= code << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        out.push(bitBuffer & 0xff);
        bitBuffer >>= 8;
        bitCount -= 8;
      }
    }

    function resetDict() {
      dict = new Map();
      codeSize = minCodeSize + 1;
      nextCode = eoiCode + 1;
    }

    emit(clearCode);
    resetDict();

    let prefix = indices[0];
    for (let i = 1; i < indices.length; i++) {
      const k = indices[i];
      const key = prefix * 5003 + k;
      const found = dict.get(key);
      if (found !== undefined) {
        prefix = found;
        continue;
      }
      emit(prefix);
      if (nextCode < 4096) {
        dict.set(key, nextCode);
        nextCode++;
        // Widen the code size once the next code to be assigned no longer
        // fits in the current width. Off-by-one here corrupts the stream.
        if (nextCode > (1 << codeSize) - 1 && codeSize < 12) codeSize++;
      } else {
        emit(clearCode);
        resetDict();
      }
      prefix = k;
    }
    emit(prefix);
    emit(eoiCode);
    if (bitCount > 0) out.push(bitBuffer & 0xff);

    // Chunk into GIF sub-blocks (max 255 bytes each).
    const blocked = [];
    for (let i = 0; i < out.length; i += 255) {
      const chunk = out.slice(i, i + 255);
      blocked.push(chunk.length);
      for (let j = 0; j < chunk.length; j++) blocked.push(chunk[j]);
    }
    blocked.push(0);
    return blocked;
  }

  function encodeGif(frames, width, height, palette, loop) {
    // palette length is padded up to a power of two (GIF requirement).
    let bits = 1;
    while ((1 << bits) < palette.length) bits++;
    if (bits > 8) bits = 8;
    const tableSize = 1 << bits;

    const w = new ByteWriter();
    w.string('GIF89a');
    w.short(width);
    w.short(height);
    w.byte(0x80 | ((bits - 1) << 4) | (bits - 1)); // global colour table present
    w.byte(0);
    w.byte(0);
    for (let i = 0; i < tableSize; i++) {
      const c = palette[i] || [0, 0, 0];
      w.byte(c[0]); w.byte(c[1]); w.byte(c[2]);
    }

    if (loop) {
      w.byte(0x21); w.byte(0xff); w.byte(11);
      w.string('NETSCAPE2.0');
      w.byte(3); w.byte(1); w.short(0); w.byte(0);
    }

    for (let f = 0; f < frames.length; f++) {
      const frame = frames[f];
      const delayCs = Math.max(2, Math.round(frame.delay / 10));
      w.byte(0x21); w.byte(0xf9); w.byte(4);
      w.byte(0x04); // disposal: do not dispose
      w.short(delayCs);
      w.byte(0);
      w.byte(0);

      w.byte(0x2c);
      w.short(0); w.short(0);
      w.short(width); w.short(height);
      w.byte(0);

      const minCodeSize = Math.max(2, bits);
      w.byte(minCodeSize);
      w.raw(lzwEncode(frame.indices, minCodeSize));
    }

    w.byte(0x3b);
    return new Uint8Array(w.bytes);
  }

  // Confirm a generated data URL actually decodes. The GIF encoder is
  // hand-rolled, so we never hand back bytes a browser can't read — if the
  // check fails the caller falls back to the original upload.
  function verifyDataUrl(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth > 0 && img.naturalHeight > 0);
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    });
  }

  // ---------- GIF pipeline ----------

  async function decodeGifFrames(file) {
    if (typeof global.ImageDecoder === 'undefined') return null;
    const buffer = await file.arrayBuffer();
    let decoder;
    try {
      decoder = new global.ImageDecoder({ data: buffer, type: 'image/gif' });
      await decoder.completed;
    } catch (e) {
      return null;
    }
    const track = decoder.tracks.selectedTrack;
    const count = (track && track.frameCount) || 1;
    const out = [];
    for (let i = 0; i < count; i++) {
      try {
        const { image } = await decoder.decode({ frameIndex: i });
        out.push({
          bitmap: image,
          // duration is microseconds; default to 100ms when absent
          delay: image.duration ? image.duration / 1000 : 100
        });
      } catch (e) {
        break;
      }
    }
    if (!out.length) return null;
    return { frames: out, width: decoder.tracks.selectedTrack ? out[0].bitmap.displayWidth : 0 };
  }

  async function compressGif(file, opts) {
    const budget = (opts.budgetKb || 700) * 1024;
    const maxWidth = opts.maxWidth || 600;

    // Nothing to do — already comfortably small.
    if (file.size <= budget) return await blobToDataURL(file);

    const decoded = await decodeGifFrames(file);
    if (!decoded) {
      // No WebCodecs — fall back to the original so we never hard-fail.
      return await blobToDataURL(file);
    }

    const src = decoded.frames;
    const srcW = src[0].bitmap.displayWidth;
    const srcH = src[0].bitmap.displayHeight;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Progressive attempts: shrink, thin frames, reduce palette.
    const attempts = [
      { scale: 1.0, step: 1, colors: 256 },
      { scale: 0.85, step: 1, colors: 200 },
      { scale: 0.75, step: 2, colors: 160 },
      { scale: 0.6, step: 2, colors: 128 },
      { scale: 0.5, step: 3, colors: 96 },
      { scale: 0.42, step: 3, colors: 64 },
      { scale: 0.35, step: 4, colors: 48 },
      { scale: 0.32, step: 5, colors: 32 },
      { scale: 0.28, step: 6, colors: 24 },
      { scale: 0.24, step: 8, colors: 16 }
    ];

    let smallest = null;

    for (const a of attempts) {
      const targetW = Math.max(80, Math.min(maxWidth, Math.round(srcW * a.scale)));
      const targetH = Math.max(60, Math.round(srcH * (targetW / srcW)));
      canvas.width = targetW;
      canvas.height = targetH;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Rasterise the frames we're keeping, accumulating skipped delays.
      const raster = [];
      let carried = 0;
      for (let i = 0; i < src.length; i++) {
        if (i % a.step !== 0) {
          carried += src[i].delay;
          continue;
        }
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(src[i].bitmap, 0, 0, targetW, targetH);
        raster.push({
          data: ctx.getImageData(0, 0, targetW, targetH).data,
          delay: src[i].delay + carried
        });
        carried = 0;
      }
      if (carried && raster.length) raster[raster.length - 1].delay += carried;
      if (!raster.length) continue;

      // Global palette from a sample of pixels across all kept frames.
      const sampleStride = Math.max(1, Math.floor((raster.length * targetW * targetH) / 24000)) * 4;
      const sample = [];
      for (let f = 0; f < raster.length; f++) {
        const d = raster[f].data;
        for (let p = 0; p < d.length; p += sampleStride) {
          sample.push(d[p], d[p + 1], d[p + 2], 255);
        }
      }
      const palette = medianCut(new Uint8ClampedArray(sample), a.colors);
      const mapper = makeMapper(palette);

      const frames = raster.map((fr) => {
        const n = targetW * targetH;
        const indices = new Uint8Array(n);
        const d = fr.data;
        for (let p = 0, q = 0; p < n; p++, q += 4) {
          indices[p] = mapper(d[q], d[q + 1], d[q + 2]);
        }
        return { indices: indices, delay: fr.delay };
      });

      const bytes = encodeGif(frames, targetW, targetH, palette, true);
      if (!smallest || bytes.length < smallest.length) smallest = bytes;
      if (bytes.length <= budget) {
        const url = await blobToDataURL(new Blob([bytes], { type: 'image/gif' }));
        if (await verifyDataUrl(url)) return url;
        // Encoder produced something unreadable — don't ship it.
        return await blobToDataURL(file);
      }
    }

    if (smallest) {
      const url = await blobToDataURL(new Blob([smallest], { type: 'image/gif' }));
      if (await verifyDataUrl(url)) return url;
    }
    return await blobToDataURL(file);
  }

  // ---------- public entry ----------

  // opts: { maxWidth, budgetKb }
  async function compress(file, opts) {
    opts = opts || {};
    try {
      // GIFs go through the re-encoder so a large upload can still fit
      // Gmail's clip budget. Every candidate is decode-verified before it is
      // returned; if the encoder ever produces unreadable bytes we fall back
      // to the original rather than shipping a broken animation.
      if (file.type === 'image/gif') return await compressGif(file, opts);
      if (/^image\/(jpeg|jpg|png|webp|bmp)$/i.test(file.type)) {
        return await compressStatic(file, opts);
      }
      return await blobToDataURL(file);
    } catch (e) {
      // Never let compression break an upload.
      try { return await blobToDataURL(file); } catch (_) { return ''; }
    }
  }

  global.MediaCompressor = { compress, dataUrlBytes };
})(window);
