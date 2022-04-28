import React from "react";
import { FieldProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";

const CUSTOM_FIELDS: Record<string, React.FunctionComponent<FieldProps>> = {
  StringField: (props) => {
    const { idSchema, formData, formContext } = props;
    const id = idSchema?.$id;
    const hasPreviousValue = formContext?.oldData?.[props.name];
    if (props.name === "contactId") {
      console.log(formContext);
      console.log(props);
    }
    return (
      <>
        {hasPreviousValue && (
          <>
            <span id={id && `${id}-diffTo`} className="diffTo">
              {formContext?.oldData?.[props.name] ?? <i>[No Data Entered]</i>}
            </span>
            &nbsp;
            <FontAwesomeIcon
              size="lg"
              color="black"
              icon={faLongArrowAltRight}
            />
            &nbsp;
          </>
        )}
        <span id={id && `${id}-diffFrom`} className="diffFrom">
          {formData}
        </span>
      </>
    );
  },
  NumberField: (props) => {
    const { idSchema, formData, formContext, uiSchema } = props;
    const id = idSchema?.$id;
    const hasPreviousValue = formContext?.oldData?.[props.name];
    if (uiSchema["ui:options"]) {
      return (
        <>
          {hasPreviousValue && formData && (
            <>
              <span id={id && `${id}-diffTo`} className="diffTo">
                {formContext?.oldUiSchema?.[props.name]?.["ui:options"]?.text}
              </span>
              &nbsp;
              <FontAwesomeIcon
                size="lg"
                color="black"
                icon={faLongArrowAltRight}
              />
              &nbsp;
              <span id={id && `${id}-diffFrom`} className="diffFrom">
                {uiSchema["ui:options"].text}
              </span>
            </>
          )}
          {hasPreviousValue && !formData && (
            <>
              <span id={id && `${id}-diffTo`} className="diffTo">
                {formContext?.oldUiSchema?.[props.name]?.["ui:options"]?.text}
              </span>
              &nbsp;
              <FontAwesomeIcon
                size="lg"
                color="black"
                icon={faLongArrowAltRight}
              />
              &nbsp;
              <span>
                <strong>REMOVED</strong>
              </span>
            </>
          )}
          {!hasPreviousValue && formData && (
            <>
              <span id={id && `${id}-diffFrom`} className="diffFrom">
                {uiSchema["ui:options"].text}
              </span>
              &nbsp;
              <FontAwesomeIcon
                size="lg"
                color="black"
                icon={faLongArrowAltRight}
              />
              &nbsp;
              <span>
                <strong>ADDED</strong>
              </span>
            </>
          )}
        </>
      );
    }
    return (
      <>
        {hasPreviousValue && (
          <>
            <span id={id && `${id}-diffTo`} className="diffTo">
              <NumberFormat
                thousandSeparator
                id={id}
                displayType="text"
                value={formContext?.oldData?.[props.name]}
              />
            </span>
            &nbsp;
            <FontAwesomeIcon
              size="lg"
              color="black"
              icon={faLongArrowAltRight}
            />
            &nbsp;
          </>
        )}
        <span id={id && `${id}-diffFrom`} className="diffFrom">
          <NumberFormat
            thousandSeparator
            id={id}
            displayType="text"
            value={formData}
          />
        </span>
      </>
    );
  },
};

export default CUSTOM_FIELDS;
