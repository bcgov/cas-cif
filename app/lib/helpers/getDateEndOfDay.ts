import moment from "moment-timezone";

const getDateEndOfDay = (date) => {
  const dateEndOfDay = moment(date).tz("America/Vancouver").set({
    hour: 23,
    minute: 59,
    second: 59
  }).toDate();
  return dateEndOfDay;
};

export default getDateEndOfDay;