import { defineConfig, HeadConfig } from 'vitepress'

const defaultTitle = "LogLayer"
const defaultDescription = "A layer on top of Javascript logging libraries to provide a consistent logging experience."

export default defineConfig({
  lang: 'en-US',
  title: defaultTitle,
  description: defaultDescription,
  srcDir: "src",
  async transformHead ({ pageData }) {
    const head: HeadConfig[] = []

    head.push(['meta', { property: 'og:title', content: String(pageData?.frontmatter?.title ?? defaultTitle).replace(/"/g, '&quot;') }])
    head.push(['meta', { property: 'og:description', content: String(pageData?.frontmatter?.description ?? defaultDescription).replace(/"/g, '&quot;') }])

    return head
  },
  themeConfig: {
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3]
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/getting-started' },
      { text: 'Transports', link: '/transports/' }
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is LogLayer?', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Migration from 4.x', link: '/migrating' },
        ]
      },
      {
        text: 'Logging API',
        items: [
          { text: 'Basic Logging', link: '/logging-api/basic-logging' },
          { text: 'Context', link: '/logging-api/context' },
          { text: 'Metadata', link: '/logging-api/metadata' },
          { text: 'Error Handling', link: '/logging-api/error-handling' },
          { text: 'Child Loggers', link: '/logging-api/child-loggers' },
          { text: 'Typescript Tips', link: '/logging-api/typescript' },
          { text: 'Unit Testing', link: '/logging-api/unit-testing' },
        ]
      },
      {
        text: 'Transports',
        items: [
          { text: 'Overview', link: '/transports/' },
          { text: 'Configuration', link: '/transports/configuration' },
          { text: 'Multiple Transports', link: '/transports/multiple-transports' },
          { text: 'Creating Transports', link: '/transports/creating-transports' },
          { text: 'Supported Loggers', items:
            [
              { text: 'Console', link: '/transports/console' },
              { text: 'Bunyan', link: '/transports/bunyan' },
              { text: 'Consola', link: '/transports/consola' },
              { text: 'Datadog Browser Logs', link: '/transports/datadog-browser-logs' },
              { text: 'Electron Log', link: '/transports/electron-log' },
              { text: 'Log4js', link: '/transports/log4js' },
              { text: 'Pino', link: '/transports/pino' },
              { text: 'Roarr', link: '/transports/roarr' },
              { text: 'Signale', link: '/transports/signale' },
              { text: 'Winston', link: '/transports/winston' },
            ]
          }
        ]
      },
      {
        text: 'Plugins',
        items: [
          { text: 'Overview', link: '/plugins' },
          { text: 'Creating Plugins', link: '/plugins/creating' },
          { text: 'Testing Plugins', link: '/plugins/testing' },
          { text: 'Available Plugins', items:
            [
              { text: 'Redaction', link: '/plugins/redaction' },
            ]
          }
        ]
      },
      {
        text: 'Example Integrations',
        items: [
          { text: 'Express', link: '/example-integrations/express' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/loglayer/loglayer' }
    ],
  }
})