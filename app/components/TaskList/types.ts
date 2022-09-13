import React from "react";
import { TaskListItemComponentProps } from "./TaskListItemComponents/BaseTaskListItemsComponent";

export type TaskListMode = "view" | "update" | "create";

export interface IFormConfiguration {
  slug: string;
  editComponent: React.FC;
  viewComponent: React.FC;
}
export interface IFormItem<
  TFormConfiguration extends IFormConfiguration = IFormConfiguration
> {
  title: string;
  formConfiguration?: TFormConfiguration;
}
export interface IFormSection<
  TFormConfiguration extends IFormConfiguration = IFormConfiguration
> extends IFormItem<TFormConfiguration> {
  optional?: boolean;
  items?: IFormItem<TFormConfiguration>[];
}
export interface IIndexedFormConfiguration extends IFormConfiguration {
  formIndex: number;
}
export interface INumberedFormSection
  extends IFormSection<IIndexedFormConfiguration> {
  sectionNumber: number;
}

export type TaskListDynamicConfiguration = {
  [key: string]: {
    context: { status: string; [key: string]: any }[];
    ItemsComponent: React.FC<TaskListItemComponentProps>;
  };
};
