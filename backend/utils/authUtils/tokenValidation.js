import { hashInput } from "./inputHashing.js";
import dotenv from "dotenv";

dotenv.config();

const MILISECOND = 1;
const SECOND = 1000 * MILISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const getTimeUnit = (str) => {
  switch (str.toLowerCase()) {
    case "s":
      return SECOND;
    case "m":
      return MINUTE;
    case "h":
      return HOUR;
    case "d":
      return DAY;
  }
};

const getExpectDuration = () => {
  const value = Number(process.env.VERIFICATION_EXPIRES_IN.slice(0, -1));
  const unit = getTimeUnit(process.env.VERIFICATION_EXPIRES_IN.slice(-1));
  return value * unit;
};

export const createToken = async (email) => {
  const token = await hashInput(email);
  const currentTime = Date.now();
  const expired_at = currentTime + getExpectDuration();
  const tokenObject = {
    value: token,
    expired_at: expired_at,
  };
  return tokenObject;
};

const isSameHash = (token, user) => {
  const stored_token = user.validation_token.value;
  return token === stored_token;
};

const convertToUNIXTimeStamp = (timeStr) => {
  const time = new Date(timeStr);
  return Math.floor(time.getTime() / 1000);
};

const isValidTime = (user) => {
  const tokenExpireTime = user.validation_token.expired_at;
  const convertedExpireTime = convertToUNIXTimeStamp(tokenExpireTime);
  const currentTime = Math.floor(Date.now() / 1000);

  return currentTime < convertedExpireTime;
};

export const isValidVerifyToken = async (token, user) => {
  try {
    const validTime = isValidTime(user);
    const sameToken = isSameHash(token, user);

    if (sameToken && validTime) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw new Error("Cannot verify token");
  }
};
