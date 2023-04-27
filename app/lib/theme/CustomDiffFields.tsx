import React from "react";
import { FieldProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";
import { getLocaleFormattedDate } from "./getLocaleFormattedDate";

const contentSuffixElement = (
  id: string,
  contentSuffix: string
): JSX.Element => {
  return (
    <span
      id={id && `${id}-contentSuffix`}
      className="contentSuffix"
      style={{ paddingLeft: "1em" }}
    >
      {contentSuffix}
    </span>
  );
};

interface OverwriteNotificationArgument {
  latestCommittedData: any;
  isNumber?: boolean;
  isDate?: boolean;
  isMoney?: boolean;
  isPercentage?: boolean;
  numberOfDecimalPlaces?: number;
}

const overwriteNotification = (
  specs: OverwriteNotificationArgument
): string | number | JSX.Element => {
  const {
    latestCommittedData,
    isNumber,
    isDate,
    isMoney,
    isPercentage,
    numberOfDecimalPlaces,
  } = specs;

  const displayString = "";

  if (!latestCommittedData) {
    return `${displayString}Not Entered`;
  }
  if (latestCommittedData.isArray && latestCommittedData.length() === 0) {
    return `${displayString}none`;
  }
  if (isDate) {
    return `${displayString}${getLocaleFormattedDate(latestCommittedData)}`;
  }
  if (isNumber) {
    const decimalScale = isMoney ? 2 : numberOfDecimalPlaces ?? 0;
    return (
      <>
        {displayString}
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={decimalScale}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={latestCommittedData}
        />
      </>
    );
  }
  return `${displayString}${latestCommittedData}`;
};

const showStringDiff = (
  id: string,
  oldData: string,
  newData: string,
  latestCommittedData: string,
  isDate?: boolean,
  contentSuffix?: string,
  isAmendmentsAndOtherRevisionsSpecific?: boolean
): JSX.Element => {
  // defining the class names if we are showing a revision specific diff
  const [diffOldClsName, diffNewClsName] = isAmendmentsAndOtherRevisionsSpecific
    ? [
        "diffAmendmentsAndOtherRevisionsOld",
        "diffAmendmentsAndOtherRevisionsNew",
      ]
    : [
        "diffReviewAndSubmitInformationOld",
        "diffReviewAndSubmitInformationNew",
      ];
  return (
    <>
      <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
        {isDate ? getLocaleFormattedDate(oldData) : oldData}
      </span>
      <FontAwesomeIcon
        className={"diff-arrow"}
        size="lg"
        color="black"
        icon={faLongArrowAltRight}
      />
      <span id={id && `${id}-${diffNewClsName}`} className={diffNewClsName}>
        {isDate ? getLocaleFormattedDate(newData) : newData}
      </span>
    </>
  );
};

const showStringAdded = (
  id: string,
  newData: string,
  latestCommittedData,
  isDate: boolean = false,
  contentSuffix?: string,
  isAmendmentsAndOtherRevisionsSpecific?: boolean
): JSX.Element => {
  const diffClsName = isAmendmentsAndOtherRevisionsSpecific
    ? "diffAmendmentsAndOtherRevisionsNew"
    : "diffReviewAndSubmitInformationNew";

  return (
    <>
      <>
        {overwriteNotification({ latestCommittedData, isDate })}
        <FontAwesomeIcon
          className={"diff-arrow"}
          size="lg"
          color="black"
          icon={faLongArrowAltRight}
        />
        <span id={id && `${id}-${diffClsName}`} className={diffClsName}>
          {" "}
          {newData} {"show string added"}
        </span>
      </>
    </>
  );
};

const showStringRemoved = (
  id: string,
  oldData: string,
  latestCommittedData: string,
  isDate: boolean = false,
  contentSuffix?: string,
  isAmendmentsAndOtherRevisionsSpecific?: boolean
): JSX.Element => {
  const diffClsName = isAmendmentsAndOtherRevisionsSpecific
    ? "diffAmendmentsAndOtherRevisionsOld"
    : "diffReviewAndSubmitInformationOld";
  return (
    <>
      <span id={id && `${id}-${diffClsName}`} className={diffClsName}>
        {isDate ? getLocaleFormattedDate(oldData) : oldData}
      </span>
      {contentSuffix && contentSuffixElement(id, contentSuffix)}
      {!isAmendmentsAndOtherRevisionsSpecific && (
        <>
          <FontAwesomeIcon
            className={"diff-arrow"}
            size="lg"
            color="black"
            icon={faLongArrowAltRight}
          />
          <span>
            <strong>
              <em>REMOVED{"show string removed"}</em>
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
  latestCommittedData: number,
  isMoney: boolean,
  isPercentage: boolean,
  numberOfDecimalPlaces: number = 0,
  isAmendmentsAndOtherRevisionsSpecific?: boolean
): JSX.Element => {
  const decimalScale = isMoney ? 2 : numberOfDecimalPlaces ?? 0;
  const [diffOldClsName, diffNewClsName] = isAmendmentsAndOtherRevisionsSpecific
    ? [
        "diffAmendmentsAndOtherRevisionsOld",
        "diffAmendmentsAndOtherRevisionsNew",
      ]
    : [
        "diffReviewAndSubmitInformationOld",
        "diffReviewAndSubmitInformationNew",
      ];
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
      {!isAmendmentsAndOtherRevisionsSpecific && (
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
        xx
      </span>
    </>
  );
};

const showNumberAdded = (
  id: string,
  newData: number,
  latestCommittedData: number,
  isMoney: boolean,
  isPercentage: boolean,
  numberOfDecimalPlaces: number = 0,
  isAmendmentsAndOtherRevisionsSpecific?: boolean
): JSX.Element => {
  const diffClsName = isAmendmentsAndOtherRevisionsSpecific
    ? "diffAmendmentsAndOtherRevisionsNew"
    : "diffReviewAndSubmitInformationNew";

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
      {isAmendmentsAndOtherRevisionsSpecific ? (
        <span>
          <em>(ADDED)</em>
          <style jsx>{`
            span {
              color: #cd2026;
            }
          `}</style>
        </span>
      ) : (
        <>
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
      )}
    </>
  );
};

const showNumberRemoved = (
  id: string,
  oldData: number,
  latestCommittedData: number,
  isMoney: boolean,
  isPercentage: boolean,
  numberOfDecimalPlaces: number = 0,
  isAmendmentsAndOtherRevisionsSpecific?: boolean
): JSX.Element => {
  const diffClsName = isAmendmentsAndOtherRevisionsSpecific
    ? "diffAmendmentsAndOtherRevisionsOld"
    : "diffReviewAndSubmitInformationOld";

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
      {!isAmendmentsAndOtherRevisionsSpecific && (
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
const getStringDiffType = (
  prevValue: string,
  newValue: string,
  operation: string
): string => {
  if (operation === "ARCHIVE" || (!newValue && prevValue)) {
    return "remove";
  } else if (!prevValue && newValue && operation !== "ARCHIVE") {
    return "add";
  } else if (prevValue !== newValue && operation === "UPDATE") {
    return "diff";
  } else {
    return "error";
  }
};
const CUSTOM_DIFF_FIELDS: Record<
  string,
  React.FunctionComponent<FieldProps>
> = {
  StringField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const previousValue = formContext?.oldData?.[props.name];
    const latestCommittedValue = formContext?.latestCommittedData?.[props.name];
    const isDate = uiSchema["ui:widget"] === "DateWidget";
    const contentSuffix = uiSchema?.["ui:options"]?.contentSuffix;
    const isAmendmentsAndOtherRevisionsSpecific =
      formContext?.isAmendmentsAndOtherRevisionsSpecific;

    const diffType = getStringDiffType(
      previousValue,
      formData,
      formContext.operation
    );

    switch (diffType) {
      case "diff":
        return showStringDiff(
          id,
          previousValue,
          formData,
          latestCommittedValue,
          isDate,
          contentSuffix as string,
          isAmendmentsAndOtherRevisionsSpecific
        );
      case "add":
        return showStringAdded(
          id,
          formData,
          latestCommittedValue,
          isDate,
          undefined,
          isAmendmentsAndOtherRevisionsSpecific
        );
      case "remove":
        return showStringRemoved(
          id,
          previousValue,
          latestCommittedValue,
          isDate,
          contentSuffix as string,
          isAmendmentsAndOtherRevisionsSpecific
        );
      default:
        return <>DISPLAY ERROR</>;
    }
  },
  NumberField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const previousValue = formContext?.oldData?.[props.name];
    const latestCommittedValue = formContext?.latestCommittedData?.[props.name];
    const isDate = uiSchema["ui:widget"] === "DateWidget";
    const contentSuffix = uiSchema?.["ui:options"]?.contentSuffix;
    const isAmendmentsAndOtherRevisionsSpecific =
      formContext?.isAmendmentsAndOtherRevisionsSpecific;

    if (uiSchema["ui:options"]) {
      const oldDataOptionText =
        formContext?.oldUiSchema?.[props.name]?.["ui:options"]?.text ??
        previousValue;

      const newDataOptionText = uiSchema["ui:options"].text || formData;

      const latestCommittedDataOptionText =
        formContext?.latestCommittedUiSchema?.[props.name]?.["ui:options"]
          ?.text || latestCommittedValue;

      if (
        previousValue !== null &&
        previousValue !== undefined &&
        formData !== null &&
        formData !== undefined &&
        formContext.operation === "UPDATE"
      ) {
        return showStringDiff(
          id,
          oldDataOptionText,
          newDataOptionText as string,
          latestCommittedDataOptionText,
          false,
          undefined,
          isAmendmentsAndOtherRevisionsSpecific
        );
      } else if (
        (previousValue === null || previousValue === undefined) &&
        formData &&
        formContext.operation !== "ARCHIVE"
      ) {
        return showStringAdded(
          id,
          newDataOptionText,
          latestCommittedDataOptionText,
          false,
          contentSuffix as string,
          isAmendmentsAndOtherRevisionsSpecific
        );
      } else if (
        formContext.operation === "ARCHIVE" ||
        ((formData === null || formData === undefined) &&
          previousValue !== null &&
          previousValue !== undefined)
      ) {
        return showStringRemoved(
          id,
          oldDataOptionText,
          latestCommittedDataOptionText,
          false,
          contentSuffix as string,
          isAmendmentsAndOtherRevisionsSpecific
        );
      } else if (
        !previousValue &&
        !formData &&
        formContext.operation === "CREATE"
      ) {
        return showStringAdded(
          id,
          (uiSchema["ui:options"].text as string) ?? formData,
          latestCommittedDataOptionText,
          isDate,
          contentSuffix as string,
          isAmendmentsAndOtherRevisionsSpecific
        );
      } else {
        return <>DISPLAY ERROR</>;
      }
    } else {
      if (
        previousValue !== undefined &&
        previousValue !== null &&
        formData !== undefined &&
        formData !== null &&
        formContext.operation === "UPDATE"
      ) {
        return showNumberDiff(
          id,
          formContext?.oldData?.[props.name],
          formData,
          latestCommittedValue,
          uiSchema?.isMoney,
          uiSchema?.isPercentage,
          uiSchema?.numberOfDecimalPlaces,
          isAmendmentsAndOtherRevisionsSpecific
        );
      } else if (
        !previousValue &&
        formData !== undefined &&
        formContext.operation !== "ARCHIVE"
      ) {
        return showNumberAdded(
          id,
          formData,
          latestCommittedValue,
          uiSchema?.isMoney,
          uiSchema?.isPercentage,
          uiSchema?.numberOfDecimalPlaces,
          isAmendmentsAndOtherRevisionsSpecific
        );
      } else if (
        formContext.operation === "ARCHIVE" ||
        (!formData && previousValue !== undefined)
      ) {
        return showNumberRemoved(
          id,
          formContext?.oldData?.[props.name],
          latestCommittedValue,
          uiSchema?.isMoney,
          uiSchema?.isPercentage,
          uiSchema?.numberOfDecimalPlaces,
          isAmendmentsAndOtherRevisionsSpecific
        );
      } else {
        return <>DISPLAY ERROR</>;
      }
    }
  },
};

export default CUSTOM_DIFF_FIELDS;
