import Grid from "@button-inc/bcgov-theme/Grid";

const ReadOnlyObjectFieldTemplate = (props) => {
  return (
    <>
      <Grid cols={10}>
        <Grid.Row>
          <Grid.Col span={10}>
            {props.properties.map((prop) => prop.content)}
          </Grid.Col>
        </Grid.Row>
      </Grid>
    </>
  );
};

export default ReadOnlyObjectFieldTemplate;
