import { WidgetProps } from "@rjsf/core";
import React, { forwardRef, useMemo, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";
import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCheck } from "@fortawesome/free-solid-svg-icons";
import {
  getDisplayDateString,
  parseStringDate,
  getDaysUntilDue,
  getDisplayDueDateString,
  getWeeksUntilDue,
} from "lib/helpers/reportStatusHelpers";

const DateInput = forwardRef<HTMLDivElement, WidgetProps>(
  ({ onClick, value, label, uiSchema }, ref) => {
    const displayString = useMemo(() => {
      const selectedDate = parseStringDate(value);

      if (uiSchema?.isDueDate) {
        const daysUntilDue = getDaysUntilDue(selectedDate);
        const weeksUntilDue = getWeeksUntilDue(selectedDate);
        const displayDueDateString = getDisplayDueDateString(
          daysUntilDue,
          weeksUntilDue,
          selectedDate
        );
        return displayDueDateString;
      }

      if (uiSchema?.isReceivedDate) {
        const displayReceivedDateString = getDisplayDateString(selectedDate);
        return (
          <>
            <div>
              <span style={{ marginRight: "1em" }}>Received</span>
              <FontAwesomeIcon icon={faCheck} color={"green"} />
            </div>
            ({displayReceivedDateString})
          </>
        );
      }
      return getDisplayDateString(selectedDate);
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
            <DateInput uiSchema={uiSchema} label={label} ref={useRef()} />
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
