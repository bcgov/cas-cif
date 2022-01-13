import { WidgetProps } from "@rjsf/core";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import Dropdown from "@button-inc/bcgov-theme/Dropdown";

const SelectProjectStatus: React.FunctionComponent<WidgetProps> = (props) => {
  const {
    id,
    onChange,
    placeholder,
    label,
    required,
    uiSchema,
    value,
    formContext,
  } = props;

  const { allFundingStreamRfpProjectStatuses } = useFragment(
    graphql`
      fragment SelectProjectStatusWidget_query on Query {
        allFundingStreamRfpProjectStatuses {
          edges {
            node {
              rowId
              fundingStreamRfpId
              projectStatusByProjectStatusId {
                rowId
                name
              }
            }
          }
        }
      }
    `,
    formContext.query
  );
  const { fundingStreamRfpId } = formContext.form;

  const projectStatusList = useMemo(() => {
    return allFundingStreamRfpProjectStatuses.edges
      .filter((edge) => {
        return edge.node.fundingStreamRfpId == fundingStreamRfpId;
      })
      .map((edge) => edge.node.projectStatusByProjectStatusId);
  }, [allFundingStreamRfpProjectStatuses, fundingStreamRfpId]);

  return (
    <>
      <label htmlFor={id}>{label}</label>
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
        {projectStatusList.map((status) => {
          return (
            <option key={status.rowId} value={status.rowId}>
              {status.name}
            </option>
          );
        })}
      </Dropdown>
      <style jsx>
        {`
          :global(input) {
            width: 100%;
          }
        `}
      </style>
    </>
  );
};

export default SelectProjectStatus;
