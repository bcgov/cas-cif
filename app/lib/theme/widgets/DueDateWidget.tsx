import { WidgetProps } from "@rjsf/core";
import React, { forwardRef, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import getDateEndOfDay from "lib/helpers/getDateEndOfDay";

const DueDateInput = forwardRef<HTMLInputElement, WidgetProps>(
  ({ onClick, value }, ref) => {
    const dateSelected = moment(value).tz("America/Vancouver");
    const formattedValue = dateSelected.format("MMM. DD, yyyy");
    const currentDate = moment().tz("America/Vancouver").startOf("day");
    const daysFromToday = dateSelected.startOf("day").diff(currentDate, "days");

    const displayString =
      daysFromToday < 0
        ? `${formattedValue}`
        : daysFromToday > 60
        ? `Due in ${moment(value).diff(
            currentDate,
            "weeks"
          )} weeks (${formattedValue})`
        : `Due in ${daysFromToday} ${
            daysFromToday === 1 ? "day" : "days"
          } (${formattedValue})`;

    return (
      <div onClick={onClick} ref={ref}>
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
    <DatePicker
      id={id}
      dateFormat="tz"
      onChange={(e) => onChange(getDateEndOfDay(e).toString())}
      value={value}
      selected={
        value ? moment(value).tz("America/Vancouver").toDate() : undefined
      }
      required={required}
      aria-label={label}
      customInput={<DueDateInput ref={useRef()} />}
    />
  );
};

export default DueDateWidget;
