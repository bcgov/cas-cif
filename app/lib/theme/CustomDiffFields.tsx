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

const formatData = (isDate: boolean | undefined, data: string | undefined) => {
  if (isDate) {
    return getLocaleFormattedDate(data);
  }
  return data;
};

const renderTooltip = () => {
  return <></>;
};

const renderArrow = () => {
  return (
    <FontAwesomeIcon
      className={"diff-arrow"}
      size="lg"
      color="black"
      icon={faLongArrowAltRight}
    />
  );
};

const showStringDiff = (
  id: string,
  oldData: string | undefined,
  newData: string | undefined,
  latestCommittedData: string | undefined,
  isDate: boolean,
  contentSuffix?: string
): JSX.Element => {
  const [diffOldClsName, diffNewClsName, diffTextClsName] = [
    "diffOld",
    "diffNew",
    "diffText",
  ];

  // The numbers show the truth values of oldData, newData, latestCommittedData
  // Case 7 ->  111
  if (oldData && newData && latestCommittedData) {
    return (
      <>
        {latestCommittedData !== oldData && (
          <>
            <span
              id={id && `${id}-${diffOldClsName}`}
              className={diffOldClsName}
            >
              {formatData(isDate, latestCommittedData)}
            </span>
            {contentSuffix && contentSuffixElement(id, contentSuffix)}
            {renderArrow()}
          </>
        )}
        <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
          {formatData(isDate, oldData)}
        </span>
        {contentSuffix && contentSuffixElement(id, contentSuffix)}
        {renderArrow()}
        <span id={id && `${id}-${diffNewClsName}`} className={diffNewClsName}>
          {formatData(isDate, newData)}
        </span>
        {contentSuffix && contentSuffixElement(id, contentSuffix)}
        {renderTooltip()}
      </>
    );
  }
  // case 6 ->  110
  if (oldData && newData && !latestCommittedData) {
    return (
      <>
        <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
          {formatData(isDate, oldData)}
        </span>
        {contentSuffix && contentSuffixElement(id, contentSuffix)}
        {renderArrow()}
        <span id={id && `${id}-${diffNewClsName}`} className={diffNewClsName}>
          {formatData(isDate, newData)}
        </span>
        {contentSuffix && contentSuffixElement(id, contentSuffix)}
        {renderTooltip()}
      </>
    );
  }

  // Case 5 ->  101
  if (oldData && !newData && latestCommittedData) {
    return (
      <>
        <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
          {formatData(isDate, oldData)}
        </span>
        {contentSuffix && contentSuffixElement(id, contentSuffix)}
      </>
    );
  }
  // Case 4 ->  100
  if (oldData && !newData && !latestCommittedData) {
    return (
      <>
        <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
          {isDate ? getLocaleFormattedDate(oldData) : oldData}
        </span>
        {contentSuffix && contentSuffixElement(id, contentSuffix)}
      </>
    );
  }
  // Case 3 ->  011
  if (!oldData && newData && latestCommittedData) {
    return (
      <>
        <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
          {formatData(isDate, latestCommittedData)}
        </span>
        {contentSuffix && contentSuffixElement(id, contentSuffix)}
        {renderArrow()}
        <span id={id && `${id}-${diffNewClsName}`} className={diffNewClsName}>
          {formatData(isDate, newData)}
        </span>
        {contentSuffix && contentSuffixElement(id, contentSuffix)}
        {renderTooltip()}
      </>
    );
  }

  // Case 2 ->  010
  if (!oldData && newData && !latestCommittedData) {
    return (
      <>
        <span id={id && `${id}-${diffTextClsName}`} className={diffTextClsName}>
          {"Not Entered"}
        </span>
        {renderArrow()}
        <span id={id && `${id}-${diffNewClsName}`} className={diffNewClsName}>
          {formatData(isDate, newData)}
        </span>
        {contentSuffix && contentSuffixElement(id, contentSuffix)}
      </>
    );
  }

  return <>Error</>;
};

const showNumberDiff = (
  id: string,
  oldData: number,
  newData: number,
  latestCommittedData: number,
  isMoney: boolean,
  isPercentage: boolean,
  numberOfDecimalPlaces: number = 0
): JSX.Element => {
  const decimalScale = isMoney ? 2 : numberOfDecimalPlaces ?? 0;
  const [diffOldClsName, diffNewClsName, diffTextClsName] = [
    "diffOld",
    "diffNew",
    "diffText",
  ];

  // case 7 ->  111
  if (oldData && newData && latestCommittedData) {
    return (
      <>
        {latestCommittedData !== oldData && (
          <>
            <NumberFormat
              thousandSeparator
              fixedDecimalScale={true}
              decimalScale={decimalScale}
              prefix={isMoney ? "$" : ""}
              suffix={isPercentage ? " %" : ""}
              displayType="text"
              value={latestCommittedData}
              className={diffOldClsName}
              id={id && `${id}-${diffOldClsName}`}
            />

            {renderArrow()}
          </>
        )}
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={decimalScale}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={oldData}
          className={diffOldClsName}
          id={id && `${id}-${diffOldClsName}`}
        />
        {renderArrow()}
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={decimalScale}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={newData}
          className={diffNewClsName}
          id={id && `${id}-${diffNewClsName}`}
        />
        {renderTooltip()}
      </>
    );
  }
  // case 6 ->  110
  if (oldData && newData && !latestCommittedData) {
    return (
      <>
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={decimalScale}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={oldData}
          className={diffOldClsName}
          id={id && `${id}-${diffOldClsName}`}
        />
        {renderArrow()}
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={decimalScale}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={newData}
          className={diffNewClsName}
          id={id && `${id}-${diffNewClsName}`}
        />
        {renderTooltip()}
      </>
    );
  }
  // case 5 ->  101
  if (oldData && !newData && latestCommittedData) {
    // this happens when you remove a contact
    return (
      <NumberFormat
        thousandSeparator
        fixedDecimalScale={true}
        decimalScale={decimalScale}
        prefix={isMoney ? "$" : ""}
        suffix={isPercentage ? " %" : ""}
        displayType="text"
        value={oldData}
        id={id && `${id}-${diffOldClsName}`}
        className={diffOldClsName}
      />
    );
  }
  // case 4 ->  100
  if (oldData && !newData && !latestCommittedData) {
    return (
      <>
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={decimalScale}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={oldData}
          id={id && `${id}-${diffOldClsName}`}
          className={diffOldClsName}
        />
      </>
    );
  }

  // Case 2 ->  010
  if (!oldData && newData && !latestCommittedData) {
    return (
      <>
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={1}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={0}
          id={id && `${id}-${diffOldClsName}`}
          className={diffOldClsName}
        />
        {renderArrow()}
        <NumberFormat
          thousandSeparator
          fixedDecimalScale={true}
          decimalScale={decimalScale}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          displayType="text"
          value={newData}
          id={id && `${id}-${diffNewClsName}`}
          className={diffNewClsName}
        />
        {renderTooltip()}
      </>
    );
  }

  // Case 0 ->  000
  if (!oldData && !newData && !latestCommittedData) {
    // This is a special case for when the value is 0. We want to show 0, not "Not Entered"
    if (newData === 0) {
      return (
        <>
          <span
            id={id && `${id}-${diffTextClsName}`}
            className={diffTextClsName}
          >
            {"Not Entered"}
          </span>
          {renderArrow()}
          <NumberFormat
            thousandSeparator
            fixedDecimalScale={true}
            decimalScale={0}
            prefix={isMoney ? "$" : ""}
            suffix={isPercentage ? " %" : ""}
            displayType="text"
            value={0}
            id={id && `${id}-${diffNewClsName}`}
            className={diffNewClsName}
          />
        </>
      );
    }

    return <>Not Entered</>;
  }
  return <>Error</>;
};

const CUSTOM_DIFF_FIELDS: Record<
  string,
  React.FunctionComponent<FieldProps>
> = {
  StringField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const oldData = formContext?.oldData?.[props.name];
    const latestCommittedData = formContext?.latestCommittedData?.[props.name];
    const isDate = uiSchema["ui:widget"] === "DateWidget";
    const contentSuffix = uiSchema?.["ui:options"]?.contentSuffix;
    return showStringDiff(
      id,
      oldData,
      formData,
      latestCommittedData,
      isDate,
      contentSuffix as string
    );
  },
  NumberField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const oldData = formContext?.oldData?.[props.name];
    const latestCommittedData = formContext?.latestCommittedData?.[props.name];

    // Some number values correspond to fk ids and therefore need to be mapped to text. The text value is found in the uiSchema
    const textValue = uiSchema?.["ui:options"]?.text as string;

    const oldTextValue =
      formContext?.oldUiSchema?.[props.name]?.["ui:options"]?.text;

    const latestCommittedTextValue =
      formContext?.latestCommittedUiSchema?.[props.name]?.["ui:options"]?.text;

    if (textValue || oldTextValue || latestCommittedTextValue) {
      return showStringDiff(
        id,
        oldTextValue,
        textValue,
        latestCommittedTextValue,
        false,
        null
      );
    } else {
      return showNumberDiff(
        id,
        oldData,
        formData,
        latestCommittedData,
        uiSchema?.isMoney,
        uiSchema?.isPercentage,
        uiSchema?.numberOfDecimalPlaces
      );
    }
  },
};

export default CUSTOM_DIFF_FIELDS;
