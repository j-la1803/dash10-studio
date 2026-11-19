import { expect, test } from '@playwright/test'

const baseURL = process.env.QA_BASE_URL || 'http://localhost:3000'

test('hero poster renders before decorative video transfer starts', async ({ page }) => {
  let releaseFont!: () => void
  const fontGate = new Promise<void>((resolve) => {
    releaseFont = resolve
  })
  await page.route('**/fonts/inter-semibold-latin.woff2', async (route) => {
    await fontGate
    await route.continue()
  })
  const mediaRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/videos/')) mediaRequests.push(request.url())
  })
  try {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
    const video = page.locator('.dash-hero-video')
    await expect(video).toHaveAttribute('poster', '/images/dash10-mountain.webp')
    await expect(page.locator('h1')).toBeVisible()
    expect(await video.getAttribute('src')).toBeNull()
    expect(mediaRequests).toEqual([])
    releaseFont()
    await page.waitForLoadState('load')
    await expect(video).toHaveAttribute('src', '/videos/dash-10-video-bg-faststart.mp4')
    await expect
      .poll(() => video.evaluate((node) => (node as HTMLVideoElement).readyState))
      .toBeGreaterThanOrEqual(2)
    expect(await video.evaluate((node) => (node as HTMLVideoElement).loop)).toBe(false)
  } finally {
    releaseFont()
  }
})

test('reduced motion keeps the poster without fetching decorative video', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const mediaRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/videos/')) mediaRequests.push(request.url())
  })
  await page.goto(baseURL)
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('.dash-hero-video')).not.toBeVisible()
  expect(await page.locator('.dash-hero-video').getAttribute('src')).toBeNull()
  expect(mediaRequests).toEqual([])
})
