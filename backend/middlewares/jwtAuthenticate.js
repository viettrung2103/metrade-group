import jwt from "jsonwebtoken";
import cookieParser from 'cookie-parser';

const jwtAuthenticate = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res
      .status(401)
      .json({ success: false, message: "No access token provided" });
  }
  //Check if accessToken valid or not
  jwt.verify(accessToken, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired access token" });
    }
    req.user = decoded;
    next();
  });
};

export default jwtAuthenticate;
