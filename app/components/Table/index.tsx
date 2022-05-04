import withRelayOptions from "lib/relay/withRelayOptions";
import safeJsonParse from "lib/safeJsonParse";
import { useRouter } from "next/router";
import React, { useCallback, useMemo, useState } from "react";
import {
  fetchQuery,
  GraphQLTaggedNode,
  useRelayEnvironment,
} from "react-relay";
import * as Sentry from "@sentry/react";
import FilterRow from "./FilterRow";
import { FilterArgs, PageArgs, TableFilter } from "./Filters";
import Pagination from "./Pagination";
import SortableHeader from "./SortableHeader";

interface Props {
  filters: TableFilter[];
  paginated?: boolean;
  totalRowCount?: number;
  emptyStateContents?: JSX.Element | string;
  /**
   * The top-level query used by the page rendenring the table.
   * If provided, when the table filters, ordering or pagination are updated,
   * the table will reload the query before updating the router,
   * preventing a render with the Suspense fallback while the new data is being fetched.
   */
  pageQuery?: GraphQLTaggedNode;
}

const Table: React.FC<Props> = ({
  filters,
  paginated,
  totalRowCount,
  children,
  pageQuery,
  emptyStateContents = <span className="no-results">No results found.</span>,
}) => {
  const environment = useRelayEnvironment();
  const [isRefetching, setIsRefetching] = useState(false);
  const router = useRouter();
  const filterArgs = useMemo<FilterArgs>(
    () => safeJsonParse(router.query.filterArgs as string),
    [router]
  );

  const { offset, pageSize } = useMemo<PageArgs>(
    () => safeJsonParse(router.query.pageArgs as string),
    [router]
  );

  const handleRouteUpdate = useCallback(
    (url, mode: "replace" | "push") => {
      const afterFetch = () => {
        setIsRefetching(false);
        // At this point the data for the query should be cached,
        // so we can update the route and re-render without suspending
        if (mode === "replace") router.replace(url, url, { shallow: true });
        else router.push(url, url, { shallow: true });
      };

      if (!pageQuery) {
        afterFetch();
        return;
      }

      if (isRefetching) {
        return;
      }

      setIsRefetching(true);

      // fetchQuery will fetch the query and write the data to the Relay store.
      // This will ensure that when we re-render, the data is already cached and we don't suspend
      // See https://github.com/facebook/relay/blob/b8e78ca0fbbfe05f34b4854484df574d91ba2113/website/docs/guided-tour/refetching/refetching-queries-with-different-data.md#if-you-need-to-avoid-suspense
      fetchQuery(
        environment,
        pageQuery,
        withRelayOptions.variablesFromContext(url),
        { fetchPolicy: "store-or-network" }
      ).subscribe({
        complete: afterFetch,
        error: (error) => {
          Sentry.captureException(error);
          // if the query fails, we still want to update the route,
          // which will retry the query and let a 500 page be rendered if it fails again
          afterFetch();
        },
      });
    },
    [environment, isRefetching, router, pageQuery]
  );

  const applyFilterArgs = (newFilterArgs: FilterArgs) => {
    const newQuery = {
      // copy the vars from the query string, so that the args coming from extraFilters are not overriden
      ...filterArgs,
      ...newFilterArgs,
    };
    filters.forEach((filter) => {
      filter.argNames.forEach((argName) => {
        newQuery[argName] = newFilterArgs[argName] ?? undefined;
      });
    });

    const queryString = JSON.stringify(newQuery);

    const url = {
      pathname: router.pathname,
      query: {
        ...router.query,
        filterArgs: queryString,
        pageArgs: JSON.stringify({ offset: 0, pageSize }),
      },
    };

    handleRouteUpdate(url, "push");
  };

  const applyPageArgs = (newPageArgs: PageArgs) => {
    const url = {
      pathname: router.pathname,
      query: {
        ...router.query,
        pageArgs: JSON.stringify(newPageArgs),
      },
    };
    handleRouteUpdate(url, "push");
  };

  const handleOffsetChange = (value: number) => {
    applyPageArgs({ offset: value, pageSize });
  };

  const handleMaxResultsChange = (value: number) => {
    applyPageArgs({ offset: 0, pageSize: value });
  };

  const rows = React.Children.toArray(children);

  return (
    <>
      <table className="bc-table">
        {/* class name is used to increase specificity of CSS selectors and override defaults */}
        <thead>
          <tr>
            {filters.map((filter) => (
              <SortableHeader
                key={filter.title + "-header"}
                orderByPrefix={filter.orderByPrefix}
                displayName={filter.title}
                sortable={filter.isSortEnabled}
                loading={isRefetching}
                onRouteUpdate={handleRouteUpdate}
              />
            ))}
          </tr>

          <FilterRow
            filterArgs={filterArgs}
            filters={filters}
            disabled={isRefetching}
            onSubmit={applyFilterArgs}
          />
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={filters.length}>{emptyStateContents}</td>
            </tr>
          )}
        </tbody>
        {paginated && (
          <tfoot>
            <tr>
              <Pagination
                totalCount={totalRowCount}
                offset={offset}
                pageSize={pageSize}
                disabled={isRefetching}
                onOffsetChange={handleOffsetChange}
                onPageSizeChange={handleMaxResultsChange}
              />
            </tr>
          </tfoot>
        )}
      </table>
      <style jsx>{`
        table.bc-table {
          margin-top: 1rem;
          border-collapse: separate;
          border-spacing: 0;
        }

        :global(tr:nth-child(even)) {
          background-color: #f5f5f5;
        }

        :global(tr:nth-child(odd)) {
          background-color: white;
        }

        :global(table.bc-table td) {
          border-right: 1px solid #939393;
          border-bottom: 1px solid #939393;
          text-align: left;
          padding: 0.5rem;
        }

        :global(td:first-child) {
          border-left: 1px solid #939393;
        }

        :global(.no-results) {
          width: 100%;
          display: inline-block;
          text-align: center;
          font-style: italic;
        }

        :global(table.bc-table tfoot tr, table.bc-table tfoot td) {
          border: none;
          background-color: transparent;
        }
      `}</style>
    </>
  );
};

export default Table;
