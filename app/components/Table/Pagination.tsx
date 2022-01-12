import React from "react";
import PaginationUnstyled from "@mui/base/TablePaginationUnstyled";

interface Props {
  /**
   * The total number of items in all of the pages
   */
  totalCount: number;
  /**
   * Defaults to DEFAULT_PAGE_SIZE.
   */
  pageSize?: number;
  /**
   * The number of items to skip to get to the current page. Defaults to 0
   */
  offset?: number;
  onOffsetChange: (offset: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const DEFAULT_PAGE_SIZE = 20;

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const FilterableTablePagination: React.FunctionComponent<Props> = ({
  totalCount,
  pageSize = DEFAULT_PAGE_SIZE,
  offset = 0,
  onOffsetChange,
  onPageSizeChange,
}) => {
  const activePage = Math.floor(offset / pageSize) || 0;

  const handlePageChange = (_event, pageNumber: number) => {
    onOffsetChange(pageNumber * pageSize);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    onPageSizeChange(Number(event.target.value));
  };

  return (
    <>
      <PaginationUnstyled
        count={totalCount}
        page={activePage}
        rowsPerPage={pageSize}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handlePageSizeChange}
      />
    </>
  );
};

export default FilterableTablePagination;
