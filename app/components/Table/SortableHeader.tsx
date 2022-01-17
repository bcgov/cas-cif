import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";

interface Props {
  orderByPrefix?: string;
  displayName: string;
  sortable?: boolean;
}

const SORT_DIRECTIONS = {
  none: {
    icon: faSort,
  },
  ascending: {
    icon: faCaretDown,
    orderBySuffix: "_ASC",
  },
  descending: {
    icon: faCaretUp,
    orderBySuffix: "_DESC",
  },
};

const SortableHeader: React.FC<Props> = ({
  orderByPrefix,
  displayName,
  sortable,
}) => {
  const router = useRouter();

  const sortDirection = useMemo(() => {
    const { orderBy } = router.query;
    if (
      !sortable ||
      !orderBy ||
      !(orderBy as string).startsWith(orderByPrefix)
    ) {
      return "none";
    }

    if ((orderBy as string).endsWith("_ASC")) {
      return "ascending";
    }

    return "descending";
  }, [router.query, orderByPrefix, sortable]);

  const handleClick = () => {
    const newSortDirection =
      sortDirection == "none" || sortDirection == "descending"
        ? "ascending"
        : "descending";

    const url = {
      pathname: router.pathname,
      query: {
        ...router.query,
        orderBy:
          orderByPrefix + SORT_DIRECTIONS[newSortDirection].orderBySuffix,
      },
    };

    router.replace(url, url, { shallow: true });
  };
  return (
    <th onClick={() => sortable && handleClick()} aria-sort={sortDirection}>
      {displayName}&nbsp;
      {sortable && (
        <FontAwesomeIcon
          color="white"
          icon={SORT_DIRECTIONS[sortDirection].icon}
        />
      )}
      <style>{`
        table.bc-table th {
          position: relative;
          cursor: pointer;
          background-color: #003366;
          color: white;
          text-align: left;
          padding: 0.5rem;
          height: 4rem;
        }

        th:not(last-child) {
          border-right: 1px solid #ccc;
        }

        th:first-child {
          border-top-left-radius: 0.25rem;
          border-left: 1px solid #003366;
          border-top: 1px solid #003366;
        }

        th:last-child {
          border-top-right-radius: 0.25rem;
          border-right: 1px solid #003366;
          border-top: 1px solid #003366;
        }

        span[role="button"] {
          height: 100%;
          position: absolute;
          right: 0.75em;
        }
      `}</style>
    </th>
  );
};

export default SortableHeader;
