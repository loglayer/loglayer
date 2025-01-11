import { defineConfig, HeadConfig } from 'vitepress'

const defaultTitle = "LogLayer"
const defaultDescription = "A unified logger that routes logs to various logging libraries and cloud providers while providing a fluent API for specifying log messages, metadata and errors"

export default defineConfig({
  lang: 'en-US',
  title: defaultTitle,
  description: defaultDescription,
  srcDir: "src",
  appearance: 'force-dark',
  sitemap: {
    hostname: 'https://loglayer.dev'
  },
  async transformHead ({ pageData }) {
    const head: HeadConfig[] = [
      [
        'script',
        { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-WS76Z01D7D' }
      ],
      [
        'script',
        {},
        `window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-WS76Z01D7D');`
      ],
      ['link', { rel: 'icon', href: '/images/icons/favicon.ico' }],
      ['link', { rel: 'manifest', href: '/images/icons/site.webmanifest' }],
      ['meta', { name: 'keywords', content: 'loglayer, logging, logger, log, javascript, typescript, nodejs, browser' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:image', content: '/images/loglayer.jpg' }],
      ['meta', { property: 'og:url', content: 'https://loglayer.dev' }],
      ['meta', { property: 'og:site_name', content: 'LogLayer' }],
    ]

    head.push(['meta', { property: 'og:title', content: String(pageData?.frontmatter?.title ?? defaultTitle).replace(/"/g, '&quot;') }])
    head.push(['meta', { property: 'og:description', content: String(pageData?.frontmatter?.description ?? defaultDescription).replace(/"/g, '&quot;') }])

    return head
  },
  themeConfig: {
    logo: "/images/loglayer.jpg",
    editLink: {
      pattern: "https://github.com/loglayer/loglayer/edit/master/docs/src/:path",
      text: 'Edit this page on GitHub'
    },
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3]
    },
    nav: [
      { text: '<img alt="NPM Version" src="https://img.shields.io/npm/v/loglayer" />', link: 'https://www.npmjs.com/package/loglayer' },
      { text: 'Get Started', link: '/getting-started' },
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
          { text: 'Testing Transports', link: '/transports/testing-transports' },
          { text: 'Supported Loggers', items:
            [
              { text: 'Console', link: '/transports/console' },
              { text: 'AWS Lambda Powertools', link: '/transports/aws-lambda-powertools' },
              { text: 'Bunyan', link: '/transports/bunyan' },
              { text: 'Consola', link: '/transports/consola' },
              { text: 'Electron Log', link: '/transports/electron-log' },
              { text: 'Log4js', link: '/transports/log4js' },
              { text: 'loglevel', link: '/transports/loglevel' },
              { text: 'Pino', link: '/transports/pino' },
              { text: 'Roarr', link: '/transports/roarr' },
              { text: 'Signale', link: '/transports/signale' },
              { text: 'tslog', link: '/transports/tslog' },
              { text: 'Tracer', link: '/transports/tracer' },
              { text: 'Winston', link: '/transports/winston' },
            ]
          },
          { text: "Cloud Providers", items: [
            { text: 'DataDog (server-side)', link: '/transports/datadog' },
            { text: 'DataDog Browser Logs', link: '/transports/datadog-browser-logs' },
            { text: 'Dynatrace', link: '/transports/dynatrace' },
            { text: 'Google Cloud Logging', link: '/transports/google-cloud-logging' },
            { text: 'New Relic', link: '/transports/new-relic' },
          ]}
        ]
      },
      {
        text: 'Plugins',
        items: [
          { text: 'Overview', link: '/plugins' },
          { text: 'Creating Plugins', link: '/plugins/creating-plugins' },
          { text: 'Testing Plugins', link: '/plugins/testing-plugins' },
          { text: 'Available Plugins', items:
            [
              { text: 'Redaction', link: '/plugins/redaction' },
              { text: 'Sprintf', link: '/plugins/sprintf' },
            ]
          }
        ]
      },
      {
        text: 'Example Integrations',
        items: [
          { text: 'Express', link: '/example-integrations/express' },
          { text: 'Fastify', link: '/example-integrations/fastify' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/loglayer/loglayer' },
    ],
  }
})