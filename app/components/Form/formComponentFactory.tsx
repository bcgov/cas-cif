import DefaultForm from "./DefaultForm";
import FormComponentProps from "./FormComponentProps";
import ProjectForm from "./ProjectForm";

const staticFactory = new Map<
  string,
  React.FunctionComponent<FormComponentProps>
>([["project", (props) => <ProjectForm {...props} />]]);

const createFormFor = (table: string) => {
  return {
    FormComponent: staticFactory.has(table)
      ? staticFactory.get(table)
      : DefaultForm,
  };
};

const formComponentFactory = { createFormFor };

export default formComponentFactory;
