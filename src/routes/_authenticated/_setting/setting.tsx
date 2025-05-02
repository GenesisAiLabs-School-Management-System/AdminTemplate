import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_setting/setting')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/_setting/setting"!</div>
}
