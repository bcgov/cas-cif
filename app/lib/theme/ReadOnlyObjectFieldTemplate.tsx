const ReadOnlyObjectFieldTemplate = (props) => {
  return <div>{props.properties.map((prop) => prop.content)}</div>;
};

export default ReadOnlyObjectFieldTemplate;
