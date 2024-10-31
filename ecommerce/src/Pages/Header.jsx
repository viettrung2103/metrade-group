import React from "react";
import logo2 from "../assets/logo-2-removebg.png";
import PageLinks from "../Components/PageLinks";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
} from "react-bootstrap";
import style from "../Styles/Navbar.module.css";
import SearchBar from "../Components/SearchBar";
import { useAuthContext } from "../hooks/useAuthContext";
import ProfileMenu from "../Components/ProfileMenu";
import CartMenu from "../Components/CartMenu";
import AdminDropdown from "../Components/AdminDropdown";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const { user } = useAuthContext();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    message: "",
    buttonText: "",
    buttonLink: "",
  });
  const navigate = useNavigate();

  const handleSellNowClick = () => {
    if (!user) {
      setModalContent({
        message: "Please signup to access this feature.",
        buttonText: "Signup Now",
        buttonLink: "/signup",
      });
      setShowModal(true);
    } else if (user.role !== "seller" && user.role !== "admin") {
      setModalContent({
        message: "Please verify your email to access this feature.",
        buttonText: "To My Page",
        buttonLink: "/my-page",
      });
      setShowModal(true);
    } else {
      navigate("/new-product");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Container fluid className="header-container">
        <Row className={`${style.navUpper} w-100`}>
          <Container className={`${style.navContainer}`}>
            <Navbar.Brand
              as={Link}
              to={user && user.role === "admin" ? "/admin-user" : "/"}
            >
              <img src={logo2} alt="" className="nav-logo" />
            </Navbar.Brand>
            <SearchBar />
            <div className={`${style.rightContainer}`}>
              {!user ? (
                <>
                  <Button
                    className={`${style.btnSellNow} d-none d-md-block`}
                    onClick={handleSellNowClick}
                  >
                    Sell Now
                  </Button>
                  <Nav.Link className={`${style.btnLogin}`} href="/login">
                    Login
                  </Nav.Link>
                </>
              ) : user.role === "admin" ? (
                <AdminDropdown />
              ) : (
                <>
                  <Button
                    className={`${style.btnSellNow} d-none d-md-block`}
                    onClick={handleSellNowClick}
                  >
                    Sell Now
                  </Button>
                  <ProfileMenu />
                </>
              )}

              <CartMenu />
            </div>
          </Container>
        </Row>
        {/* <Row className="d-flex justify-content-center align-items-center vh=100"> */}
        <Row>
          <PageLinks />
        </Row>
      </Container>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Access Restricted</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{modalContent.message}</p>
          <Button href={modalContent.buttonLink}>
            {modalContent.buttonText}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Header;
