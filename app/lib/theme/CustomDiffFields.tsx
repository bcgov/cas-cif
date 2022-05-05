import React from "react";
import { FieldProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";

const showStringDiff = (id: string, oldData: string, newData: string) => (
  <>
    <span id={id && `${id}-diffOld`} className="diffOld">
      {oldData}
    </span>
    &nbsp;
    <FontAwesomeIcon size="lg" color="black" icon={faLongArrowAltRight} />
    &nbsp;
    <span id={id && `${id}-diffNew`} className="diffNew">
      {newData}
    </span>
  </>
);

const showStringAdded = (id: string, newData: string) => (
  <>
    <span id={id && `${id}-diffNew`} className="diffNew">
      {newData}
    </span>
    &nbsp;
    <FontAwesomeIcon size="lg" color="black" icon={faLongArrowAltRight} />
    &nbsp;
    <span>
      <strong>
        <em>ADDED</em>
      </strong>
    </span>
  </>
);

const showStringRemoved = (id: string, oldData: string) => (
  <>
    <span id={id && `${id}-diffOld`} className="diffOld">
      {oldData}
    </span>
    &nbsp;
    <FontAwesomeIcon size="lg" color="black" icon={faLongArrowAltRight} />
    &nbsp;
    <span>
      <strong>
        <em>REMOVED</em>
      </strong>
    </span>
  </>
);

const showNumberDiff = (
  id: string,
  oldData: number,
  newData: number,
  isMoney: boolean
) => (
  <>
    <span id={id && `${id}-diffOld`} className="diffOld">
      <NumberFormat
        thousandSeparator
        prefix={isMoney ? "$" : ""}
        id={id}
        displayType="text"
        value={oldData}
      />
    </span>
    &nbsp;
    <FontAwesomeIcon size="lg" color="black" icon={faLongArrowAltRight} />
    &nbsp;
    <span id={id && `${id}-diffNew`} className="diffNew">
      <NumberFormat
        thousandSeparator
        prefix={isMoney ? "$" : ""}
        id={id}
        displayType="text"
        value={newData}
      />
    </span>
  </>
);

const showNumberAdded = (id: string, newData: number, isMoney: boolean) => (
  <>
    <span id={id && `${id}-diffNew`} className="diffNew">
      <NumberFormat
        thousandSeparator
        prefix={isMoney ? "$" : ""}
        id={id}
        displayType="text"
        value={newData}
      />
    </span>
    &nbsp;
    <FontAwesomeIcon size="lg" color="black" icon={faLongArrowAltRight} />
    &nbsp;
    <span>
      <strong>
        <em>ADDED</em>
      </strong>
    </span>
  </>
);

const showNumberRemoved = (id: string, oldData: number, isMoney: boolean) => (
  <>
    <span id={id && `${id}-diffOld`} className="diffOld">
      <NumberFormat
        thousandSeparator
        prefix={isMoney ? "$" : ""}
        id={id}
        displayType="text"
        value={oldData}
      />
    </span>
    &nbsp;
    <span>
      <strong>
        <em>REMOVED</em>
      </strong>
    </span>
  </>
);

const CUSTOM_DIFF_FIELDS: Record<
  string,
  React.FunctionComponent<FieldProps>
> = {
  StringField: (props) => {
    const { idSchema, formData, formContext } = props;
    const id = idSchema?.$id;
    const previousValue = formContext?.oldData?.[props.name];

    if (previousValue && formData) {
      return showStringDiff(id, previousValue, formData);
    } else if (
      !previousValue &&
      formData &&
      formContext.operation === "CREATE"
    ) {
      return showStringAdded(id, formData);
    } else if (
      formContext.operation === "ARCHIVE" ||
      (!formData && previousValue)
    ) {
      return showStringRemoved(id, previousValue);
    } else {
      return <>DISPLAY ERROR</>;
    }
  },
  NumberField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const previousValue = formContext?.oldData?.[props.name];

    if (uiSchema["ui:options"]) {
      if (previousValue && formData && formContext.operation === "UPDATE") {
        return showStringDiff(
          id,
          formContext?.oldUiSchema?.[props.name]?.["ui:options"]?.text,
          uiSchema["ui:options"].text as string
        );
      } else if (
        !previousValue &&
        formData &&
        formContext.operation === "CREATE"
      ) {
        return showStringAdded(id, uiSchema["ui:options"].text as string);
      } else if (
        formContext.operation === "ARCHIVE" ||
        (!formData && previousValue)
      ) {
        return showStringRemoved(
          id,
          formContext?.oldUiSchema?.[props.name]?.["ui:options"]?.text
        );
      } else {
        return <>DISPLAY ERROR</>;
      }
    } else {
      if (previousValue && formData && formContext.operation === "UPDATE") {
        return showNumberDiff(
          id,
          formContext?.oldData?.[props.name],
          formData,
          uiSchema?.["ui:widget"] === "MoneyWidget"
        );
      } else if (
        !previousValue &&
        formData &&
        formContext.operation === "CREATE"
      ) {
        return showNumberAdded(
          id,
          formData,
          uiSchema?.["ui:widget"] === "MoneyWidget"
        );
      } else if (
        formContext.operation === "ARCHIVE" ||
        (!formData && previousValue)
      ) {
        return showNumberRemoved(
          id,
          formContext?.oldData?.[props.name],
          uiSchema?.["ui:widget"] === "MoneyWidget"
        );
      } else {
        return <>DISPLAY ERROR</>;
      }
    }
  },
};

export default CUSTOM_DIFF_FIELDS;
