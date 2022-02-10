interface Props {
  tableName: string;
}

const DefaultForm: React.FunctionComponent<Props> = ({ tableName }) => {
  return <div>No component was found for {tableName}.</div>;
};

export default DefaultForm;
