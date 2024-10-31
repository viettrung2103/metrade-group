import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import VerifySuccess from "./VerifySuccess";
import VerifyFail from "./VerifyFail";
import Logo from "./../assets/logo.png";

const BEURL = `${process.env.REACT_APP_API_URL}/auth/register/verify`;

const Verify = () => {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const token = queryParams.get("token");
  const email = queryParams.get("email");
  const tokenObj = {
    token,
    email,
  };
  
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let ignore = false;
    setLoading((l) => true);
    const fetchVerify = async () => {
      try {
        const response = await fetch(BEURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tokenObj),
        });
        const data = await response.json();
        if (!ignore) {
          setResult(data);
        }
      } catch (err) {
        console.log("Error when verify token", err.message);
      } finally {
        setLoading((l) => false);
      }
    };
    fetchVerify();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      {loading ? (
        <div className="verify-fail-container">
          <div className="verify-fail-icon">
            <img src={Logo} alt="metrade-icon" />
          </div>
          <div className="verify-fail-content" style={{ textAlign: "center" }}>
            <div className="fail-icon">
              <div className="spinner-border" role="status"></div>
              <p style={{ textAlign: "center" }}>Verifying...</p>
            </div>
          </div>
        </div>
      ) : result.status === "success" ? (
        <VerifySuccess />
      ) : (
        <VerifyFail emailProp={email} message={result.message} />
      )}
    </div>
  );
};

export default Verify;
