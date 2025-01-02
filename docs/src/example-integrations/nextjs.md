# LogLayer with Next.js

LogLayer can be integrated with Next.js to provide consistent logging across your application. This guide will show you how to set it up and use it effectively.

## Installation

First, install LogLayer:

::: code-group

```sh [npm]
npm i loglayer
```

```sh [pnpm]
pnpm add loglayer
```

```sh [yarn]
yarn add loglayer
```

:::

## Setup

### Creating a Logger Instance

Create a new file `lib/logger.ts` to initialize your LogLayer instance:

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'

// Create the LogLayer instance
export const logger = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
  // Add global context that will be included in all logs
  context: {
    environment: process.env.NODE_ENV
  }
})
```

### Route Handler Example

Here's how to use LogLayer in your route handlers (`app/api/example/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  // Add request-specific context
  const requestLogger = logger.withContext({
    method: request.method,
    url: request.url,
    requestId: crypto.randomUUID()
  })

  try {
    requestLogger.info('Processing API request')

    // Add additional context for specific logs
    const searchParams = request.nextUrl.searchParams
    requestLogger
      .withMetadata({ query: Object.fromEntries(searchParams.entries()) })
      .info('Request includes query parameters')

    // Your API logic here
    return NextResponse.json({ message: 'Success' })
  } catch (error) {
    requestLogger
      .withError(error as Error)
      .error('Error processing API request')
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### React Server Component Example

For server components (`app/example/page.tsx`):

```typescript
import { logger } from '@/lib/logger'

export default async function ExamplePage() {
  const pageLogger = logger.withContext({
    component: 'ExamplePage'
  })

  try {
    pageLogger.info('Rendering example page')

    // Your component logic here
    const data = await fetchSomeData()

    pageLogger
      .withMetadata({ dataLength: data.length })
      .info('Successfully fetched data')

    return <div>Example Page</div>
  } catch (error) {
    pageLogger
      .withError(error as Error)
      .error('Error rendering page')
    
    // In App Router, you can throw errors and they'll be caught by the closest error.tsx
    throw error
  }
}
```

### Client Component Example

You can use the same logger in client components (`components/ButtonExample.tsx`):

```typescript
'use client'

import { logger } from '@/lib/logger'

export function ButtonExample() {
  const handleClick = () => {
    logger
      .withContext({ action: 'button_click' })
      .info('User clicked button')
  }

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  )
}
```

### Error Handling

In the App Router, you can create error boundaries using error.tsx files. Here's an example (`app/error.tsx`):

```typescript
'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error when the component mounts
    logger
      .withError(error)
      .withMetadata({
        digest: error.digest,
        componentStack: error.stack
      })
      .error('React error boundary caught an error')
  }, [error])

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

For server components, create a similar file for server-side errors (`app/[...path]/error.tsx`):

```typescript
import { logger } from '@/lib/logger'

// This is still a client component, but we can import the server logger
// because it won't be included in the client bundle
export default function ServerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log server-side errors
    logger
      .withError(error)
      .withMetadata({
        digest: error.digest,
        componentStack: error.stack
      })
      .error('Server component error caught by error boundary')
  }, [error])

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```
