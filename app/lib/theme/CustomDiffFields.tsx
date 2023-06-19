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
      id={id && `${id}-contentSuffix`}
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
  oldData,
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
  if (oldData !== null && oldData !== undefined) {
    components.push(
      <NumberFormatWrapper
        value={oldData}
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
    if (newData !== null && newData !== undefined) {
      components.push(renderArrow());
    }
  }

  if (
    latestCommittedData !== null &&
    latestCommittedData !== undefined &&
    latestCommittedData !== oldData &&
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
    oldData !== null &&
    oldData !== undefined
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
  oldData,
  newData,
  latestCommittedData,
  id,
  isDate,
  contentSuffix,
  diffOldClsName,
  diffNewClsName,
}) => {
  let components = [];
  if (oldData !== null && oldData !== undefined) {
    components.push(
      <StringFormatWrapper
        value={isDate ? getLocaleFormattedDate(oldData) : oldData}
        className={diffOldClsName}
        id={`${id}-${diffOldClsName}`}
      />
    );
    if (contentSuffix) {
      components.push(
        contentSuffixElement(`${id}-${diffOldClsName}`, contentSuffix)
      );
    }
    if (
      (newData !== null && newData !== undefined) ||
      (latestCommittedData !== null && latestCommittedData !== undefined)
    ) {
      components.push(renderArrow());
    }
  }

  if (
    latestCommittedData !== null &&
    latestCommittedData !== undefined &&
    latestCommittedData !== oldData &&
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
    oldData !== null &&
    oldData !== undefined
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
    const oldData = formContext?.oldData?.[props.name];
    const latestCommittedData = formContext?.latestCommittedData?.[props.name];
    const isDate = uiSchema["ui:widget"] === "DateWidget";
    const contentSuffix = uiSchema?.["ui:options"]?.contentSuffix;

    return renderDiffString({
      oldData,
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
    const oldData = formContext?.oldData?.[props.name];
    const latestCommittedData = formContext?.latestCommittedData?.[props.name];
    const isMoney = uiSchema?.isMoney;
    const isPercentage = uiSchema?.isPercentage;
    const numberOfDecimalPlaces = uiSchema?.numberOfDecimalPlaces;
    const decimalScale = isMoney ? 2 : numberOfDecimalPlaces ?? 0;

    // Handle text data mapping for certain number values
    let textData = uiSchema?.["ui:options"]?.text as string;
    let oldTextData =
      formContext?.oldUiSchema?.[props.name]?.["ui:options"]?.text;
    let latestCommittedTextData =
      formContext?.latestCommittedUiSchema?.[props.name]?.["ui:options"]?.text;

    if (formContext?.operation === "ARCHIVE") {
      // Switch to string rendering for archive
      textData = undefined;
      return renderDiffString({
        oldData: oldTextData,
        newData: textData,
        latestCommittedData: latestCommittedTextData,
        id,
        isDate: false,
        contentSuffix: uiSchema?.["ui:options"]?.contentSuffix,
        diffOldClsName: "diffOld",
        diffNewClsName: "diffNew",
      });
    }

    if (oldTextData || textData || latestCommittedTextData) {
      return renderDiffString({
        oldData: oldTextData,
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
        oldData,
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
