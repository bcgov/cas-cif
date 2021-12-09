import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "./components/FormBorder";

const DefaultDescriptionField = ({ id, description }) => (
  <span id={id}>{description}</span>
);

const ObjectFieldTemplate = (props) => {
  const DescriptionField = props.DescriptionField || DefaultDescriptionField;

  return (
    <Grid cols={10}>
      {props.description && (
        <Grid.Row>
          <DescriptionField
            id={`${props.idSchema.$id}__description`}
            description={props.description}
            formContext={props.formContext}
          />
        </Grid.Row>
      )}

      <Grid.Row>
        <Grid.Col span={10} id="test">
          <FormBorder
            title={props.title ? props.title : props.uiSchema["ui:title"]}
          >
            {props.properties.map((prop) => prop.content)}
          </FormBorder>
        </Grid.Col>
      </Grid.Row>
    </Grid>
  );
};

export default ObjectFieldTemplate;
