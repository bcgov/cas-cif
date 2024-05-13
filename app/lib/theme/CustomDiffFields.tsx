import React from "react";
import NumberFormat from "react-number-format";
import { getLocaleFormattedDate } from "./getLocaleFormattedDate";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";

const contentSuffixElement = (
  id: string,
  contentSuffix: string
): JSX.Element => {
  return (
    <span
      // Add random number to id to avoid duplicate ids when multiple fields have the same contentSuffix
      id={id && `${id}-contentSuffix-${Math.random().toFixed(2)}`}
      className="contentSuffix"
      style={{ paddingLeft: "1em" }}
    >
      {contentSuffix}
    </span>
  );
};

const NumberFormatWrapper = ({
  value,
  className,
  id,
  isMoney,
  isPercentage,
  decimalScale,
}) => (
  <NumberFormat
    thousandSeparator
    fixedDecimalScale={true}
    decimalScale={decimalScale}
    prefix={isMoney ? "$" : ""}
    suffix={isPercentage ? " %" : ""}
    displayType="text"
    value={value}
    className={className}
    id={id}
  />
);

const StringFormatWrapper = ({ value, className, id }) => (
  <span id={id} className={className}>
    {value}
  </span>
);

const renderArrow = () => {
  return (
    <FontAwesomeIcon
      className="diff-arrow"
      size="lg"
      color="black"
      icon={faLongArrowAltRight}
    />
  );
};

const renderDiffData = ({
  newData,
  latestCommittedData,
  id,
  isMoney,
  isPercentage,
  decimalScale,
  diffOldClsName,
  diffNewClsName,
  contentSuffix,
}) => {
  let components = [];

  if (
    latestCommittedData !== null &&
    latestCommittedData !== undefined &&
    latestCommittedData !== newData
  ) {
    components.push(
      <NumberFormatWrapper
        value={latestCommittedData}
        className={diffOldClsName}
        id={`${id}-${diffOldClsName}`}
        isMoney={isMoney}
        isPercentage={isPercentage}
        decimalScale={decimalScale}
      />
    );
    if (contentSuffix) {
      components.push(
        contentSuffixElement(`${id}-${diffOldClsName}`, contentSuffix)
      );
    }
    components.push(renderArrow());
  }

  if (
    newData !== null &&
    newData !== undefined &&
    latestCommittedData !== null &&
    latestCommittedData !== undefined
  ) {
    components.push(
      <NumberFormatWrapper
        value={newData}
        className={diffNewClsName}
        id={`${id}-${diffNewClsName}`}
        isMoney={isMoney}
        isPercentage={isPercentage}
        decimalScale={decimalScale}
      />
    );
    if (contentSuffix) {
      components.push(
        contentSuffixElement(`${id}-${diffNewClsName}`, contentSuffix)
      );
    }
  } else if (newData !== null && newData !== undefined) {
    components.push(<span className={diffOldClsName}>Not Entered</span>);
    components.push(renderArrow());
    components.push(
      <NumberFormatWrapper
        value={newData}
        className={diffNewClsName}
        id={`${id}-${diffNewClsName}`}
        isMoney={isMoney}
        isPercentage={isPercentage}
        decimalScale={decimalScale}
      />
    );
    if (contentSuffix) {
      components.push(
        contentSuffixElement(`${id}-${diffNewClsName}`, contentSuffix)
      );
    }
  }

  return <>{components}</>;
};

const renderDiffString = ({
  newData,
  latestCommittedData,
  id,
  isDate,
  contentSuffix,
  diffOldClsName,
  diffNewClsName,
}) => {
  let components = [];

  if (
    latestCommittedData !== null &&
    latestCommittedData !== undefined &&
    latestCommittedData !== newData
  ) {
    components.push(
      <StringFormatWrapper
        value={
          isDate
            ? getLocaleFormattedDate(latestCommittedData)
            : latestCommittedData
        }
        className={diffOldClsName}
        id={`${id}-${diffOldClsName}`}
      />
    );
    if (contentSuffix) {
      components.push(
        contentSuffixElement(`${id}-${diffOldClsName}`, contentSuffix)
      );
    }
    if (newData !== null && newData !== undefined) {
      components.push(renderArrow());
    }
  }

  if (
    newData !== null &&
    newData !== undefined &&
    latestCommittedData !== null &&
    latestCommittedData !== undefined
  ) {
    components.push(
      <StringFormatWrapper
        value={isDate ? getLocaleFormattedDate(newData) : newData}
        className={diffNewClsName}
        id={`${id}-${diffNewClsName}`}
      />
    );
    if (contentSuffix) {
      components.push(
        contentSuffixElement(`${id}-${diffOldClsName}`, contentSuffix)
      );
    }
  } else if (newData !== null && newData !== undefined) {
    components.push(<span className={diffOldClsName}>Not Entered</span>);
    components.push(renderArrow());
    components.push(
      <StringFormatWrapper
        value={isDate ? getLocaleFormattedDate(newData) : newData}
        className={diffNewClsName}
        id={`${id}-${diffNewClsName}`}
      />
    );
    if (contentSuffix) {
      components.push(
        contentSuffixElement(`${id}-${diffNewClsName}`, contentSuffix)
      );
    }
  }

  return <>{components}</>;
};
const CUSTOM_DIFF_FIELDS = {
  StringField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const latestCommittedData = formContext?.latestCommittedData?.[props.name];
    const isDate = uiSchema["ui:widget"] === "DateWidget";
    const contentSuffix = uiSchema?.["ui:options"]?.contentSuffix;
    return renderDiffString({
      newData: formData,
      latestCommittedData,
      id,
      isDate,
      contentSuffix,
      diffOldClsName: "diffOld",
      diffNewClsName: "diffNew",
    });
  },
  NumberField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const latestCommittedData = formContext?.latestCommittedData?.[props.name];
    const isMoney = uiSchema?.isMoney;
    const isPercentage = uiSchema?.isPercentage;
    const numberOfDecimalPlaces = uiSchema?.numberOfDecimalPlaces;
    const decimalScale = isMoney ? 2 : numberOfDecimalPlaces ?? 0;

    // Handle text data mapping for certain number values
    let textData = uiSchema?.["ui:options"]?.text as string;
    let latestCommittedTextData =
      formContext?.latestCommittedUiSchema?.[props.name]?.["ui:options"]?.text;

    if (formContext?.operation === "ARCHIVE") {
      // Switch to string rendering for archive
      textData = undefined;
      return renderDiffString({
        newData: textData,
        latestCommittedData: latestCommittedTextData,
        id,
        isDate: false,
        contentSuffix: uiSchema?.["ui:options"]?.contentSuffix,
        diffOldClsName: "diffOld",
        diffNewClsName: "diffNew",
      });
    }

    if (textData || latestCommittedTextData) {
      return renderDiffString({
        newData: textData,
        latestCommittedData: latestCommittedTextData,
        id,
        isDate: false,
        contentSuffix: uiSchema?.["ui:options"]?.contentSuffix,
        diffOldClsName: "diffOld",
        diffNewClsName: "diffNew",
      });
    } else {
      return renderDiffData({
        newData: formData,
        latestCommittedData,
        id,
        isMoney,
        isPercentage,
        decimalScale,
        diffOldClsName: "diffOld",
        diffNewClsName: "diffNew",
        contentSuffix: uiSchema?.["ui:options"]?.contentSuffix,
      });
    }
  },
};

export default CUSTOM_DIFF_FIELDS;
