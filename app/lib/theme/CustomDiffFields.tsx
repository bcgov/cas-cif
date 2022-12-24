import React from "react";
import { FieldProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";
import { getLocaleFormattedDate } from "./getLocaleFormattedDate";

const contentSuffixElement = (
  id: string,
  contentSuffix: string
): JSX.Element => (
  <span
    id={id && `${id}-contentSuffix`}
    className="contentSuffix"
    style={{ paddingLeft: "1em" }}
  >
    {contentSuffix}
  </span>
);

const showStringDiff = (
  id: string,
  oldData: string,
  newData: string,
  isDate?: boolean,
  contentSuffix?: string,
  isRevisionSpecific?: boolean
): JSX.Element => {
  // defining the class names if we are showing a revision specific diff
  const [diffOldClsName, diffNewClsName] = isRevisionSpecific
    ? ["revisionDiffOld", "revisionDiffNew"]
    : ["diffOld", "diffNew"];

  return (
    <>
      <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
        {isDate ? getLocaleFormattedDate(oldData) : oldData}
      </span>
      {contentSuffix && contentSuffixElement(id, contentSuffix)}
      {!isRevisionSpecific && (
        <FontAwesomeIcon
          className={"diff-arrow"}
          size="lg"
          color="black"
          icon={faLongArrowAltRight}
        />
      )}
      <span id={id && `${id}-${diffNewClsName}`} className={diffNewClsName}>
        {isDate ? getLocaleFormattedDate(newData) : newData}
      </span>
      {contentSuffix && contentSuffixElement(id, contentSuffix)}
    </>
  );
};

const showStringAdded = (
  id: string,
  newData: string,
  isDate: boolean = false,
  contentSuffix?: string,
  isRevisionSpecific?: boolean
): JSX.Element => {
  const [diffClsName, arrowSize] = isRevisionSpecific
    ? ["revisionDiffNew", "sm"]
    : ["diffNew", "lg"];

  return (
    <>
      <span id={id && `${id}-${diffClsName}`} className={diffClsName}>
        {isDate ? getLocaleFormattedDate(newData) : newData}
      </span>
      {contentSuffix && contentSuffixElement(id, contentSuffix)}
      <FontAwesomeIcon
        className={"diff-arrow"}
        size={arrowSize as "sm" | "lg"}
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
};

const showStringRemoved = (
  id: string,
  oldData: string,
  isDate: boolean = false,
  contentSuffix?: string,
  isRevisionSpecific?: boolean
): JSX.Element => {
  const diffClsName = isRevisionSpecific ? "revisionDiffOld" : "diffOld";

  return (
    <>
      <span id={id && `${id}-${diffClsName}`} className={diffClsName}>
        {isDate ? getLocaleFormattedDate(oldData) : oldData}
      </span>
      {contentSuffix && contentSuffixElement(id, contentSuffix)}
      {!isRevisionSpecific && (
        <>
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
      )}
    </>
  );
};

const showNumberDiff = (
  id: string,
  oldData: number,
  newData: number,
  isMoney: boolean,
  isPercentage: boolean,
  numberOfDecimalPlaces: number = 0,
  isRevisionSpecific?: boolean
): JSX.Element => {
  const decimalScale = isMoney ? 2 : numberOfDecimalPlaces ?? 0;
  const [diffOldClsName, diffNewClsName] = isRevisionSpecific
    ? ["revisionDiffOld", "revisionDiffNew"]
    : ["diffOld", "diffNew"];

  return (
    <>
      <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={decimalScale}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={oldData}
        />
      </span>
      {!isRevisionSpecific && (
        <FontAwesomeIcon
          className={"diff-arrow"}
          size="lg"
          color="black"
          icon={faLongArrowAltRight}
        />
      )}
      <span id={id && `${id}-${diffNewClsName}`} className={diffNewClsName}>
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={decimalScale}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={newData}
        />
      </span>
    </>
  );
};

const showNumberAdded = (
  id: string,
  newData: number,
  isMoney: boolean,
  isPercentage: boolean,
  numberOfDecimalPlaces: number = 0,
  isRevisionSpecific?: boolean
): JSX.Element => {
  const [diffClsName, arrowSize] = isRevisionSpecific
    ? ["revisionDiffNew", "sm"]
    : ["diffNew", "lg"];

  return (
    <>
      <span id={id && `${id}-${diffClsName}`} className={diffClsName}>
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={isMoney ? 2 : numberOfDecimalPlaces ?? 0}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={newData}
        />
      </span>
      <FontAwesomeIcon
        className={"diff-arrow"}
        size={arrowSize as "sm" | "lg"}
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
};

const showNumberRemoved = (
  id: string,
  oldData: number,
  isMoney: boolean,
  isPercentage: boolean,
  numberOfDecimalPlaces: number = 0,
  isRevisionSpecific?: boolean
): JSX.Element => {
  const diffClsName = isRevisionSpecific ? "revisionDiffOld" : "diffOld";
  return (
    <>
      <span id={id && `${id}-${diffClsName}`} className={diffClsName}>
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={isMoney ? 2 : numberOfDecimalPlaces ?? 0}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={oldData}
        />
      </span>
      {!isRevisionSpecific && (
        <>
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
      )}
    </>
  );
};

const CUSTOM_DIFF_FIELDS: Record<
  string,
  React.FunctionComponent<FieldProps>
> = {
  StringField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const previousValue = formContext?.oldData?.[props.name];
    const isDate = uiSchema["ui:widget"] === "DateWidget";
    const contentSuffix = uiSchema?.["ui:options"]?.contentSuffix;
    const isRevisionSpecific = formContext?.isRevisionSpecific;

    if (previousValue && formData && formContext.operation === "UPDATE") {
      return showStringDiff(
        id,
        previousValue,
        formData,
        isDate,
        contentSuffix as string,
        isRevisionSpecific
      );
    } else if (
      !previousValue &&
      formData &&
      formContext.operation !== "ARCHIVE"
    ) {
      return showStringAdded(
        id,
        formData,
        isDate,
        contentSuffix as string,
        isRevisionSpecific
      );
    } else if (
      formContext.operation === "ARCHIVE" ||
      (!formData && previousValue)
    ) {
      return showStringRemoved(
        id,
        previousValue,
        isDate,
        contentSuffix as string,
        isRevisionSpecific
      );
    } else {
      return <>DISPLAY ERROR</>;
    }
  },
  NumberField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const previousValue = formContext?.oldData?.[props.name];
    const isDate = uiSchema["ui:widget"] === "DateWidget";
    const contentSuffix = uiSchema?.["ui:options"]?.contentSuffix;
    const isRevisionSpecific = formContext?.isRevisionSpecific;

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
          contentSuffix as string,
          isRevisionSpecific
        );
      } else if (
        !previousValue &&
        formData &&
        formContext.operation !== "ARCHIVE"
      ) {
        const newData = uiSchema["ui:options"].text || formData;
        return showStringAdded(
          id,
          newData,
          false,
          contentSuffix as string,
          isRevisionSpecific
        );
      } else if (
        formContext.operation === "ARCHIVE" ||
        (!formData && previousValue)
      ) {
        const oldData =
          formContext?.oldUiSchema?.[props.name]?.["ui:options"]?.text ||
          formContext?.oldData?.[props.name];
        return showStringRemoved(
          id,
          oldData,
          false,
          contentSuffix as string,
          isRevisionSpecific
        );
      } else if (
        !previousValue &&
        !formData &&
        formContext.operation === "CREATE"
      ) {
        return showStringAdded(
          id,
          uiSchema["ui:options"].text as string,
          isDate,
          contentSuffix as string,
          isRevisionSpecific
        );
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
          uiSchema?.isMoney,
          uiSchema?.isPercentage,
          uiSchema?.numberOfDecimalPlaces,
          isRevisionSpecific
        );
      } else if (
        !previousValue &&
        formData !== undefined &&
        formContext.operation !== "ARCHIVE"
      ) {
        return showNumberAdded(
          id,
          formData,
          uiSchema?.isMoney,
          uiSchema?.isPercentage,
          uiSchema?.numberOfDecimalPlaces,
          isRevisionSpecific
        );
      } else if (
        formContext.operation === "ARCHIVE" ||
        (!formData && previousValue !== undefined)
      ) {
        return showNumberRemoved(
          id,
          formContext?.oldData?.[props.name],
          uiSchema?.isMoney,
          uiSchema?.isPercentage,
          uiSchema?.numberOfDecimalPlaces,
          isRevisionSpecific
        );
      } else {
        return <>DISPLAY ERROR</>;
      }
    }
  },
};

export default CUSTOM_DIFF_FIELDS;
