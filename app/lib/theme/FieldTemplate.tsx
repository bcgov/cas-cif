const FieldTemplate = ({ children, errors, help }) => {
  return (
    <>
      {children}
      {errors}
      {help}
    </>
  );
};

export default FieldTemplate;
