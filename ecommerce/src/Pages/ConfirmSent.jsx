import { useNavigate } from "react-router-dom";
import Logo from "./../../src/assets/logo.png";
import Send from "./../../src/assets/send.png";

const ConfirmSent = () => {
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
          <img src={Send} alt="frown-icon" />
        </div>
        <h2>Confirmation sent</h2>
        <p>Thank you for signing up!</p>
        <p>Please confirm your email address!</p>

        <div className="confirm-send">
          <button onClick={handleClick}>OK</button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmSent;
