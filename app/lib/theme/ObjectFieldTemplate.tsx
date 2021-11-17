import Fieldset from "@button-inc/bcgov-theme/Fieldset";
import Grid from "@button-inc/bcgov-theme/Grid";

const ObjectFieldTemplate = (props) => {
  const { TitleField, DescriptionField } = props;

  return (
    <Fieldset id={props.idSchema.$id}>
      {(props.uiSchema["ui:title"] || props.title) && (
        <TitleField
          id={`${props.idSchema.$id}__title`}
          title={props.title || props.uiSchema["ui:title"]}
          required={props.required}
          formContext={props.formContext}
        />
      )}
      {props.description && (
        <DescriptionField
          id={`${props.idSchema.$id}__description`}
          description={props.description}
          formContext={props.formContext}
        />
      )}
      <Grid>
        <Grid.Row>{props.properties.map((prop) => prop.content)}</Grid.Row>
      </Grid>
    </Fieldset>
  );
};

export default ObjectFieldTemplate;
