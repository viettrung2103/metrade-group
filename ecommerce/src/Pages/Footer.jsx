import React from 'react'
import {Container, Row, Col, Button} from "react-bootstrap";

const Footer = () => {
  return (
    <footer className='footer'>
        <Container fluid className=''>
            <Row className='footer-upper'>
                <Col md={{span: 6, offset: 1}} >
                    <h1>Metrade</h1>
                    <p>Metrade is the exclusive marketplace for the Metropolia University community, designed to help students and staff buy, sell, and trade with ease. Join us in connecting the campus one trade at a time.</p>
                </Col>
                <Col md={{span: 3, offset: 1}} className="d-flex justify-content-center align-items-center">
                    <Button className='btn-empty' href="/about">Contact Us</Button>
                </Col>
            </Row>

            <Row className='footer-lower text-center'>
                <Col className='footer-icons'>
                    <a href='https://www.facebook.com' target='_blank' rel='noreferrer'><i className="fa-brands fa-facebook-f"/></a>
                    <a href='https://www.instagram.com' target='_blank' rel='noreferrer'><i className="fa-brands fa-instagram"></i></a>
                    <a href='https://www.twitter.com' target='_blank' rel='noreferrer'><i className="fa-brands fa-twitter"></i></a>
                    <a href='https://www.linkedin.com' target='_blank' rel='noreferrer'><i className="fa-brands fa-linkedin"></i></a>
                </Col> 
                <Row className='footer-trademark'>
                    <p>&copy; Metrade 2024. All rights reserved.</p>   
                </Row>
            </Row>
        </Container>
    </footer>
  );
};

export default Footer;
