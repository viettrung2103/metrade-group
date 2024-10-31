export const convertTimeToMilliseconds = (timeString) => {
  const timeValue = parseInt(timeString.slice(0, -1)); 
  const timeUnit = timeString.slice(-1);

  switch (timeUnit) {
    case "d": // Days to milliseconds
      return timeValue * 24 * 60 * 60 * 1000;
    case "h": // Hours to milliseconds
      return timeValue * 60 * 60 * 1000;
    case "m": // Minutes to milliseconds
      return timeValue * 60 * 1000;
    case "s": // Seconds to milliseconds
      return timeValue * 1000;
    default:
      throw new Error("Invalid time unit");
  }
};
