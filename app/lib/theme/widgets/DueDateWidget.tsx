import { WidgetProps } from "@rjsf/core";
import React, { forwardRef, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";
import { DateTime, Interval } from "luxon";

const DueDateInput = forwardRef<HTMLDivElement, WidgetProps>(
  ({ onClick, value, label }, ref) => {
    const selectedDate = DateTime.fromISO(value, {
      setZone: true,
      locale: "en-CA",
    });

    const formattedValue = selectedDate.toLocaleString(DateTime.DATE_MED);

    const currentDate = DateTime.now()
      .setZone("America/Vancouver")
      .startOf("day");
    const diff = Interval.fromDateTimes(currentDate, selectedDate);
    const daysFromToday = Math.floor(diff.length("days"));
    const displayString =
      selectedDate < currentDate
        ? `${formattedValue}`
        : daysFromToday > 60
        ? `Due in ${Math.floor(diff.length("weeks"))} weeks (${formattedValue})`
        : `Due in ${daysFromToday} ${
            daysFromToday === 1 ? "day" : "days"
          } (${formattedValue})`;

    return (
      <div onClick={onClick} ref={ref} aria-label={label}>
        {value ? displayString : "Select a date"}
        <CalendarTodayIcon style={{ color: "black" }} />
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

export default DueDateWidget;
