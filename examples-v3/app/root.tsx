import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from 'react-router'

export function meta() {
  return [
    { title: 'Zodix Examples' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
  ]
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <>
      <Link to="/">Home</Link>
      <Outlet />
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          Route Error: {error.status} {error.statusText}
        </h1>
      </div>
    )
  }

  if (error instanceof Response) {
    return (
      <div>
        <h1>Response Error</h1>
        <pre>
          {error.status} {error.statusText}
        </pre>
      </div>
    )
  }

  return (
    <div>
      <h1>App Error</h1>
      <pre>{error instanceof Error ? error.message : 'Unknown error'}</pre>
    </div>
  )
}
