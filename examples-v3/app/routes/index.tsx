import { Link } from 'react-router'

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Zodix Examples (Zod v3)</h1>
      <ul>
        <li>
          <Link to="/posts/12">Valid loader parameters (/posts/12)</Link>
          <p>
            This correctly parses the $postId parameter from the URL and loads
            the post.
          </p>
        </li>
        <li>
          <Link to="/posts/notanumber">
            Invalid loader parameters (/posts/notanumber)
          </Link>
          <p>
            The parsing will fail here because $postId isn't a number. It will
            throw a Response, which is caught by the route's ErrorBoundary. It
            could also bubble up a higher level ErrorBoundary if you prefer.
          </p>
        </li>
        <li>
          <Link to="/login">Login form with custom validation (/login)</Link>
          <p>
            This uses the parseFormSafe function to parse the form data and
            return custom error messages without throwing.
          </p>
        </li>
        <li>
          <Link to="/search">
            Search using parsed query parameter (/search)
          </Link>
          <p>
            This uses parseQuery to parse the search query from the URL and load
            results.
          </p>
        </li>
        <li>
          <Link to="/filters">Dynamic schema with filters (/filters)</Link>
          <p>
            This demonstrates how to build a type-safe schema with dynamic
            fields using z.object().extend(). Perfect for scenarios where you
            have filters loaded from a database or configuration.
          </p>
        </li>
      </ul>
    </div>
  )
}
