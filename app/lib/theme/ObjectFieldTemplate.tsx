import Fieldset from "@button-inc/bcgov-theme/Fieldset";
import Grid from "@button-inc/bcgov-theme/Grid";

const DefaultTitleField = ({ id, title }) => (
  <h1 id={id} title={title}>
    {title}
  </h1>
);
const DefaultDescriptionField = ({ id, description }) => (
  <span id={id}>{description}</span>
);

const ObjectFieldTemplate = (props) => {
  const TitleField = props.TitleField || DefaultTitleField;
  const DescriptionField = props.DescriptionField || DefaultDescriptionField;

  return (
    <Fieldset id={props.idSchema.$id}>
      <Grid>
        {(props.uiSchema["ui:title"] || props.title) && (
          <Grid.Row>
            <TitleField
              id={`${props.idSchema.$id}__title`}
              title={props.title || props.uiSchema["ui:title"]}
              required={props.required}
              formContext={props.formContext}
            />
          </Grid.Row>
        )}
        {props.description && (
          <Grid.Row>
            <DescriptionField
              id={`${props.idSchema.$id}__description`}
              description={props.description}
              formContext={props.formContext}
            />
          </Grid.Row>
        )}

        <Grid.Row>{props.properties.map((prop) => prop.content)}</Grid.Row>
      </Grid>
    </Fieldset>
  );
};

export default ObjectFieldTemplate;
