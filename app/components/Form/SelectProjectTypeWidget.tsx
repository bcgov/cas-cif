import { WidgetProps } from "@rjsf/core";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import Dropdown from "@button-inc/bcgov-theme/Dropdown";

const SelectProjectType: React.FunctionComponent<WidgetProps> = (props) => {
  const { id, onChange, placeholder, required, uiSchema, value, formContext } =
    props;

  const { allProjectTypes } = useFragment(
    graphql`
      fragment SelectProjectTypeWidget_query on Query {
        allProjectTypes {
          edges {
            node {
              name
            }
          }
        }
      }
    `,
    formContext.query
  );

  console.log("formContext.form", formContext.form);
  const { projectType } = formContext.form || {};

  const projectTypeList = useMemo(() => {
    return allProjectTypes.edges
      .filter((edge) => {
        return edge.node.name == projectType;
      })
      .map((edge) => edge.node.projectStatusByProjectStatusId);
  }, [allProjectTypes, projectType]);

  return (
    <div>
      <Dropdown
        id={id}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        size={(uiSchema && uiSchema["bcgov:size"]) || "large"}
        required={required}
        value={value}
      >
        <option key={`option-placeholder-${id}`} value={undefined}>
          {placeholder}
        </option>
        {projectTypeList.map((type) => {
          return (
            <option key={type.rowId} value={type.rowId}>
              {type.name}
            </option>
          );
        })}
      </Dropdown>
      <style jsx>
        {`
          div :global(input) {
            width: 100%;
          }
          div :global(.pg-select-wrapper) {
            padding: 9px 20px 9px 2px;
            margin-bottom: 5px;
            margin-top: 2px;
          }
        `}
      </style>
    </div>
  );
};

export default SelectProjectType;
