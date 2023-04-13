import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { graphql, useFragment } from "react-relay";
import { ExternalProjectFormSummary_projectRevision$key } from "__generated__/ExternalProjectFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";
import externalSchema from "data/jsonSchemaForm/externalSchema";

interface Props {
  projectRevision: ExternalProjectFormSummary_projectRevision$key;
}

const ExternalProjectFormSummary: React.FC<Props> = ({ projectRevision }) => {
  const { projectFormChange } = useFragment(
    graphql`
      fragment ExternalProjectFormSummary_projectRevision on ProjectRevision {
        projectFormChange {
          newFormData
        }
      }
    `,
    projectRevision
  );

  return (
    <>
      <FormBase
        tagName={"dl"}
        theme={readOnlyTheme}
        schema={externalSchema as JSONSchema7}
        formData={projectFormChange?.newFormData}
      />
    </>
  );
};

export default ExternalProjectFormSummary;
