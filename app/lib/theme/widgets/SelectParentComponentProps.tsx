import { WidgetProps } from "@rjsf/core";
import { EntitySchema } from "./SelectParentWidget";

export default interface SelectParentComponentProps extends WidgetProps {
  parent: EntitySchema;
  child: EntitySchema;
  foreignKey: string;
}
