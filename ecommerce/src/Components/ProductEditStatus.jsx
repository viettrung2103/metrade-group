import { Modal, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

// Success Modal Component
export const SuccessModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Body className="text-center">
        <div style={{ fontSize: "60px", color: "green" }}>✔️</div>
        <h4>Product updated successfully!</h4>
        <Link to="/selling-history">
          <Button
            variant="warning"
            onClick={handleClose}
            style={{
              backgroundColor: "#FF7F32",
              border: "none",
              marginTop: "20px",
            }}
          >
            INVENTORY
          </Button>
        </Link>
      </Modal.Body>
    </Modal>
  );
};

// Failure Modal Component
export const FailureModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Body className="text-center">
        <div style={{ fontSize: "60px", color: "red" }}>😞</div>
        <h4>Fail to update product!</h4>
        <Link to="/selling-history">
          <Button
            variant="success"
            onClick={handleClose}
            style={{
              backgroundColor: "#28a745",
              border: "none",
              marginTop: "20px",
            }}
          >
            RETRY
          </Button>
        </Link>
      </Modal.Body>
    </Modal>
  );
};

// Loading Modal Component
export const LoadingModal = ({ show }) => {
  return (
    <Modal show={show} centered backdrop="static" keyboard={false}>
      <Modal.Body className="text-center">
        <Spinner animation="border" variant="primary" />
        <h4 className="mt-3">Updating product...</h4>
      </Modal.Body>
    </Modal>
  );
};
