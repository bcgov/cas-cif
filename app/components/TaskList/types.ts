import React from "react";
import { UrlObject } from "url";
import { TaskListItemComponentProps } from "./TaskListItemComponents/BaseTaskListItemsComponent";

export type TaskListMode = "view" | "update" | "create";

export type TaskListDynamicConfiguration = {
  [key: string]: {
    context: { status: string; [key: string]: any }[];
    ItemsComponent: React.FC<TaskListItemComponentProps>;
  };
};

export type TaskListLinkUrl = {
  pathname: string;
  query?: { projectRevision: string };
} & UrlObject;
