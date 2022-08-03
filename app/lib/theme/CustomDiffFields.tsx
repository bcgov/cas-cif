import React from "react";
import { FieldProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";
import { getLocaleFormattedDate } from "./getLocaleFormattedDate";

const showStringDiff = (
  id: string,
  oldData: string,
  newData: string,
  isDate?: boolean,
  contentSuffix?: string
) => (
  <>
    <span id={id && `${id}-diffOld`} className="diffOld">
      {isDate ? getLocaleFormattedDate(oldData) : oldData}
    </span>
    <FontAwesomeIcon
      className={"diff-arrow"}
      size="lg"
      color="black"
      icon={faLongArrowAltRight}
    />
    <span id={id && `${id}-diffNew`} className="diffNew">
      {isDate ? getLocaleFormattedDate(newData) : newData}
    </span>
    <span
      id={id && `${id}-contentSuffix`}
      className="contentSuffix"
      style={{ paddingLeft: "1em" }}
    >
      {contentSuffix}
    </span>
  </>
);

const showStringAdded = (
  id: string,
  newData: string,
  isDate: boolean = false,
  contentSuffix?: string
) => (
  <>
    <span id={id && `${id}-diffNew`} className="diffNew">
      {isDate ? getLocaleFormattedDate(newData) : newData}
    </span>
    <FontAwesomeIcon
      className={"diff-arrow"}
      size="lg"
      color="black"
      icon={faLongArrowAltRight}
    />
    <span>
      <strong>
        <em>ADDED</em>
      </strong>
    </span>
    <span
      id={id && `${id}-contentSuffix`}
      className="contentSuffix"
      style={{ paddingLeft: "1em" }}
    >
      {contentSuffix}
    </span>
  </>
);

const showStringRemoved = (
  id: string,
  oldData: string,
  isDate: boolean = false,
  contentSuffix?: string
) => (
  <>
    <span id={id && `${id}-diffOld`} className="diffOld">
      {isDate ? getLocaleFormattedDate(oldData) : oldData}
    </span>
    <FontAwesomeIcon
      className={"diff-arrow"}
      size="lg"
      color="black"
      icon={faLongArrowAltRight}
    />
    <span>
      <strong>
        <em>REMOVED</em>
      </strong>
    </span>
    <span
      id={id && `${id}-contentSuffix`}
      className="contentSuffix"
      style={{ paddingLeft: "1em" }}
    >
      {contentSuffix}
    </span>
  </>
);

const showNumberDiff = (
  id: string,
  oldData: number,
  newData: number,
  isMoney: boolean,
  isPercentage: boolean
) => (
  <>
    <span id={id && `${id}-diffOld`} className="diffOld">
      <NumberFormat
        thousandSeparator
        prefix={isMoney ? "$" : ""}
        suffix={isPercentage ? " %" : ""}
        displayType="text"
        value={oldData}
      />
    </span>
    <FontAwesomeIcon
      className={"diff-arrow"}
      size="lg"
      color="black"
      icon={faLongArrowAltRight}
    />
    <span id={id && `${id}-diffNew`} className="diffNew">
      <NumberFormat
        thousandSeparator
        prefix={isMoney ? "$" : ""}
        suffix={isPercentage ? " %" : ""}
        displayType="text"
        value={newData}
      />
    </span>
  </>
);

const showNumberAdded = (
  id: string,
  newData: number,
  isMoney: boolean,
  isPercentage: boolean
) => (
  <>
    <span id={id && `${id}-diffNew`} className="diffNew">
      <NumberFormat
        thousandSeparator
        prefix={isMoney ? "$" : ""}
        suffix={isPercentage ? " %" : ""}
        displayType="text"
        value={newData}
      />
    </span>
    <FontAwesomeIcon
      className={"diff-arrow"}
      size="lg"
      color="black"
      icon={faLongArrowAltRight}
    />
    <span>
      <strong>
        <em>ADDED</em>
      </strong>
    </span>
  </>
);

const showNumberRemoved = (
  id: string,
  oldData: number,
  isMoney: boolean,
  isPercentage: boolean
) => (
  <>
    <span id={id && `${id}-diffOld`} className="diffOld">
      <NumberFormat
        thousandSeparator
        prefix={isMoney ? "$" : ""}
        suffix={isPercentage ? " %" : ""}
        displayType="text"
        value={oldData}
      />
    </span>
    <FontAwesomeIcon
      className={"diff-arrow"}
      size="lg"
      color="black"
      icon={faLongArrowAltRight}
    />
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
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const previousValue = formContext?.oldData?.[props.name];
    const isDate = ["DueDateWidget", "DateWidget"].includes(
      uiSchema["ui:widget"] as string
    );

    if (previousValue && formData && formContext.operation === "UPDATE") {
      return showStringDiff(id, previousValue, formData, isDate);
    } else if (
      !previousValue &&
      formData &&
      formContext.operation !== "ARCHIVE"
    ) {
      return showStringAdded(id, formData, isDate);
    } else if (
      formContext.operation === "ARCHIVE" ||
      (!formData && previousValue)
    ) {
      return showStringRemoved(id, previousValue, isDate);
    } else {
      return <>DISPLAY ERROR</>;
    }
  },
  NumberField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const previousValue = formContext?.oldData?.[props.name];
    const contentSuffix = uiSchema?.["ui:options"]?.contentSuffix;

    if (uiSchema["ui:options"]) {
      if (previousValue && formData && formContext.operation === "UPDATE") {
        const oldData =
          formContext?.oldUiSchema?.[props.name]?.["ui:options"]?.text ||
          formContext?.oldData?.[props.name];
        const newData = uiSchema["ui:options"].text || formData;

        return showStringDiff(
          id,
          oldData,
          newData as string,
          false,
          contentSuffix as string
        );
      } else if (
        !previousValue &&
        formData &&
        formContext.operation !== "ARCHIVE"
      ) {
        const newData = uiSchema["ui:options"].text || formData;
        return showStringAdded(id, newData, false, contentSuffix as string);
      } else if (
        formContext.operation === "ARCHIVE" ||
        (!formData && previousValue)
      ) {
        const oldData =
          formContext?.oldUiSchema?.[props.name]?.["ui:options"]?.text ||
          formContext?.oldData?.[props.name];
        return showStringRemoved(id, oldData, false, contentSuffix as string);
      } else if (
        !previousValue &&
        !formData &&
        formContext.operation === "CREATE"
      ) {
        return showStringAdded(id, uiSchema["ui:options"].text as string);
      } else {
        return <>DISPLAY ERROR</>;
      }
    } else {
      if (
        previousValue !== undefined &&
        formData !== undefined &&
        formContext.operation === "UPDATE"
      ) {
        return showNumberDiff(
          id,
          formContext?.oldData?.[props.name],
          formData,
          uiSchema?.["ui:widget"] === "MoneyWidget" ||
            uiSchema?.["ui:widget"] === "ConditionalAmountWidget",
          uiSchema?.["ui:widget"] === "PercentageWidget"
        );
      } else if (
        !previousValue &&
        formData !== undefined &&
        formContext.operation !== "ARCHIVE"
      ) {
        return showNumberAdded(
          id,
          formData,
          uiSchema?.["ui:widget"] === "MoneyWidget" ||
            uiSchema?.["ui:widget"] === "ConditionalAmountWidget",
          uiSchema?.["ui:widget"] === "PercentageWidget"
        );
      } else if (
        formContext.operation === "ARCHIVE" ||
        (!formData && previousValue !== undefined)
      ) {
        return showNumberRemoved(
          id,
          formContext?.oldData?.[props.name],
          uiSchema?.["ui:widget"] === "MoneyWidget" ||
            uiSchema?.["ui:widget"] === "ConditionalAmountWidget",
          uiSchema?.["ui:widget"] === "PercentageWidget"
        );
      } else {
        return <>DISPLAY ERROR</>;
      }
    }
  },
};

export default CUSTOM_DIFF_FIELDS;
