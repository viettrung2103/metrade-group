import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const hashInput = async (input) => {
  try {
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
    const hash = await bcrypt.hash(input, salt);
    return hash;
  } catch (err) {
    throw new Error("Cannot create hashed input");
  }
};

export const checkHashedInput = async (input, storedInput) => {
  try {
    const result = await bcrypt.compare(input, storedInput);

    if (result) {
      console.log("Input match! Authenticate succeeded.");
    } else {
      console.log("Input do not match! Authentication failed.");
    }
    return result;
  } catch (err) {
    throw new Error("cannot check hashed");
  }
};
