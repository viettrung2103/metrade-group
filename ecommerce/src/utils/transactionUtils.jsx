import moment from "moment";

export const displaySellingStatusColor = (str) => {
  switch (str) {
    case "processing":
      return "#009e54";
    case "await-pickup":
      return "#e67300";
    case "delivered":
      return "rgb(2,50,209)";
    case "cancelled":
      return "#ee0017";
  }
};

export const displayPickupColor = (str) => {
  // console.log(str);
  switch (str) {
    case "Myllypuro":
      return "#ee0017";
    case "Karamalmi":
      return "#e67300";
    case "Myyrmäki":
      return "#009e54";
  }
};

export const diplayDate = (dateStr) => {
  const date = moment(dateStr).format("DD-MM-YYYY");
  return `${date}`;
};

export const convertToQueryString = (qrArr) => {
  let result = "";
  if (qrArr.length > 0) {
    result = "?" + qrArr.join("&");
  }
  return result;
};

export const findTotalPage = (total, limit) => {
  return Math.ceil(total / limit);
};

export const capitalizeStatusStr = (str) => {
  let result = str.trim().split("-");
  result = result.map((e) => e.charAt(0).toUpperCase() + e.slice(1));
  result = result.join(" ");
  return result;
};
