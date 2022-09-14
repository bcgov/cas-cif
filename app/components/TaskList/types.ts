import React from "react";
import { TaskListItemComponentProps } from "./TaskListItemComponents/BaseTaskListItemsComponent";

export type TaskListMode = "view" | "update" | "create";

export type TaskListDynamicConfiguration = {
  [key: string]: {
    context: { status: string; [key: string]: any }[];
    ItemsComponent: React.FC<TaskListItemComponentProps>;
  };
};
