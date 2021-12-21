const FieldTemplate = ({ children, errors, help }) => {
  return (
    <>
      <div>
        {children}
        {errors}
        {help}
      </div>
      <style jsx>{`
        div:not(:last-child) {
          margin-bottom: 1em;
        }
      `}</style>
    </>
  );
};

export default FieldTemplate;
