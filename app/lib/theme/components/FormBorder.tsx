interface Props {
  title: string;
}

const FormBorder: React.FC<Props> = (props) => {
  return (
    <>
      <fieldset>
        {props.title && <legend>{props.title}</legend>}
        {props.children}
      </fieldset>
      <style jsx>
        {`
          fieldset > legend {
            margin: 0 1em;
            padding: 0 1em;
          }

          fieldset {
            border: 1px solid #939393;
            border-radius: 0.25em;
            padding: 2em;
          }
        `}
      </style>
    </>
  );
};

export default FormBorder;
