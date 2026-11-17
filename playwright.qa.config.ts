import config from './playwright.config'
const qaConfig = {
  ...config,
  webServer: undefined,
  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium' as const,
        channel: process.env.QA_BROWSER_CHANNEL || 'chrome',
      },
    },
  ],
}

export default qaConfig
