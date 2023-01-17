import { Dispatch, SetStateAction } from "react";

export interface SummaryFormProps {
  projectRevision: any;
  viewOnly?: boolean;
  isOnAmendmentsAndOtherRevisionsPage?: boolean;
  setHasDiff?: Dispatch<SetStateAction<boolean>>;
}

export interface IFormConfiguration {
  slug: string;
  editComponent: React.FC<{
    query: any;
    projectRevision: any;
    onSubmit: () => void;
  }>;
  viewComponent: React.FC<SummaryFormProps>;
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
