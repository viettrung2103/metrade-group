import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import Logo from "./../../src/assets/logo.png";
import Frown from "./../../src/assets/frown.png";
import "../Styles/VerifyFail.css";

const checkValidEmail = (string) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@metropolia.fi$/;
  return emailRegex.test(string);
};

const containString = (string, checkString) => {
  return string.toLowerCase().trim().includes(checkString);
};

const containNotExist = (string) => {
  return containString(string, "does not exist");
};

const containVerified = (string) => {
  return containString(string, "already verified");
};

const containToken = (string) => {
  return containString(string, "token");
};

const getMessageQr = (queryParams) => {
  let messageQr = queryParams.get("message");
  if (messageQr === null || containToken(messageQr)) {
    messageQr = "";
  }
  return messageQr;
};

const EMAIL_ERROR = "not valid email";
const NO_EMAIL_ERROR = "missing email";

const VerifyFail = ({ emailProp, message }) => {
  const location = useLocation(); // to get path info
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const emailQr = emailProp || "";
  const messageQr = getMessageQr(queryParams);

  const [email, setEmail] = useState(emailQr);
  const [validEmail, setValidEmail] = useState(emailQr !== null);
  const [error, setError] = useState(messageQr);
  const [needRegister, setNeedRegister] = useState(
    containNotExist(messageQr) || false
  );
  const [needLogin, setNeedLogin] = useState(false);

  const emailObj = { email };

  const handleEmailChange = (event) => {
    setEmail((e) => event.target.value);
    if (checkValidEmail(event.target.value)) {
      setValidEmail((ve) => true);
    } else {
      setValidEmail((ve) => false);
    }
  };

  const handleClick = async () => {
    try {
      setError("");
      setNeedRegister(false);
      if (validEmail === false) {
        if (!email) {
          setError(NO_EMAIL_ERROR);
        }
        setError(EMAIL_ERROR);
      } else {
        console.log("sending link");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/auth/resend-verification-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailObj),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Something went wrong");
        } else {
          navigate("/confirm-sent");
        }
      }
    } catch (err) {
      console.error("Error during registration", err);
      setError((e) => err.message);
      if (containNotExist(err.message)) {
        setNeedRegister((ne) => true);
      }
      if (containVerified(err.message)) {
        setNeedLogin((cv) => true);
      }
    }
  };
  return (
    <div className="verify-fail-container">
      <div className="verify-fail-icon">
        <img src={Logo} alt="metrade-icon" />
      </div>
      <div className="verify-fail-content">
        <div className="fail-icon">
          <img src={Frown} alt="frown-icon" />
        </div>
        <h2>Verification Failed!</h2>
        {error != "" && (
          <>
            <Alert
              variant="danger"
              onClose={() => setError("")}
              dismissible
              className="sign-up-alert"
            >
              <p className="signup-error-item">
                {error}{" "}
                {needRegister && (
                  <span>
                    <Link to="/signup">Register</Link>
                  </span>
                )}
                {needLogin && (
                  <span>
                    <Link to="/login">Login</Link>
                  </span>
                )}
              </p>
            </Alert>
          </>
        )}
        <p>Please type in your email and click Resend button to try again</p>
        <input
          value={email}
          type="email"
          name="email"
          id="resend-email"
          onChange={handleEmailChange}
        />
        <div className="verify-button">
          <button onClick={handleClick}>RESEND</button>
        </div>
      </div>
    </div>
  );
};
export default VerifyFail;
