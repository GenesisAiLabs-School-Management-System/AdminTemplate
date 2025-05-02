import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { toast } from "sonner";

// --- Import Layout Components ---
import {
  Page,
  PageLayout,
  PageTitle,
  PageActionBar,
  PageActionBarLeft, // Optional: for search
  PageActionBarRight,
  //  PageBlock, // Or FullWidthPageBlock
  FullWidthPageBlock,
} from "@/components/layout/page-layout"; // Adjust path

// --- Import Shadcn UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Copy,
  MoreHorizontal,
  Pencil,
  PlusIcon,
  Trash2,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

// --- Constants ---
const NEW_ID = "new";

// --- Component Props --- (Keep these the same)
interface FetchListResponse<TItem> {
  items: TItem[];
  totalItems: number;
}
interface RestListPageProps<TItem extends { id: string | number }> {
  queryKey: QueryKey;
  fetchListFn: (options: {
    page: number;
    pageSize: number;
    sort?: string;
    filter?: string;
  }) => Promise<FetchListResponse<TItem>>;
  deleteFn: (id: string | number) => Promise<unknown>;
  columns: ColumnDef<TItem>[];
  title: string; // Keep title prop to pass to PageTitle
  detailBasePath?: string;
  createButtonText?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  pageId?: string; // Optional pageId for context
}

// --- Component Implementation ---
export function ListPage<TItem extends { id: string | number }>({
  queryKey,
  fetchListFn,
  deleteFn,
  columns: initialColumns,
  title,
  detailBasePath = "./$id",
  createButtonText = "Add New",
  enableSearch = true,
  searchPlaceholder = "Search...",
  pageId, // Accept pageId
}: RestListPageProps<TItem>) {
  // --- Hooks (Keep these the same) ---
  //const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState<TItem | null>(null);
  const paginationOptions = useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );
  const sortString = useMemo(
    () =>
      sorting.map((s) => `${s.id}:${s.desc ? "DESC" : "ASC"}`).join(",") ||
      undefined,
    [sorting]
  );

  // --- Data Fetching Query (Keep this the same) ---
  const listQuery = useQuery({
    queryKey: [queryKey, paginationOptions, sortString, searchTerm],
    queryFn: () =>
      fetchListFn({
        page: paginationOptions.pageIndex + 1,
        pageSize: paginationOptions.pageSize,
        sort: sortString,
        filter: searchTerm || undefined,
      }),
    placeholderData: (prev) => prev,
  });
  const defaultData: FetchListResponse<TItem> = useMemo(
    () => ({ items: [], totalItems: 0 }),
    []
  );
  const { items = [], totalItems = 0 } = listQuery.data ?? defaultData;
  const pageCount = Math.ceil(totalItems / pageSize);
  console.log("list query", listQuery.data);

  // --- Delete Mutation (Keep this the same) ---
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteFn(id),
    onSuccess: () => {
      toast.success(`Item deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => toast.error(`Failed to delete item: ${error.message}`),
    onSettled: () => setItemToDelete(null),
  });

  // --- Table Columns (Keep action column logic the same) ---
  const actionColumn: ColumnDef<TItem> = useMemo(
    () => ({
      /* ... same as before ... */ id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(item));
                    toast.success("Item copied to clipboard");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={detailBasePath} params={{ id: item.id.toString() }}>
                    {" "}
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setItemToDelete(item)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
    [detailBasePath]
  );

  const selectColumn: ColumnDef<TItem> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  };
  const tableColumns = useMemo(
    () => [selectColumn, ...initialColumns, actionColumn],
    [initialColumns, actionColumn]
  );
  const [rowSelection, setRowSelection] = useState({});
  // --- Table Instance (Keep this the same) ---
  const table = useReactTable({
    data: items,
    columns: tableColumns,
    pageCount: pageCount,
    onRowSelectionChange: setRowSelection,
    state: { sorting, pagination: paginationOptions, rowSelection },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
  });
  //bulk selected items
  const selectedItems = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);
  // --- **NEW**: Render using Page Layout Components ---
  return (
    // Use the main Page component wrapper
    <Page pageId={pageId}>
      {/* Use PageTitle for the title */}
      <PageTitle>{title}</PageTitle>

      {/* Use PageActionBar for search and create button */}
      <PageActionBar>
        {/* Optional: Left side for search */}
        {enableSearch && (
          <PageActionBarLeft>
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="max-w-sm h-9" // Adjust size/styling as needed
            />
          </PageActionBarLeft>
        )}
        {/* Right side for primary actions */}
        <PageActionBarRight>
          <Button asChild size="sm">
            <Link to={detailBasePath} params={{ id: NEW_ID }}>
              <PlusIcon className="mr-2 h-4 w-4" /> {createButtonText}
            </Link>
          </Button>
        </PageActionBarRight>
      </PageActionBar>

      {/* Use PageLayout to contain the main content block */}
      <PageLayout>
        {/* Use FullWidthPageBlock (or PageBlock column="main") for the table */}
        <FullWidthPageBlock>
          {" "}
          {/* Using FullWidth here, adjust if needed */}
          {/* Removed outer Card, PageBlock renders one internally */}
          {/* Removed CardHeader, search is now in PageActionBar */}
          {/* Removed CardContent, PageBlock handles content padding */}
          <div className="rounded-md border">
            {" "}
            {/* Keep border around table */}
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{
                          width:
                            header.getSize() !== 150
                              ? header.getSize()
                              : undefined,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {listQuery.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      className="h-24 text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      className="h-24 text-center"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            {/* Bulk Actions */}
            {Object.keys(rowSelection).length > 0 && (
              <div className="fixed bottom-7 right-1/2 lg:right-2/6  flex justify-center items-center gap-2 bg-black text-white dark:text-white shadow-lg p-1 px-2 rounded-md border">
                <span className="text-sm font-medium">
                  {Object.keys(rowSelection).length} Selected
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-1 -right-1 border-1 rounded-full w-4 h-4 bg-black opacity-75 "
                  onClick={() => {
                    setRowSelection({});
                    toast.success("Selection cleared");
                  }}
                >
                  <X className="h-1 w-1" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    /* Implement bulk edit logic */
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4 " />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(selectedItems)
                    );
                    toast.success("Items copied to clipboard");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive focus:text-destructive hover:text-destructive"
                  onClick={() => {
                    /* Implement bulk delete logic */
                    toast.success("Items deleted");
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Separator
                  orientation="vertical"
                  className="h-8 bg-white text-white"
                />
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRowSelection({});
                    toast.success("Selection cleared");
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Selection
                </Button>
              </div>
            )}

            <span className="text-sm text-muted-foreground flex-1">
              Total Items: {totalItems}
            </span>
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </FullWidthPageBlock>
      </PageLayout>

      {/* Delete Confirmation Dialog (keep as is) */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        {/* ... AlertDialog structure ... */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                itemToDelete && deleteMutation.mutate(itemToDelete.id)
              }
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page> // Close the main Page wrapper
  );
}
