import { defineConfig, HeadConfig } from 'vitepress'

const defaultTitle = "LogLayer: The modern logging library for Typescript / Javascript"
const defaultDescription = "A structured logging library with a fluent API for specifying log messages, metadata and errors"
const baseUrl = 'https://loglayer.dev'

export default defineConfig({
  lang: 'en-US',
  title: "LogLayer",
  description: defaultDescription,
  srcDir: "src",
  appearance: 'force-dark',
  sitemap: {
    hostname: 'https://loglayer.dev'
  },
  vite: {
    ssr: {
      noExternal: [
        "@nolebase/ui-asciinema",
      ],
    },
    plugins: []
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
      ['meta', { name: 'keywords', content: 'loglayer, logging, logger, log, javascript, typescript, nodejs, browser, file, otel, opentelemetry, rotation, library, structured, framework' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:image', content: '/images/loglayer.png' }],
      ['meta', { property: 'og:site_name', content: 'LogLayer' }],
      ['meta', { property: 'og:image:alt', content: 'LogLayer logo by Akshaya Madhavan' }],
      ['meta', { property: 'og:locale', content: 'en_US' }],
      ['meta', { name: 'twitter:card', content: 'summary' }],
      ['meta', { name: 'twitter:image:alt', content: 'LogLayer logo by Akshaya Madhavan' }],
    ]

    head.push(['meta', { property: 'og:title', content: String(pageData?.frontmatter?.title ?? defaultTitle).replace(/"/g, '&quot;') }])
    head.push(['meta', { property: 'og:description', content: String(pageData?.frontmatter?.description ?? defaultDescription).replace(/"/g, '&quot;') }])
    head.push(['meta', { property: 'og:url', content: `${baseUrl}${pageData.relativePath ? '/' + pageData.relativePath.replace(/\.md$/, '') : ''}` }])

    return head
  },
  themeConfig: {
    logo: {
      src: '/images/loglayer.png',
      alt: 'LogLayer logo by Akshaya Madhavan'
    },
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
      { text: `What's new`, link: '/whats-new'},
      { text: 'Get Started', link: '/getting-started' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Why Use LogLayer?', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Cheat Sheet', link: '/cheatsheet' },
          { text: 'Migrating Versions', link: '/migrating' },
          { text: 'AI Support', link: '/ai-support' },
        ]
      },
      {
        text: 'Logging API',
        items: [
          { text: 'Basic Logging', link: '/logging-api/basic-logging' },
          { text: 'Adjusting Log Levels', link: '/logging-api/adjusting-log-levels' },
          { text: 'Context', link: '/logging-api/context' },
          { text: 'Metadata', link: '/logging-api/metadata' },
          { text: 'Lazy Evaluation (v9)', link: '/logging-api/lazy-evaluation' },
          { text: 'Error Handling', link: '/logging-api/error-handling' },
          { text: 'Child Loggers', link: '/logging-api/child-loggers' },
          { text: 'Groups (v9)', link: '/logging-api/groups' },
          { text: 'Transport Management', link: '/logging-api/transport-management' },
          { text: 'Typescript Tips', link: '/logging-api/typescript' },
          { text: 'No-op / Mocking', link: '/logging-api/unit-testing' },
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
          { text: 'Built-in Transports', items: [
              { text: 'Console', link: '/transports/console' },
              { text: 'Structured', link: '/transports/structured-logger' },
              { text: 'Blank', link: '/transports/blank-transport' },
            ]
          },
          { text: 'Supported Loggers', items:
            [
              { text: 'Bunyan', link: '/transports/bunyan' },
              { text: 'Consola', link: '/transports/consola' },
              { text: 'Electron Log', link: '/transports/electron-log' },
              { text: 'Log4js', link: '/transports/log4js' },
              { text: 'loglevel', link: '/transports/loglevel' },
              { text: 'LogTape', link: '/transports/logtape' },
              { text: 'Pino', link: '/transports/pino' },
              { text: 'Roarr', link: '/transports/roarr' },
              { text: 'Signale', link: '/transports/signale' },
              { text: 'tslog', link: '/transports/tslog' },
              { text: 'Tracer', link: '/transports/tracer' },
              { text: 'Winston', link: '/transports/winston' },
            ]
          },
          { text: 'Cloud Providers', items: [
            { text: 'Amazon CloudWatch Logs', link: '/transports/aws-cloudwatch-logs' },
            { text: 'AWS Lambda Powertools', link: '/transports/aws-lambda-powertools' },
            { text: 'Axiom', link: '/transports/axiom' },
            { text: 'Better Stack', link: '/transports/betterstack' },
            { text: 'DataDog (server-side)', link: '/transports/datadog' },
            { text: 'DataDog Browser Logs', link: '/transports/datadog-browser-logs' },
            { text: 'Dynatrace', link: '/transports/dynatrace' },
            { text: 'Google Cloud Logging', link: '/transports/google-cloud-logging' },
            { text: 'Logflare', link: '/transports/logflare' },
            { text: 'New Relic', link: '/transports/new-relic' },
            { text: 'Sentry', link: '/transports/sentry' },
            { text: "Sumo Logic", link: '/transports/sumo-logic'},
            { text: 'VictoriaLogs', link: '/transports/victoria-logs' },
          ]},
          { text: 'Other Transports', items: [
            { text: 'HTTP', link: '/transports/http' },
            { text: 'Log File Rotation', link: '/transports/log-file-rotation' },
            { text: 'OpenTelemetry', link: '/transports/opentelemetry' },
            { text: 'Pretty Terminal', link: '/transports/pretty-terminal' },
            { text: 'Simple Pretty Terminal', link: '/transports/simple-pretty-terminal' },
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
              { text: 'Filter', link: '/plugins/filter' },
              { text: 'OpenTelemetry', link: '/plugins/opentelemetry' },
              { text: 'Redaction', link: '/plugins/redaction' },
              { text: 'Sprintf', link: '/plugins/sprintf' },
              { text: 'Datadog APM Trace Injector', link: '/plugins/datadog-apm-trace-injector' },
            ]
          }
        ]
      },
      {
        text: 'Context Managers (v6)',
        items: [
          { text: 'Overview', link: '/context-managers/' },
          { text: 'Creating Context Managers', link: '/context-managers/creating-context-managers' },
          { text: 'Available Context Managers', items: [
              { text: 'Default', link: '/context-managers/default' },
              { text: 'Isolated', link: '/context-managers/isolated' },
              { text: 'Linked', link: '/context-managers/linked' }
            ]}
        ]
      },
      {
        text: 'Mixins (v7)',
        items: [
          { text: 'Overview', link: '/mixins/' },
          { text: 'Creating Mixins', link: '/mixins/creating-mixins' },
          { text: 'Testing Mixins', link: '/mixins/testing-mixins' },
          { text: 'Available Mixins', items: [
              { text: 'Datadog Metrics (HTTP)', link: '/mixins/datadog-http-metrics' },
              { text: 'Hot-Shots (StatsD)', link: '/mixins/hot-shots' },
          ]}
        ]
      },
      {
        text: 'Log Level Managers (v8)',
        items: [
          { text: 'Overview', link: '/log-level-managers/' },
          { text: 'Creating Log Level Managers', link: '/log-level-managers/creating-log-level-managers' },
          { text: 'Available Log Level Managers', items: [
              { text: 'Default', link: '/log-level-managers/default' },
              { text: 'Global', link: '/log-level-managers/global' },
              { text: 'One Way', link: '/log-level-managers/one-way' },
              { text: 'Linked', link: '/log-level-managers/linked' }
            ]}
        ]
      },
      {
        text: 'Integrations',
        items: [
          { text: 'ElysiaJS', link: '/integrations/elysia' },
          { text: 'Fastify', link: '/integrations/fastify' },
          { text: 'Hono', link: '/integrations/hono' },
        ]
      },
      {
        text: 'Integration Guides',
        items: [
          { text: 'Async context tracking', link: '/example-integrations/async-context' },
          { text: 'Bun', link: '/example-integrations/bun' },
          { text: 'Deno', link: '/example-integrations/deno' },
          { text: 'Express', link: '/example-integrations/express' },
          { text: 'Next.js', link: '/example-integrations/nextjs' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/loglayer/loglayer' },
    ],
  },
})
