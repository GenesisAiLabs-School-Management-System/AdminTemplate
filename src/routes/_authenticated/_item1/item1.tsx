import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_item1/item1")({
  component: Item1,
  loader: () => ({ breadcrumb: () => "Item 1" }),
});

export default function Item1() {
  return <div>Item 1</div>;
}
