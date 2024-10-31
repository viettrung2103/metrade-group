import { Container, Col, Row, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "../Styles/SideBar.css";

const AdminSideBar = ({ pageName, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Container className="side-bar">
      <h3>{pageName}</h3>
      <Row sm={1} md={2} lg={2} className="">
        <Col sm={12} md={2} lg={2} className="left-container mb-4">
          <Button
            className="menu-item-btn"
            disabled={location.pathname === "/admin-user"}
            onClick={() => navigate("/admin-user")}
          >
            Users Management
          </Button>
          <Button
            className="menu-item-btn"
            disabled={location.pathname === "/admin-product"}
            onClick={() => navigate("/admin-product")}
          >
            Products Management
          </Button>
          <Button
            className="menu-item-btn"
            disabled={location.pathname === "/admin-order"}
            onClick={() => navigate("/admin-order")}
          >
            Orders Management
          </Button>
        </Col>
        <Col sm={12} md={10} lg={10} className="right-container">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminSideBar;
