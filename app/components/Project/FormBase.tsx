import FormBorder from "components/Layout/FormBorder";
import { useEffect, useRef } from "react";
import Form from "lib/theme/service-development-toolkit-form";
import { JSONSchema7 } from "json-schema";
import FormComponentProps from "./FormComponentProps";

interface Props extends FormComponentProps {
  createInitialData: (data: object) => object;
  schema: JSONSchema7;
  uiSchema: object;
}

const FormBase: React.FunctionComponent<Props> = ({
  formData,
  applyChangesFromComponent,
  onFormErrors,
  createInitialData,
  schema,
  uiSchema,
}) => {
  // We restrict the data to only the fields we care about
  // It's important to default to `undefined` so we trigger the errors on rjsf
  const initialData = createInitialData(formData);

  const makeErrorsObject = (errorSchema) => {
    const keys = Object.keys(initialData);
    const returnVal = {};
    keys.forEach((key) => {
      if (errorSchema[key]) {
        returnVal[key] = errorSchema[key];
      } else {
        returnVal[key] = null;
      }
    });
    return returnVal;
  };

  const formRef = useRef();

  useEffect(() => {
    // @ts-ignore
    const { errorSchema } = formRef.current.validate(initialData, schema);
    onFormErrors(makeErrorsObject(errorSchema));
  }, []);

  return (
    <>
      <FormBorder title="Background">
        <Form
          // @ts-ignore
          ref={formRef}
          schema={schema}
          uiSchema={uiSchema}
          formData={initialData}
          onChange={(change) => {
            applyChangesFromComponent(change.formData);
            onFormErrors(makeErrorsObject(change.errorSchema));
          }}
          liveValidate
        ></Form>
      </FormBorder>
    </>
  );
};

export default FormBase;
