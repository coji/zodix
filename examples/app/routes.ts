import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),
  route('login', 'routes/login.tsx'),
  route('search', 'routes/search.tsx'),
  route('posts/:postId', 'routes/posts/$postId.tsx'),
] satisfies RouteConfig
