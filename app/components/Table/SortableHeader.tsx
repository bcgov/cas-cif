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
  disabled?: boolean;
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
  disabled,
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
      className={disabled ? "disabled" : ""}
      aria-disabled={disabled}
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

        .disabled {
          cursor: not-allowed;
          pointer-events: none;
          opacity: 0.5;
        }
      `}</style>
    </th>
  );
};

export default SortableHeader;
