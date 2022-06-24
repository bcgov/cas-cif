import { WidgetProps } from "@rjsf/core";
import React, { forwardRef, useMemo, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";
import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const ReceivedDateInput = forwardRef<HTMLDivElement, WidgetProps>(
  ({ onClick, value, label }, ref) => {
    const displayString = useMemo(() => {
      const receivedDate = DateTime.fromISO(value, {
        setZone: true,
        locale: "en-CA",
      });
      const formattedReceivedDate = receivedDate.toFormat("MMM dd, yyyy");
      return (
        <>
          <div className="receivedStringWrapper">
            <span style={{ marginRight: "1em" }}>Received</span>
            <FontAwesomeIcon icon={faCheck} color={"green"} />
          </div>
          ({formattedReceivedDate})
        </>
      );
    }, [value]);

    return (
      <div className="receivedDateWrapper">
        <div onClick={onClick} ref={ref} aria-label={label}>
          {value ? displayString : "Select a date"}
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
            :global(.receivedDateWrapper) {
              align-items: center;
            }
            :global(.receivedStringWrapper) {
              display: flex;
              align-items: center;
            }

            :global(.overdueIcon) {
              margin-left: 1em;
            }
            div:hover {
              cursor: pointer;
            }
            :global(.overdue) {
              color: #cd2026;
            }
          `}</style>
        </div>
      </div>
    );
  }
);
ReceivedDateInput.displayName = "ReceivedDateInput";

const ReceivedDateWidget: React.FC<WidgetProps> = ({
  id,
  onChange,
  label,
  value,
  required,
  formContext,
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
        customInput={
          <ReceivedDateInput
            formContext={formContext}
            label={label}
            ref={useRef()}
          />
        }
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

export default ReceivedDateWidget;
