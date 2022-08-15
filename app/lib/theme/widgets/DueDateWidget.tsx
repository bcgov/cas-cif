import { WidgetProps } from "@rjsf/core";
import React, { forwardRef, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";
import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import {
  getDaysUntilDue,
  getDisplayDueDateString,
  getWeeksUntilDue,
  parseStringDate,
} from "lib/helpers/reportStatusHelpers";

const DueDateInput = forwardRef<HTMLDivElement, WidgetProps>(
  ({ onClick, value, label }, ref) => {
    const selectedDate = parseStringDate(value);
    const daysUntilDue = getDaysUntilDue(selectedDate);
    const weeksUntilDue = getWeeksUntilDue(selectedDate);
    const displayDueDateString = getDisplayDueDateString(
      daysUntilDue,
      weeksUntilDue,
      selectedDate
    );

    return (
      <div onClick={onClick} ref={ref} aria-label={label}>
        {value ? (
          displayDueDateString
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
            background-color: white;
            font-size: 14.4px;
          }
          div:hover {
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }
);
DueDateInput.displayName = "DueDateInput";

const DueDateWidget: React.FC<WidgetProps> = ({
  id,
  onChange,
  label,
  value,
  required,
}) => {
  return (
    <div>
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
        customInput={<DueDateInput label={label} ref={useRef()} />}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        isClearable
      />
      <style jsx>{`
        :global(.react-datepicker__day.react-datepicker__day--keyboard-selected) {
          background: none;
          color: black;
        }
        div {
          width: 300px;
        }
      `}</style>
    </div>
  );
};

export default DueDateWidget;
