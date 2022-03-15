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
  loading?: boolean;
  onRouteUpdate: (url: any, mode: "replace" | "push") => void;
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
  loading,
  onRouteUpdate,
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

    onRouteUpdate(url, "replace");
  };
  return (
    <th
      onClick={() => sortable && handleClick()}
      aria-sort={sortDirection}
      className={loading ? "loading" : ""}
      aria-disabled={loading}
    >
      {displayName}&nbsp;
      {sortable && (
        <FontAwesomeIcon
          color="white"
          icon={SORT_DIRECTIONS[sortDirection].icon}
        />
      )}
      <style jsx>{`
        th {
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
          padding: 0.5rem;
        }

        th:last-child {
          border-top-right-radius: 0.25rem;
          border-right: 1px solid #003366;
          border-top: 1px solid #003366;
        }

        .loading {
          cursor: not-allowed;
          pointer-events: none;
          animation: shimmer-animation 2s infinite linear;
          background: linear-gradient(
            to right,
            #003366 4%,
            #38598a 25%,
            #003366 36%
          );
          background-size: 500px 100%;
        }

        @keyframes shimmer-animation {
          0% {
            background-position: -500px 0;
          }
          100% {
            background-position: 500px 0;
          }
        }
      `}</style>
    </th>
  );
};

export default SortableHeader;
