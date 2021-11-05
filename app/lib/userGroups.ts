const GROUP_META = require("../data/groups.json");

export const getAllGroups = () => {
  return Object.keys(GROUP_META);
};

export const compactGroups = (groups) => {
  const allDefinedGroups = getAllGroups();

  return groups.filter((group) => allDefinedGroups.includes(group));
};

export const getPriorityGroupData = (validGroups: readonly string[]) => {
  // Find the highest priority group
  let priorityGroup = {
    name: "Guest",
    ...GROUP_META.Guest,
  };

  for (let x = 0, len = validGroups.length; x < len; x++) {
    const name = validGroups[x];
    const curr = GROUP_META[name];

    if (curr.priority < priorityGroup.priority) {
      priorityGroup = { ...curr, name };
    }
  }

  return priorityGroup;
};

export const getPriorityGroup = (groupNames: readonly string[]) => {
  const validGroups = compactGroups(groupNames);
  const priorityGroupData = getPriorityGroupData(validGroups);

  return priorityGroupData.name;
};

export const getUserGroupLandingRoute = (groupNames: readonly string[]) => {
  const validGroups = compactGroups(groupNames);
  const priorityGroupData = getPriorityGroupData(validGroups);

  return priorityGroupData.path;
};
