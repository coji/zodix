import { zx } from '@coji/zodix'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import type { Route } from './+types/$postId'

async function getPost(postId: number) {
  return Promise.resolve({
    id: postId,
    title: 'A post',
    body: 'This is a post',
  })
}

export async function loader({ params }: Route.LoaderArgs) {
  const { postId } = zx.parseParams(
    params,
    { postId: zx.NumAsString },
    // Set a custom message and status code for the response Zodix throws
    // when parsing throws.
    { message: 'Invalid postId parameter', status: 400 },
  )
  const post = await getPost(postId)
  return { post }
}

export default function PostPage({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData
  return (
    <div>
      <h1>{post.title}</h1>
      <p>Post ID: {post.id}</p>
      <p>{post.body}</p>
    </div>
  )
}

// Catch the error response thrown by Zodix when parsing fails.
export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    // If the error is a Response, it means Zodix threw an error with a
    // custom message and status code.
    return <h1>Error: {error.statusText || 'Something went wrong'}</h1>
  }

  // If the error is not a Response, it means something else went wrong.
  return <h1>Error: {String(error)}</h1>
}
