import { useState, useCallback } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

function DataTable({
  columns,
  data,
  initialPageSize = 10,
  showPagination = true,
  showPageSize = true,
  pageSizeOptions = [5, 10, 20, 50],
  title,
  description,
  onRowClick,
  emptyMessage = "No data available",
  className,
}) {
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate total pages
  const totalPages = data.length > 0 ? Math.ceil(data.length / pageSize) : 0

  // Ensure current page is valid when data changes
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages))

  const startIndex = (validCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, data.length)
  const currentData = data.slice(startIndex, endIndex)

  const goToPage = useCallback((page) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [totalPages])

  const goToFirstPage = useCallback(() => goToPage(1), [goToPage])
  const goToLastPage = useCallback(() => goToPage(Math.max(1, totalPages)), [goToPage, totalPages])
  const goToPreviousPage = useCallback(() => goToPage(validCurrentPage - 1), [goToPage, validCurrentPage])
  const goToNextPage = useCallback(() => goToPage(validCurrentPage + 1), [goToPage, validCurrentPage])

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value)
    setPageSize(newSize)
    setCurrentPage(1)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const totalVisiblePages = 5

    if (totalPages <= totalVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, validCurrentPage - Math.floor(totalVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + totalVisiblePages - 1)

      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) pages.push("ellipsis")
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push("ellipsis")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={className}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-solar-muted">{description}</p>
          )}
        </div>
      )}

      <div className="glass-card shadow-2xl border border-solar-border/30 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-solar-night/80 dark:bg-solar-bgActive border-solar-border hover:bg-solar-panel/20">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={cn(
                      "text-solar-textPrimaryLight dark:text-solar-textPrimaryDark font-semibold whitespace-nowrap",
                      column.className || ""
                    )}
                    style={column.width ? { width: column.width } : {}}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-solar-border transition-all duration-300",
                      onRowClick ? "cursor-pointer" : "",
                      rowIndex % 2 === 0 ? "bg-transparent" : "bg-solar-night/10 dark:bg-solar-bg/30",
                      "hover:bg-solar-yellow! hover:text-solar-dark! hover:shadow-solar-glow-yellow! hover:font-bold! hover:relative hover:z-10 group [&_td:first-child]:rounded-l-xl [&_td:last-child]:rounded-r-xl"
                    )}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={cn(
                          "text-solar-textPrimaryLight dark:text-solar-textPrimaryDark group-hover:text-solar-dark! group-hover:font-bold",
                          column.cellClassName || ""
                        )}
                      >
                        {column.cell
                          ? column.cell(row)
                          : row[column.accessorKey]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-solar-muted"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {showPagination && data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-solar-border bg-solar-night/50 dark:bg-solar-bgActive">
            <div className="flex items-center gap-4">
              {showPageSize && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-solar-muted">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="h-8 w-16 rounded-md border border-solar-border bg-white dark:bg-solar-bgActive px-2 py-1 text-sm text-solar-textPrimaryLight dark:text-solar-textPrimaryDark focus:outline-none focus:border-solar-yellow"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <span className="text-sm text-solar-muted">
                Showing {startIndex + 1} to {endIndex} of {data.length} results
              </span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <button
                    onClick={goToFirstPage}
                    disabled={validCurrentPage === 1}
                    className="flex items-center justify-center h-8 w-8 rounded-md border border-solar-border bg-white dark:bg-solar-bgActive text-solar-textPrimaryLight dark:text-solar-textPrimaryDark disabled:opacity-50 disabled:cursor-not-allowed sun-button"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={goToPreviousPage}
                    disabled={validCurrentPage === 1}
                    className="flex items-center justify-center h-8 w-8 rounded-md border border-solar-border bg-white dark:bg-solar-bgActive text-solar-textPrimaryLight dark:text-solar-textPrimaryDark disabled:opacity-50 disabled:cursor-not-allowed sun-button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </PaginationItem>

                {getPageNumbers().map((page, index) =>
                  page === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <button
                        onClick={() => goToPage(page)}
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-all duration-200",
                          validCurrentPage === page
                            ? "bg-solar-orange text-white shadow-md"
                            : "text-solar-muted sun-button"
                        )}
                      >
                        {page}
                      </button>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <button
                    onClick={goToNextPage}
                    disabled={validCurrentPage === totalPages}
                    className="flex items-center justify-center h-8 w-8 rounded-md border border-solar-border bg-white dark:bg-solar-bgActive text-solar-textPrimaryLight dark:text-solar-textPrimaryDark disabled:opacity-50 disabled:cursor-not-allowed sun-button"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={goToLastPage}
                    disabled={validCurrentPage === totalPages}
                    className="flex items-center justify-center h-8 w-8 rounded-md border border-solar-border bg-white dark:bg-solar-bgActive text-solar-textPrimaryLight dark:text-solar-textPrimaryDark disabled:opacity-50 disabled:cursor-not-allowed sun-button"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataTable
