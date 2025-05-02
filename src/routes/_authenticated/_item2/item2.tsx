import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_item2/item2")({
  component: Item2,
  loader: () => ({ breadcrumb: () => "Item 2" }),
});

export default function Item2() {
  return <div>Item 2</div>;
}
