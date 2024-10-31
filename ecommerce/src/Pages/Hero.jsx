import heroImg from "../assets/heroNew.png";
import icon1 from "../assets/hero1.png";
import icon2 from "../assets/hero2.png";
import icon3 from "../assets/hero3.png";
import icon4 from "../assets/hero4.png";
import {Container, Row, Col, Button} from "react-bootstrap";
import style from "../Styles/Hero.module.css";
import { useAuthContext } from "../hooks/useAuthContext";

const Hero = () => {
  const { user } = useAuthContext();
  return (
    <Container fluid className={`${style.hero} px-5`}>
      <Row className="flex-row-reverse">
        <Col lg={5} xl={4} className="d-flex align-items-end">
          <img
            src={heroImg}
            alt="hero img"
            className="img-fluid"
            style={{ width: "30rem", height: "auto" }}
          />
        </Col>
        <Col lg={7} xl={8} className="text-center ">
          <Container>
            <h1 className="fw-bold">TRADE SMARTER, TOGETHER</h1>
            <h2 className="lead">Secure and Easy Transaction</h2>
          </Container>
          {!user && (
            <Button
              variant="primary"
              size="lg"
              href="/login"
              className={style.heroBtn}
            >
              Explore
            </Button>
          )}
          <Row className="justify-content-center p-5">
            <Col className="align-items-center d-flex flex-column">
              <img
                src={icon1}
                alt="icon"
                style={{ width: "50px", height: "50px" }}
              />
              <p>Environmentally Friendly</p>
            </Col>
            <Col className="align-items-center d-flex flex-column">
              <img
                src={icon2}
                alt="icon"
                style={{ width: "50px", height: "50px" }}
              />
              <p>Save Money</p>
            </Col>
            <Col className="align-items-center d-flex flex-column">
              <img
                src={icon3}
                alt="icon"
                style={{ width: "50px", height: "50px" }}
              />
              <p>Diverse</p>
            </Col>
            <Col className="align-items-center d-flex flex-column">
              <img
                src={icon4}
                alt="icon"
                style={{ width: "50px", height: "50px" }}
              />
              <p>High Quality</p>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Hero;
