import { zx } from '@coji/zodix/v4'
import { Form } from 'react-router'
import { type ZodError, z } from 'zod'
import type { Route } from './+types/login'

const schema = z.object({
  email: z.email({ message: 'Invalid email' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
})

// Check if there is an error for a specific path.
function errorAtPath(error: ZodError, path: string) {
  console.log('errorAtPath', { error, path })
  return error.issues.find((issue) => issue.path[0] === path)?.message
}

export async function action({ request }: Route.ActionArgs) {
  const result = await zx.parseFormSafe(request, schema)
  if (result.success) {
    return { success: true, emailError: null, passwordError: null }
  }
  // Get the error messages and return them to the client.
  return {
    success: false,
    emailError: errorAtPath(result.error, 'email'),
    passwordError: errorAtPath(result.error, 'password'),
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  if (actionData?.success) {
    return <h1>Success!</h1>
  }
  return (
    <>
      <h1>Login</h1>
      <Form method="post">
        <p>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" />
          {actionData?.emailError && <div>{actionData.emailError}</div>}
        </p>
        <p>
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" />
          {actionData?.passwordError && <div>{actionData.passwordError}</div>}
        </p>
        <button type="submit">Login</button>
      </Form>
    </>
  )
}
