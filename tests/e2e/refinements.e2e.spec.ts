import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3000'

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`approved dividers, unified navigation and Milwaukee footer at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto(base)
    await expect(page.locator('.scene-progress')).toHaveCount(1)
    await expect(page.locator('.scene-progress-track')).toHaveCount(1)
    await expect(page.locator('.scene-progress a')).toHaveCount(4)
    await expect(page.locator('.scene-rule')).toHaveCount(0)
    expect(
      await page
        .locator('.scene-copy')
        .evaluateAll((els) =>
          els.every(
            (el) =>
              getComputedStyle(el).borderLeftWidth === '0px' &&
              getComputedStyle(el, ':before').content === 'none' &&
              getComputedStyle(el, ':after').content === 'none',
          ),
        ),
    ).toBe(true)
    expect(
      await page
        .locator('.platform-section,.studio-capabilities')
        .evaluateAll((els) =>
          els.every(
            (el) =>
              getComputedStyle(el).borderTopWidth === '0px' &&
              getComputedStyle(el).borderBottomWidth === '0px',
          ),
        ),
    ).toBe(true)
    expect(
      await page
        .locator('.platform-grid>div')
        .evaluateAll((els) => els.every((el) => getComputedStyle(el).borderBottomWidth === '1px')),
    ).toBe(true)
    expect(
      await page
        .locator('.studio-window')
        .evaluateAll((els) => els.every((el) => getComputedStyle(el).borderTopWidth === '1px')),
    ).toBe(true)
    await expect(page.locator('.footer-bottom')).toHaveCSS('border-top-width', '1px')
    const location = page.locator('.footer-contact')
    await expect(location).toContainText('BASED IN')
    await expect(location).toContainText('MILWAUKEE, WI')
    await expect(location).toContainText('43.0389° N / 87.9065° W')
    await expect(location.locator('svg.lucide-beer')).toHaveCount(1)
    await expect(location.locator('svg')).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator('.studio-footer a[href^="mailto:"]')).toHaveCount(0)
    await expect(page.locator('.footer-columns>div,.footer-columns>nav')).toHaveCount(4)
    await location.scrollIntoViewIfNeeded()
    const boxes = await location
      .locator('.footer-location,.footer-coordinates')
      .evaluateAll((els) =>
        els.map((el) => ({
          top: el.getBoundingClientRect().top,
          bottom: el.getBoundingClientRect().bottom,
          right: el.getBoundingClientRect().right,
        })),
      )
    expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom)
    expect(boxes[1].right).toBeLessThanOrEqual(viewport.width)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.locator('.footer-studio a[href="/contact"]').click()
    await expect(page.getByRole('button', { name: 'SEND PROJECT INQUIRY' })).toBeVisible()
  })
}

test('original mountain plays once at 0.3 and holds its final frame', async ({ page }) => {
  await page.goto(base)
  const video = page.locator('video')
  await expect(video).toHaveAttribute('src', '/videos/dash-10-video-bg-faststart.mp4')
  await expect
    .poll(() => video.evaluate((node) => (node as HTMLVideoElement).readyState))
    .toBeGreaterThanOrEqual(2)
  expect(
    await video.evaluate((node) => {
      const v = node as HTMLVideoElement
      return {
        loop: v.loop,
        muted: v.muted,
        inline: v.playsInline,
        rate: v.playbackRate,
        width: v.videoWidth,
      }
    }),
  ).toEqual({ loop: false, muted: true, inline: true, rate: 0.3, width: 1438 })
  await video.evaluate(async (node) => {
    const v = node as HTMLVideoElement
    v.currentTime = v.duration - 0.2
    await v.play()
  })
  await expect.poll(() => video.evaluate((node) => (node as HTMLVideoElement).ended)).toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.waitForTimeout(500)
  expect(
    await video.evaluate((node) => {
      const v = node as HTMLVideoElement
      return v.paused && v.ended && Math.abs(v.duration - v.currentTime) < 0.01
    }),
  ).toBe(true)
})

test('marquee moves, pauses for hover/focus, and becomes scrollable with reduced motion', async ({
  page,
}) => {
  await page.goto(base)
  const row = page.locator('.platform-marquee')
  const track = page.locator('.platform-track')
  await expect(page.locator('.platform-grid[aria-hidden="true"] > div')).toHaveCount(8)
  const transform = () => track.evaluate((el) => getComputedStyle(el).transform)
  const geometry = await page.locator('.platform-grid').evaluateAll((groups) =>
    groups.map((group) => ({
      width: group.getBoundingClientRect().width,
      cell: group.firstElementChild!.getBoundingClientRect().width,
      labels: group.textContent,
    })),
  )
  expect(geometry[0].labels).toBe(geometry[1].labels)
  expect(geometry[0].width).toBeCloseTo(geometry[1].width, 2)
  expect(geometry[0].cell).toBeCloseTo(await page.evaluate(() => innerWidth / 5), 1)
  const first = await transform()
  await expect.poll(transform).not.toBe(first)
  await row.hover()
  await expect(track).toHaveCSS('animation-play-state', 'paused')
  await page.mouse.move(0, 0)
  await row.focus()
  await expect(track).toHaveCSS('animation-play-state', 'paused')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(track).toHaveCSS('animation-name', 'none')
  await expect(row).toHaveCSS('overflow-x', 'auto')
  await row.evaluate((el) => {
    el.scrollLeft = 200
  })
  expect(await row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100)
})

test('header underlines reveal on keyboard focus and FAQ uses a minus when expanded', async ({
  page,
}) => {
  await page.goto(base)
  const link = page.locator('.studio-header nav a').first()
  await link.focus()
  await expect
    .poll(() => link.evaluate((el) => getComputedStyle(el, '::after').transform))
    .toBe('matrix(1, 0, 0, 1, 0, 0)')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const summary = page.locator('.capabilities-list summary').first()
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.capabilities-list details').first()).toHaveAttribute('open', '')
  expect(
    await summary
      .locator('.faq-toggle')
      .evaluate((el) => getComputedStyle(el, '::after').transform),
  ).toBe('matrix(1, 0, 0, 1, 0, 0)')
  await page.keyboard.press('Enter')
  await expect(page.locator('.capabilities-list details').first()).not.toHaveAttribute('open', '')
})

test('editorial FAQ introduction and CTA work; story gaps are reduced by 17.5 percent', async ({
  page,
}) => {
  await page.goto(base)
  await expect(page.locator('.capabilities-description')).toHaveText(
    'From custom development to connected systems, we handle the technical work so you can focus on running your business.',
  )
  const padding = await page.locator('.scene-sticky').evaluateAll((els) =>
    els.map((el) => ({
      top: parseFloat(getComputedStyle(el).paddingTop),
      bottom: parseFloat(getComputedStyle(el).paddingBottom),
    })),
  )
  expect(padding[1].top / padding[0].top).toBeCloseTo(0.825, 2)
  expect(padding[0].bottom / padding[3].bottom).toBeCloseTo(0.825, 2)
  await page.getByRole('link', { name: 'HAVE A PROJECT IN MIND?' }).click()
  await expect(page.getByRole('button', { name: 'SEND PROJECT INQUIRY' })).toBeVisible()
})

for (const width of [1440, 1280, 390]) {
  test(`scene identification stays outside content at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(base)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('.studio-scene > .scene-meta')).toHaveText([
      'UI / 001',
      'CODE / 002',
      'SYS / 003',
      'TERMINAL / 004',
    ])
    const geometry = await page.locator('.studio-scene').evaluateAll((sections) =>
      sections.map((section) => {
        const label = section.querySelector<HTMLElement>(':scope > .scene-meta')!
        const box = label.getBoundingClientRect()
        const outer = section.getBoundingClientRect()
        return {
          reference: label.offsetParent === section,
          right: outer.right - box.right,
          bottom: outer.bottom - box.bottom,
          overlaps: [...section.querySelectorAll('.scene-copy, [data-reveal="visual"]')].some(
            (el) => {
              const other = el.getBoundingClientRect()
              return (
                box.left < other.right &&
                box.right > other.left &&
                box.top < other.bottom &&
                box.bottom > other.top
              )
            },
          ),
        }
      }),
    )
    for (const scene of geometry) {
      expect(scene.reference).toBe(true)
      expect(scene.right).toBeCloseTo(28, 0)
      expect(scene.bottom).toBeCloseTo(28, 0)
      expect(scene.overlaps).toBe(false)
    }
  })
}
