import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import camelToSnakeCase from "lib/helpers/camelToSnakeCase";

interface Props {
  columnName: string;
  displayName: string;
  sortable: boolean;
  hasTableHeader: boolean;
}

const SORT_DIRECTION = ["ASC", "DESC"];
const SORT_ICONS = [faCaretDown, faCaretUp];

const SortableHeader: React.FC<Props> = ({
  columnName,
  displayName,
  sortable,
}) => {
  const router = useRouter();
  const sortDirectionIndex = SORT_DIRECTION.indexOf(
    router.query.direction?.toString()
  );
  const [currentSortDirection, setCurrentSortDirection] = useState(
    Math.max(sortDirectionIndex, 0)
  );

  const getOrderbyString = (orderColumnName, sortDirection) => {
    return (
      camelToSnakeCase(orderColumnName).toUpperCase() +
      "_" +
      SORT_DIRECTION[sortDirection]
    );
  };

  const triggerSort = (sortColumnName) => {
    //Cycle
    const sortDirection = (currentSortDirection + 1) % 2;
    setCurrentSortDirection(sortDirection);

    const url = {
      pathname: router.pathname,
      query: {
        ...router.query,
        orderBy: getOrderbyString(sortColumnName, sortDirection),
      },
    };

    router.replace(url, url, { shallow: true });
  };

  return (
    <th onClick={() => sortable && triggerSort(columnName)}>
      <span>{displayName}</span>
      {sortable && (
        <span role="button">
          <FontAwesomeIcon
            color="white"
            icon={
              router.query.orderBy ===
              getOrderbyString(columnName, currentSortDirection)
                ? SORT_ICONS[currentSortDirection]
                : faSort
            }
          />
        </span>
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
