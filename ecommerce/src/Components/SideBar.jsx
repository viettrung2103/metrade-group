import { Container, Col, Row, Button, Modal } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useState , useEffect } from "react";
import {useAuthContext} from "../hooks/useAuthContext";
import "../Styles/SideBar.css";

const SideBar = ({ pageName, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [showSubOptions, setShowSubOptions] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if the current path matches /selling-history or /new-product
    if (
      location.pathname === "/selling-history" ||
      location.pathname === "/new-product"
    ) {
      setShowSubOptions(true);
    }
  }, [location.pathname]);

  const handleSellingPageClick = () => {
    if (!user || user.role !== "seller") {
      setShowModal(true);
    } else {
      setShowSubOptions(!showSubOptions);
    }
  };

  const handlePurchaseHistoryClick = () => {
    if (!user || user.role !== "seller") {
      setShowModal(true);
    } else {
      navigate("/purchase-history");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Container className="side-bar">
      <h3>{pageName}</h3>
      <Row sm={1} md={2} lg={2} className="">
        <Col sm={12} md={2} lg={2} className="left-container mb-4">
          <Button
            className="menu-item-btn"
            disabled={location.pathname === "/my-page"}
            onClick={() => navigate("/my-page")}
          >
            My Profile
          </Button>
          <Button
            className="menu-item-btn"
            onClick={handleSellingPageClick}
            disabled={
              location.pathname === "/selling-history" ||
              location.pathname === "/new-product"
            }
          >
            My Selling Page
          </Button>
          {showSubOptions && (
            <Container>
              <Button
                className="submenu-item-btn"
                onClick={() => navigate("/selling-history")}
                disabled={location.pathname === "/selling-history"}
              >
                Inventory
              </Button>
              <Button
                className="submenu-item-btn"
                onClick={() => navigate("/new-product")}
                disabled={location.pathname === "/new-product"}
              >
                New Product
              </Button>
            </Container>
          )}
          <Button
            className="menu-item-btn"
            disabled={location.pathname === "/purchase-history"}
            onClick={handlePurchaseHistoryClick}
          >
            My Purchase History
          </Button>
        </Col>
        <Col sm={12} md={10} lg={10} className="right-container">
          {children}
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Access Restricted</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please verify your email to access this feature.</p>
          <Button onClick={handleCloseModal}>Go to My Page</Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SideBar;