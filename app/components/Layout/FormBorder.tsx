import React from "react";

interface Props {
  title: string;
}

const FormBorder: React.FunctionComponent<Props> = (props) => {
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
