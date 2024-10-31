import "../Styles/Loading.css";
import { Spinner } from "react-bootstrap";

const Loading = ({ size = "md", variant = "primary", message }) => {
  return (
    <div className="loading-container">
      <Spinner
        animation="border"
        variant={variant}
        size={size === "sm" ? "sm" : ""}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default Loading;
