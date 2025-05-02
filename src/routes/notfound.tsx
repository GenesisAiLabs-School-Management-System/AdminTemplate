import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/notfound')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/notfound"!</div>
}
