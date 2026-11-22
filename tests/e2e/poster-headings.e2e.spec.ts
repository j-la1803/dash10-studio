import { expect, test } from '@playwright/test'

for (const width of [320, 390, 1440]) {
  test(`shared poster typography at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(process.env.QA_BASE_URL || 'http://localhost:3102')
    const selectors = [
      '.dash-hero-heading [data-poster-heading]',
      '#capabilities-heading [data-poster-heading]',
      '#poster-title-built-for',
      '#poster-title-web-dev',
      '#poster-title-your-systems',
      '#poster-title-we-build',
    ]
    const fonts: string[] = []
    for (const selector of selectors) {
      const heading = page.locator(selector)
      await heading.scrollIntoViewIfNeeded()
      await page.evaluate(() => document.fonts.ready)
      const metrics = await heading.evaluate((element) => {
        const solid = getComputedStyle(element)
        const outline = getComputedStyle(element.querySelector('span')!)
        return {
          font: solid.fontFamily,
          weight: solid.fontWeight,
          size: solid.fontSize,
          outlineSize: outline.fontSize,
          line: solid.lineHeight,
          outlineLine: outline.lineHeight,
          lineRatio: parseFloat(solid.lineHeight) / parseFloat(solid.fontSize),
          smoothing: solid.getPropertyValue('-webkit-font-smoothing'),
          transform: solid.textTransform,
          outlineTransform: outline.textTransform,
          tracking: parseFloat(solid.letterSpacing) / parseFloat(solid.fontSize),
          outlineFont: outline.fontFamily,
          outlineWeight: outline.fontWeight,
          outlineTracking: outline.letterSpacing,
          solidTracking: solid.letterSpacing,
          stroke: outline.webkitTextStrokeWidth,
        }
      })
      fonts.push(metrics.font)
      expect(metrics.weight).toBe('700')
      expect(metrics.outlineSize).toBe(metrics.size)
      expect(metrics.outlineLine).toBe(metrics.line)
      expect(metrics.lineRatio).toBeCloseTo(0.92, 4)
      expect(metrics.smoothing).toBe('antialiased')
      expect(metrics.outlineTransform).toBe(metrics.transform)
      expect(metrics.tracking).toBeCloseTo(-0.045, 4)
      expect(metrics.outlineFont).toBe(metrics.font)
      expect(metrics.outlineWeight).toBe(metrics.weight)
      expect(metrics.outlineTracking).toBe(metrics.solidTracking)
      expect(metrics.stroke).toBe('2px')
    }
    // Computed font-family alone misses individual glyph fallbacks (notably comma).
    const session = await page.context().newCDPSession(page)
    await session.send('DOM.enable')
    await session.send('CSS.enable')
    const { root } = await session.send('DOM.getDocument')
    for (const selector of selectors) {
      const { nodeId } = await session.send('DOM.querySelector', {
        nodeId: root.nodeId, selector: `${selector} > span`,
      })
      const { fonts: renderedFonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId })
      expect(renderedFonts.every((font) => font.isCustomFont && font.familyName === 'Inter')).toBe(true)
    }
    await session.detach()
    expect(new Set(fonts).size).toBe(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
