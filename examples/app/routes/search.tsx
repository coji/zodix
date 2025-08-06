import { zx } from '@coji/zodix'
import { Form } from 'react-router'
import { z } from 'zod/v4'
import type { Route } from './+types/search'

export async function loader({ request }: Route.LoaderArgs) {
  const { query } = zx.parseQuery(request, {
    query: z.string().optional(),
  })
  const results = query ? searchAnimals(query) : []
  return { query, results }
}

export default function Search({
  loaderData: { query, results },
}: Route.ComponentProps) {
  return (
    <>
      <h1>Search</h1>
      <Form method="get">
        <input name="query" defaultValue={query} />
        <button type="submit">Search</button>
      </Form>
      {results.length > 0 && (
        <div>
          <h2>Results for "{query}":</h2>
          <ul>
            {results.map((result) => (
              <li key={result}>{result}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

function searchAnimals(query: string) {
  return [
    'dog',
    'cat',
    'bird',
    'fish',
    'whale',
    'dolphin',
    'shark',
    'tiger',
    'lion',
    'elephant',
    'giraffe',
    'zebra',
    'horse',
    'cow',
    'pig',
    'chicken',
    'duck',
    'goose',
    'frog',
    'snake',
    'lizard',
    'turtle',
  ].filter((animal) => animal.includes(query))
}
