import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, Image } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { SearchParams } from '~/routes/dogs';
import { Dog } from '~/routes/dogs.search';

interface Props {
  data: Dog[];
  total: number;
  size: number;
  from: number;
  favorites: Dog[];
  isLoading: boolean;
  paginateFetch: (from: number) => void;
  updateFavorites: (id: string, add: boolean) => void;
  updateSearchParams: (
    key: keyof SearchParams,
    value: string | string[]
  ) => void;
}

export const resultsSize = [25, 50, 100];

const DataTable = ({
  data,
  total,
  size,
  from,
  favorites,
  isLoading,
  paginateFetch,
  updateFavorites,
  updateSearchParams
}: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false
  });
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});

  const columns: ColumnDef<Dog>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableHiding: true,
      cell: ({ row }) => <div>{row.getValue('id')}</div>
    },
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={favorites.map((f) => f.id).includes(row.getValue('id'))}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            updateFavorites(row.getValue('id'), !!value);
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div>{row.getValue('name')}</div>
    },
    {
      accessorKey: 'breed',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Breed
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue('breed')}</div>
    },
    {
      accessorKey: 'age',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Age
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue('age')}</div>
    },
    {
      accessorKey: 'zip_code',
      header: 'Zipcode',
      cell: ({ row }) => <div>{row.getValue('zip_code')}</div>
    },

    {
      accessorKey: 'img',
      header: 'Pic',
      cell: ({ row }) => (
        <Avatar>
          <AvatarImage src={row.getValue('img')} />
          <AvatarFallback>
            <Image />
          </AvatarFallback>
        </Avatar>
      )
    }
  ];

  const columnsMemo = useMemo(
    () =>
      isLoading
        ? columns.map((column) => ({
            ...column,
            cell: () => (
              <Skeleton className="h-[40px] rounded-full bg-gray-500/15" />
            )
          }))
        : columns,
    [isLoading, columns]
  );

  const table = useReactTable({
    data,
    columns: columnsMemo,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: size
      },
      columnVisibility: {
        id: false
      }
    }
  });

  const handleNext = () => {
    const pointer = from;
    if (pointer + size >= total - size) {
      return;
    }
    paginateFetch(pointer);
  };

  const handlePrev = () => {
    if (from - size <= 0) {
      return;
    }
    const pointer = from - size;
    paginateFetch(pointer);
  };

  const renderPaginationInput = () => (
    <Select
      value={`${size || 25}`}
      onValueChange={(e) => updateSearchParams('size', e)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Show # Results" />
      </SelectTrigger>
      <SelectContent className="bg-[#1a1a1a]">
        {resultsSize.map((s) => (
          <SelectItem key={`${s}`} value={`${s}`}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderColumnFilter = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Columns <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#1a1a1a]">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderTable = () => (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (!data.length) {
    return null;
  }

  return (
    <div className="flex flex-col py-4 min-w-[50%] max-w-[70%]">
      <div className="flex flex-row justify-between pb-4">
        <div>{renderColumnFilter()}</div>
        <div>{renderPaginationInput()}</div>
      </div>
      <div className="rounded-md border grow-1">{renderTable()}</div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div> */}
      </div>

      {!!data && total && <div>Total Results: {total}</div>}
      {!!from && (
        <div>
          Showing results: {from - size} - {Math.min(total, from)}
        </div>
      )}
      <div className="flex flex-row">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={from - size <= 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!!(from + size >= total - size)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default DataTable;
