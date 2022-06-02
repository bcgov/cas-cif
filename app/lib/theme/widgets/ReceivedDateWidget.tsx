import { WidgetProps } from "@rjsf/core";
import React, { forwardRef, useMemo, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";
import { DateTime, Interval } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faExclamationCircle,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

const ReceivedDateInput = forwardRef<HTMLDivElement, WidgetProps>(
  ({ onClick, value, label, formContext }, ref) => {
    let overdue;
    const displayString = useMemo(() => {
      const dueDate = DateTime.fromISO(formContext?.dueDate, {
        setZone: true,
        locale: "en-CA",
      });
      const formattedDueDate = dueDate.toFormat("MMM dd, yyyy");

      const receivedDate = DateTime.fromISO(value, {
        setZone: true,
        locale: "en-CA",
      });
      const formattedReceivedDate = receivedDate.toFormat("MMM dd, yyyy");

      if (!dueDate.day && !receivedDate.day) {
        return "Select a date";
      }

      const currentDate = DateTime.now()
        .setZone("America/Vancouver")
        .endOf("day");

      const dueDiff = Interval.fromDateTimes(currentDate, dueDate);
      const daysFromToday = Math.floor(dueDiff.length("days"));

      const lateDiff = Interval.fromDateTimes(dueDate, currentDate);
      const lateDays = Math.floor(lateDiff.length("days"));

      if (receivedDate.day) {
        return (
          <>
            <div className="receivedStringWrapper">
              <span style={{ marginRight: "1em" }}>Received</span>
              <FontAwesomeIcon icon={faCheck} color={"green"} />
            </div>
            ({formattedReceivedDate})
          </>
        );
      }
      if (!receivedDate.day && currentDate > dueDate) {
        overdue = true;
        return <span className="overdue">Overdue by {lateDays} days</span>;
      }

      return daysFromToday > 60
        ? `Due in ${Math.floor(
            dueDiff.length("weeks")
          )} weeks (${formattedDueDate})`
        : `Due in ${daysFromToday} ${
            daysFromToday === 1 ? "day" : "days"
          } (${formattedDueDate})`;
    }, [formContext?.dueDate, value]);

    return (
      <div className="receivedDateWrapper">
        <div onClick={onClick} ref={ref} aria-label={label}>
          {displayString}
          <FontAwesomeIcon icon={faCalendarAlt} size="lg" />

          <style jsx>{`
            div {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border: 2px solid #606060;
              border-radius: 0.25em;
              padding: 9px 9px 9px 9px;
              font-size: 14.4px;
              width: 300px;
            }
            :global(.receivedDateWrapper) {
              display: flex;
              align-items: center;
              justify-content: flex-start;
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
        {overdue && (
          <div>
            <FontAwesomeIcon
              icon={faExclamationCircle}
              color={"#cd2026"}
              className={"overdueIcon"}
            />
          </div>
        )}
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
      />
      <style jsx>{`
        :global(.react-datepicker__day.react-datepicker__day--keyboard-selected) {
          background: none;
          color: black;
        }
      `}</style>
    </div>
  );
};

export default ReceivedDateWidget;
