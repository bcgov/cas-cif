import React from "react";
import Input from "@button-inc/bcgov-theme/Input";

const ProjectBackgroundForm: React.FunctionComponent<{}> = () => {
  return (
    <>
      <fieldset>
        <legend>Background</legend>
        <Input />
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

export default ProjectBackgroundForm;
