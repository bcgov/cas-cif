import { WidgetProps } from "@rjsf/core";
import React, { forwardRef, useMemo, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";
import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const DateInput = forwardRef<HTMLDivElement, WidgetProps>(
  ({ onClick, value, label, uiSchema }, ref) => {
    const displayString = useMemo(() => {
      const formattedDate = DateTime.fromISO(value, {
        setZone: true,
        locale: "en-CA",
      }).toFormat("MMM dd, yyyy");

      return (
        <>
          {uiSchema?.contentPrefix}({formattedDate})
        </>
      );
    }, [uiSchema, value]);

    return (
      <div>
        <div onClick={onClick} ref={ref} aria-label={label}>
          {value ? (
            displayString
          ) : (
            <span style={{ color: "#666666" }}>Select a date</span> //This color is somehow grey-ish to bypass accessibility issues
          )}
          <FontAwesomeIcon icon={faCalendarAlt} size="lg" />
          <style jsx>{`
            div {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border: 2px solid #606060;
              border-radius: 0.25em;
              padding: 9px 35px 9px 9px;
              font-size: 14.4px;
            }
            div:hover {
              cursor: pointer;
            }
          `}</style>
        </div>
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

const DateWidget: React.FC<WidgetProps> = ({
  id,
  onChange,
  label,
  value,
  required,
  formContext,
  uiSchema,
}) => {
  return (
    <div className="dateWidgetWrapper">
      <div className="dateWidget">
        <DatePicker
          id={id}
          dateFormat="tz"
          onChange={(e) => {
            onChange(getTimestamptzFromDate(e, true));
          }}
          value={value}
          selected={value ? DateTime.fromISO(value).toJSDate() : undefined}
          required={required}
          aria-label={label}
          customInput={
            <DateInput
              formContext={formContext}
              uiSchema={uiSchema}
              label={label}
              ref={useRef()}
            />
          }
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          isClearable
        />
      </div>
      {uiSchema?.["ui:options"]?.contentSuffix}
      <style jsx>{`
        :global(.react-datepicker__day.react-datepicker__day--keyboard-selected) {
          background: none;
          color: black;
        }
        .dateWidgetWrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .dateWidget {
          width: 300px;
        }
      `}</style>
    </div>
  );
};

export default DateWidget;
