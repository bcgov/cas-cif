import React from "react";
import { FieldProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";
import { getLocaleFormattedDate } from "./getLocaleFormattedDate";
import Tooltip from "@mui/material/Tooltip";
import InfoRounded from "@mui/icons-material/InfoRounded";
import IconButton from "@mui/material/IconButton";

const renderData = (
  isDate: boolean | undefined,
  isNumber: boolean | undefined,
  data: string | undefined
) => {
  if (isDate) {
    return getLocaleFormattedDate(data);
  }
  if (isNumber) {
    return (
      <NumberFormat
        value={data}
        displayType="text"
        thousandSeparator
        fixedDecimalScale={false}
        decimalScale={0}
        className="decimal"
      />
    );
  }
  return data;
};

const showStringDiff = (
  id: string,
  oldData: string | undefined,
  newData: string | undefined,
  latestCommittedData: string | undefined,
  isDate: boolean,
  contentSuffix?: string,
  isAmendmentsAndOtherRevisionsSpecific?: boolean
): JSX.Element => {
  const [diffOldClsName, diffNewClsName] = ["diffOld", "diffNew"];
  const todo = contentSuffix;
  console.log("todo", todo);

  // Case 7 -> binary 111
  if (oldData && newData && latestCommittedData) {
    return (
      <>
        <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
          {renderData(isDate, false, latestCommittedData)}
        </span>
        <FontAwesomeIcon
          className={"diff-arrow"}
          size="lg"
          color="black"
          icon={faLongArrowAltRight}
        />
        <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
          {renderData(isDate, false, oldData)}
        </span>
        <FontAwesomeIcon
          className={"diff-arrow"}
          size="lg"
          color="black"
          icon={faLongArrowAltRight}
        />
        <span id={id && `${id}-${diffNewClsName}`} className={diffNewClsName}>
          {renderData(isDate, false, newData)}
        </span>
        <Tooltip title="">
          <IconButton>
            <InfoRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </>
    );
  }
  // case 6 -> binary 110
  if (oldData && newData && !latestCommittedData) {
    return <>ERROR SD: 6</>;
  }

  // Case 5 -> binary 101
  if (oldData && !newData && latestCommittedData) {
    return (
      <>
        <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
          {isDate ? getLocaleFormattedDate(oldData) : oldData}
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
  }
  // Case 4 -> binary 100
  if (oldData && !newData && !latestCommittedData) {
    const diffClsName = isAmendmentsAndOtherRevisionsSpecific
      ? "diffAmendmentsAndOtherRevisionsOld"
      : "diffReviewAndSubmitInformationOld";
    return (
      <>
        <span id={id && `${id}-${diffClsName}`} className={diffClsName}>
          {isDate ? getLocaleFormattedDate(oldData) : oldData}
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
  }
  // Case 3 -> binary 011
  if (!oldData && newData && latestCommittedData) {
    return (
      <>
        <span id={id && `${id}-${diffOldClsName}`} className={diffOldClsName}>
          {renderData(isDate, false, latestCommittedData)}
        </span>
        <FontAwesomeIcon
          className={"diff-arrow"}
          size="lg"
          color="black"
          icon={faLongArrowAltRight}
        />
        <span id={id && `${id}-${diffNewClsName}`} className={diffNewClsName}>
          {renderData(isDate, false, newData)}
        </span>
        <Tooltip title="">
          <IconButton>
            <InfoRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </>
    );
  }

  // Case 2 -> binary 010
  if (!oldData && newData && !latestCommittedData) {
    return (
      <>
        <span id={id && `${id}-${diffNewClsName}`} className={diffNewClsName}>
          {renderData(isDate, false, newData)}
        </span>
      </>
    );
  }

  // Case 1 -> binary 001
  if (!oldData && !newData && latestCommittedData) {
    return <>ERROR SD: 1</>;
  }

  // Case 0 -> binary 000
  if (!oldData && !newData && !latestCommittedData) {
    return <>ERROR SD: 0</>;
  }
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
  const [diffOldClsName, diffNewClsName] = ["diffOld", "diffNew"];

  // case 7 -> binary 111
  if (oldData && newData && latestCommittedData) {
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
            value={latestCommittedData}
          />
        </span>
        <FontAwesomeIcon
          className={"diff-arrow"}
          size="lg"
          color="black"
          icon={faLongArrowAltRight}
        />
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
        <FontAwesomeIcon
          className={"diff-arrow"}
          size="lg"
          color="black"
          icon={faLongArrowAltRight}
        />
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
        <Tooltip title="">
          <IconButton>
            <InfoRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </>
    );
  }
  // case 6 -> binary 110
  else if (oldData && newData && !latestCommittedData) {
    return <>ERROR ND: 6</>;
  }
  // case 5 -> binary 101
  else if (oldData && !newData && latestCommittedData) {
    return <>ERROR ND: 5</>;
  }
  // case 4 -> binary 100
  else if (oldData && !newData && !latestCommittedData) {
    return <>ERROR ND: 4</>;
  }
  // Case 3 -> binary 011
  else if (!oldData && newData && latestCommittedData) {
    return <>ERROR ND: 3</>;
  }

  // Case 2 -> binary 010
  else if (!oldData && newData && !latestCommittedData) {
    return <>ERROR ND: 2</>;
  }

  // Case 1 -> binary 001
  else if (!oldData && !newData && latestCommittedData) {
    return <>ERROR ND: 1</>;
  }

  // Case 0 -> binary 000
  else if (!oldData && !newData && !latestCommittedData) {
    return <>ERROR: 0</>;
  }
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
      </span>
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
    const latestCommittedValue = formContext?.latestCommittedData?.[props.name];
    const isDate = uiSchema["ui:widget"] === "DateWidget";
    const contentSuffix = uiSchema?.["ui:options"]?.contentSuffix;
    const isAmendmentsAndOtherRevisionsSpecific =
      formContext?.isAmendmentsAndOtherRevisionsSpecific;

    return showStringDiff(
      id,
      previousValue,
      formData,
      latestCommittedValue,
      isDate,
      contentSuffix as string,
      isAmendmentsAndOtherRevisionsSpecific
    );
  },
  NumberField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const previousValue = formContext?.oldData?.[props.name];
    const latestCommittedValue = formContext?.latestCommittedData?.[props.name];
    const contentSuffix = uiSchema?.["ui:options"]?.contentSuffix;
    console.log("TODO", contentSuffix);
    return showNumberDiff(
      id,
      previousValue,
      formData,
      latestCommittedValue,
      uiSchema?.isMoney,
      uiSchema?.isPercentage,
      uiSchema?.numberOfDecimalPlaces
    );
  },
};

export default CUSTOM_DIFF_FIELDS;
