import { useNavigate } from "react-router-dom";
import Logo from "./../../src/assets/logo.png";
import Check from "./../../src/assets/check-circle.png";

const VerifySuccess = () => {
  const navigator = useNavigate();
  const handleClick = () => {
    navigator("/");
  };
  return (
    <div className="verify-fail-container">
      <div className="verify-fail-icon">
        <img src={Logo} alt="metrade-icon" />
      </div>
      <div className="verify-fail-content">
        <div className="fail-icon">
          <img src={Check} alt="check-icon" />
        </div>
        <h2>Verification Success!</h2>
        <p>Thank you for your support!</p>

        <div className="confirm-send">
          <button onClick={handleClick}>TO METRADE</button>
        </div>
      </div>
    </div>
  );
};
export default VerifySuccess;
