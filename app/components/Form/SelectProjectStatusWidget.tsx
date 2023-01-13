import { WidgetProps } from "@rjsf/core";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import Dropdown from "@button-inc/bcgov-theme/Dropdown";

const SelectProjectStatus: React.FunctionComponent<WidgetProps> = (props) => {
  const { id, onChange, placeholder, required, uiSchema, value, formContext } =
    props;

  const { projectFormChange } = useFragment(
    graphql`
      fragment SelectProjectStatusWidget_projectRevision on ProjectRevision {
        projectFormChange {
          asProject {
            fundingStreamRfpByFundingStreamRfpId {
              fundingStreamByFundingStreamId {
                fundingStreamProjectStatusesByFundingStreamId(
                  orderBy: POSITION_ASC
                ) {
                  edges {
                    node {
                      projectStatusByProjectStatusId {
                        rowId
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    formContext.projectRevision
  );

  const projectStatusList = useMemo(() => {
    return projectFormChange.asProject.fundingStreamRfpByFundingStreamRfpId?.fundingStreamByFundingStreamId.fundingStreamProjectStatusesByFundingStreamId.edges.map(
      (edge) => edge.node.projectStatusByProjectStatusId
    );
  }, [projectFormChange]);

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
        {projectStatusList &&
          projectStatusList.map((status) => {
            return (
              <option key={status.rowId} value={status.rowId}>
                {status.name}
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

export default SelectProjectStatus;
