import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import logo4 from '../assets/logo-4-removebg.png';
import aboutus1 from '../assets/aboutus1.png';
import aboutus2 from '../assets/aboutus2.png';
import style from '../Styles/AboutContact.module.css';

const AboutContact = () => {
  return (
    <>
      <Container fluid className={`${style.aboutContact}`}>
        <Row className={`${style.sectionMetrade}`}>
          <Col>
            <Row>
              <h2 className={`${style.aboutTitle}`}>About Metrade</h2>
              <p>
                Welcome to Metrade, the exclusive marketplace designed
                specifically for the Metropolia University community. Whether
                you&apos;re a student, staff member, or faculty, Metrade is here
                to make buying, selling, and trading easier and more secure –
                all within the trusted walls of our university.
              </p>
            </Row>
            <Row>
              <h2 className={`${style.aboutTitle}`}>Our Mission</h2>
              <p>
                At Metrade, our mission is simple: to connect the Metropolia
                community through a safe, convenient, and university-driven
                marketplace. We believe in fostering a sustainable campus
                economy where students and staff can exchange goods, share
                resources, and support one another.
              </p>
            </Row>
          </Col>
          <Col>
            <img src={logo4} alt="Image logo" />
          </Col>
        </Row>

        <Row className={`${style.sectionOffer}`}>
          <Col>
            <img src={aboutus1} alt="Jumping friends" />
          </Col>
          <Col>
            <h2 className={`${style.aboutTitle}`}>What We Offer</h2>
            <p>
              <b>A Trusted Campus Marketplace:</b> Metrade is designed
              exclusively for Metropolia University students, staff, and
              faculty. This ensures that every user on the platform is part of
              the university community, providing a safer and more reliable
              trading experience.
            </p>
            <p>
              <b>Buy and Sell with Ease:</b> Looking to buy textbooks for the
              new semester or sell items you no longer need? Metrade allows you
              to post listings, browse categories, and connect with buyers and
              sellers all in one place.
            </p>
            <p>
              <b>University Coins Integration:</b> Metrade makes transactions
              even easier with the use of University Coins, our campus-specific
              currency. This ensures secure, seamless, and cash-free payments
              across the platform.
            </p>
            <p>
              <b>Sustainability Focus:</b> By promoting the buying and selling
              of pre-loved items, Metrade contributes to a more sustainable
              campus environment, helping reduce waste while offering students
              more affordable options.
            </p>
          </Col>
        </Row>

        <Row className={`${style.sectionContact}`}>
          <Col>
            <Row>
              <h2 className={`${style.aboutTitle}`}>Our Team</h2>
              <p>
                Metrade is run by a{" "}
                <b>passionate team of Metropolia University students</b>{" "}
                dedicated to building a platform that reflects the needs of our
                community. From developers to support staff, our goal is to
                provide you with the best experience possible.
              </p>
            </Row>
            <Row>
              <h2 className={`${style.aboutTitle}`}>Contact Us</h2>
              <p>
                We&apos;re here to help! Whether you have a question about a
                product, need assistance with your account, or want to provide
                feedback, the Metrade team is ready to assist you.
              </p>
              <h4>Customer support</h4>
              <p>
                If you need help with your account, listing, or purchase, feel
                free to reach out to our support team.
              </p>
              <ul>
                <li>
                  Email:{" "}
                  <span className={`${style.redText}`}>
                    support@metrade.com
                  </span>
                </li>
                <li>
                  Phone:{" "}
                  <span className={`${style.greenText}`}>+123 456 7890</span>
                </li>
                <li>
                  Operating Hours: Monday to Friday, 9 AM – 5 PM (local time)
                </li>
              </ul>
              <h4>General Inquiries</h4>
              <p>
                For any non-urgent questions or general inquiries about Metrade,
                you can contact us at: info@metrade.com
              </p>
            </Row>
          </Col>
          <Col>
            <img src={aboutus2} alt="Sitting team" />
          </Col>
        </Row>

        <Row className={`${style.sectionMovement}`}>
          <h2 className={`${style.aboutTitle}`}>Join the Metrade Movement</h2>
          <p>
            We&apos;re more than just a marketplace – we&apos;re a growing
            community of students and staff who believe in the power of
            connection and sustainable trading. Whether you&apos;re a buyer
            looking for a great deal or a seller ready to pass on your gently
            used items, Metrade is your go-to platform. Thank you for being part
            of Metropolia&apos;s vibrant trading community. We look forward to
            helping you find what you need, sell what you no longer do, and
            connect with your fellow students and staff – all through Metrade.
          </p>
          <h4>Let&apos;s Trade Together. Let&apos;s Trade Smart</h4>
        </Row>
      </Container>
    </>
  );
}

export default AboutContact
