/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  TbChevronLeft,
  TbChevronRight,
  TbChevronsLeft,
  TbChevronsRight,
  TbFilter,
  TbFilterX,
} from "react-icons/tb";
import * as XLSX from "xlsx";
import { CiSearch } from "react-icons/ci";
import { MdOutlineFileDownload } from "react-icons/md";

type Props<T extends object> = {
  columns: ColumnDef<T, any>[];
  TableData: T[];
  title: string;
  search?: boolean;
  rightActions?: React.ReactNode;
};

const PaginationTable = <T extends object>({
  columns,
  TableData,
  title,
  search = true,
  rightActions,
}: Props<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<T[]>(() => [...TableData]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilterInputs, setShowFilterInputs] = useState(false);

  const table = useReactTable<T>({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const toggleFilterInputs = () => {
    setShowFilterInputs((prev) => {
      if (!prev) setColumnFilters([]);
      return !prev;
    });
  };

  useEffect(() => {
    const filteredData = TableData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setData(filteredData);
  }, [searchTerm, TableData]);

  return (
    <div className="w-full text-gray-900 pb-12 px-4 rounded-lg py-5">
      {search && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-2 w-72 bg-gray-100 border-gray-200 border rounded-full min-w-[250px] items-center px-4 py-2">
              <CiSearch className="text-lg" />
              <input
                type="search"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none bg-transparent w-full text-sm text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {rightActions}
            <button
              title="Filter"
              onClick={toggleFilterInputs}
              className="border border-gray-300 px-4 py-1 text-sm font-medium rounded-full cursor-pointer transition-colors hover:bg-gray-100"
            >
              {showFilterInputs ? (
                <TbFilterX className="text-lg text-red-400" />
              ) : (
                <TbFilter className="text-lg" />
              )}
            </button>
            <button
              onClick={handleDownload}
              title="Download"
              className="border border-gray-300 px-4 py-1 text-sm font-medium rounded-full cursor-pointer transition-colors hover:bg-gray-100"
            >
              <MdOutlineFileDownload className="text-lg" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto border bg-white border-gray-200 rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-[#FCFDFD] text-gray-700 text-sm border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={() => header.column.toggleSorting()}
                    className="p-3 text-left cursor-pointer whitespace-nowrap"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === "asc"
                      ? " \u25B2"
                      : header.column.getIsSorted() === "desc"
                      ? " \u25BC"
                      : ""}
                  </th>
                ))}
              </tr>
            ))}
            {showFilterInputs && (
              <tr>
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                  <th key={`${header.id}-filter`} className="p-2">
                    {header.column.getCanFilter() && (
                      <input
                        type="text"
                        className="border border-gray-300 rounded px-2 py-1 w-full text-xs"
                        placeholder={`Filter`}
                        value={(header.column.getFilterValue() as string) || ""}
                        onChange={(e) =>
                          header.column.setFilterValue(e.target.value)
                        }
                      />
                    )}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-100">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between bg-white rounded-lg px-4 py-2 items-center mt-4 gap-4 text-sm">
        <div className="text-gray-500">
          {table.getPrePaginationRowModel().rows.length} Rows
        </div>
        <div className="flex items-center gap-2">
          <span>Page</span>
          <span className="font-semibold">
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>

          <span>| Go to page:</span>
          <input
            type="number"
            min="1"
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border border-gray-300 px-2 py-1 w-16 rounded"
          />

          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {[10, 15, 20, 25].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <TbChevronsLeft />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <TbChevronLeft />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <TbChevronRight />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <TbChevronsRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationTable;
