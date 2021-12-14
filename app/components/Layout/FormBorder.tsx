interface Props {
  title: string;
}

const FormBorder: React.FC<Props> = (props) => {
  return (
    <>
      <fieldset>
        <legend>{props.title}</legend>
        {props.children}
      </fieldset>
      <style jsx>
        {`
          fieldset > legend {
            margin: 0 auto;
          }
        `}
      </style>
    </>
  );
};

export default FormBorder;
