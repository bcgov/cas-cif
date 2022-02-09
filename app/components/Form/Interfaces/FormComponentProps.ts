import { ErrorSchema, IChangeEvent } from "@rjsf/core";

export default interface FormComponentProps {
  formData: any;
  onChange?: (e: IChangeEvent<any>, es?: ErrorSchema) => any;
}
