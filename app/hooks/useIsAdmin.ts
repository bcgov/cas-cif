import { ADMIN_ROLES } from "data/group-constants";
import { useMemo } from "react";

/**
 * Hook to check if the given userGroups makes the user an admin
 * @returns {boolean} Memoized boolean value
 */
const useIsAdmin = (userGroups: readonly string[]) => {
  return useMemo(
    () => ADMIN_ROLES.some((role) => userGroups?.includes(role)),
    [userGroups]
  );
};

export default useIsAdmin;
