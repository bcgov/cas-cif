import FormBase from "components/Form/FormBase";
import { Button } from "@button-inc/bcgov-theme";
import { JSONSchema7 } from "json-schema";

interface Props {
  jsonSchema: {
    schema: string;
  };
}

const OperatorForm: React.FC<Props> = ({ jsonSchema }) => {
  console.log(jsonSchema);
  const parsedSchema = JSON.parse(JSON.stringify(jsonSchema.schema));
  return (
    <FormBase schema={parsedSchema as JSONSchema7} uiSchema={{}}>
      <Button type="submit" style={{ marginRight: "1rem" }}>
        Submit
      </Button>
      <Button type="button" variant="secondary">
        Discard Changes
      </Button>
    </FormBase>
  );
};

export default OperatorForm;
