import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

// This route drives a real (headless) Chromium tab server-side instead of
// relying on the visitor's own screen-capture pipeline. That guarantees the
// exact requested resolution and a consistent frame rate regardless of the
// visitor's screen size, browser, or GPU — the limitation that capped
// quality in the client-side (getDisplayMedia) recording mode.
export const maxDuration = 290

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

type DeviceId = 'desktop' | 'tablet' | 'mobile'

const DEVICES: Record<DeviceId, { width: number; height: number }> = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 820, height: 1080 },
  mobile: { width: 390, height: 780 },
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export async function POST(req: NextRequest) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null
  let workDir: string | null = null

  try {
    const body = await req.json()
    const rawUrl: string = (body.url ?? '').trim()
    const deviceId: DeviceId = ['desktop', 'tablet', 'mobile'].includes(body.device)
      ? body.device
      : 'desktop'
    const duration = Math.min(60, Math.max(10, Number(body.duration) || 20))
    const easing: 'smooth' | 'linear' = body.easing === 'linear' ? 'linear' : 'smooth'

    if (!rawUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let pageUrl: URL
    try {
      pageUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
    if (!['http:', 'https:'].includes(pageUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are supported' }, { status: 400 })
    }

    const dev = DEVICES[deviceId]

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: { width: dev.width, height: dev.height, deviceScaleFactor: 1 },
    })

    const page = await browser.newPage()
    await page.setViewport({ width: dev.width, height: dev.height, deviceScaleFactor: 1 })
    await page.setUserAgent(UA)

    try {
      await page.goto(pageUrl.href, { waitUntil: 'networkidle2', timeout: 25000 })
    } catch {
      // Some sites never go fully idle (polling/analytics); fall back to a
      // looser wait condition rather than failing the whole recording.
      await page.goto(pageUrl.href, { waitUntil: 'domcontentloaded', timeout: 25000 })
    }

    // Let fonts/lazy images settle before measuring/capturing.
    await new Promise((resolve) => setTimeout(resolve, 800))

    const scrollHeight: number = await page.evaluate(() => document.documentElement.scrollHeight)
    const scrollDistance = Math.max(0, scrollHeight - dev.height)

    // The video's playback duration is fixed by (totalFrames / fps), not by
    // how long capture takes — so frames can be captured as fast as the
    // server can produce them. Frame rate is scaled down for longer clips
    // purely to keep the total number of page.screenshot() calls (and thus
    // wall-clock render time) bounded within the function's time budget.
    const MAX_TOTAL_FRAMES = 600
    const fps = Math.max(8, Math.min(24, Math.round(MAX_TOTAL_FRAMES / duration)))
    const totalFrames = Math.max(1, Math.round(duration * fps))

    workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-render-'))

    for (let i = 0; i < totalFrames; i++) {
      const t = totalFrames === 1 ? 1 : i / (totalFrames - 1)
      const eased = easing === 'smooth' ? easeInOut(t) : t
      const scrollTop = Math.round(eased * scrollDistance)
      await page.evaluate((y) => window.scrollTo(0, y), scrollTop)
      const framePath = path.join(workDir, `frame-${String(i).padStart(5, '0')}.jpg`)
      await page.screenshot({ path: framePath as `${string}.jpeg`, type: 'jpeg', quality: 90 })
    }

    await browser.close()
    browser = null

    const outputPath = path.join(workDir, 'output.mp4')
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(path.join(workDir!, 'frame-%05d.jpg'))
        .inputOptions([`-framerate ${fps}`])
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-movflags +faststart',
          '-preset veryfast',
          '-crf 18',
        ])
        .on('error', reject)
        .on('end', () => resolve())
        .save(outputPath)
    })

    const videoBuffer = await fs.readFile(outputPath)
    return new NextResponse(new Uint8Array(videoBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="portfolio-recording.mp4"',
        'Content-Length': String(videoBuffer.length),
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server render failed' }, { status: 500 })
  } finally {
    if (browser) {
      try {
        await browser.close()
      } catch {}
    }
    if (workDir) {
      try {
        await fs.rm(workDir, { recursive: true, force: true })
      } catch {}
    }
  }
}
