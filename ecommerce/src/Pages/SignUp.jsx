import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "../hooks/useAuthContext";
import { emailValidation } from "../utils/emailValidation";
import Logo from "./../../src/assets/logo.png";

import "../../src/Styles/Login.css";
import "../Styles/SignUp.css";

const ERROR_FIRST_NAME = "Missing First Name";
const ERROR_LAST_NAME = "Missing Last Name";
const ERROR_PASSWORD = "Password need to be more than 8 characters";
const ERROR_EMAIL = "Must use Metropolia email";

const checkValidPassword = (string) => {
  return string.length >= 8;
};

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validFirstName, setValidFirstName] = useState(false);
  const [validLastName, setValidLastName] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const [errors, setErrors] = useState([]);
  const { user } = useAuthContext();


  const handleFirstName = (e) => {
    setFirstName((fn) => e.target.value);
    if (e.target.value != "") {
      setValidFirstName((vfn) => true);
    } else {
      setValidFirstName((vfn) => false);
    }
  };
  const handleLastName = (e) => {
    setLastName((ln) => e.target.value);
    if (e.target.value != "") {
      setValidLastName((vln) => true);
    } else {
      setValidLastName((vln) => false);
    }
  };

  const handleEmail = (event) => {
    setEmail((e) => event.target.value);
    if (emailValidation(event.target.value)) {
      setValidEmail((ve) => true);
    } else {
      setValidEmail((ve) => false);
    }
  };
  const handlePassword = (e) => {
    setPassword((p) => e.target.value);
    if (checkValidPassword(e.target.value)) {
      setValidPassword((vp) => true);
    } else {
      setValidPassword((vp) => false);
    }
  };

  const isvalidForm = () => {
    setErrors((e) => []);
    let check = true;
    if (!validFirstName) {
      setErrors((e) => [...e, ERROR_FIRST_NAME]);
      check = false;
    }
    if (!validLastName) {
      setErrors((e) => [...e, ERROR_LAST_NAME]);
      check = false;
    }
    if (!validEmail) {
      setErrors((e) => [...e, ERROR_EMAIL]);
      check = false;
    }
    if (!validPassword) {
      setErrors((e) => [...e, ERROR_PASSWORD]);
      check = false;
    }
    return check;
  };

  const handleTogglePassword = () => {
    if (passwordType === "password") {
      setPasswordType((pt) => "text");
    }
    if (passwordType === "text") {
      setPasswordType((pt) => "password");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const isValid = isvalidForm();

    if (isValid) {
      const newUser = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      };
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          setFirstName((fn) => "");
          setLastName((fn) => "");
          setEmail((e) => "");
          setPassword((p) => "");
          setValidFirstName((vn) => false);
          setValidLastName((vn) => false);
          setValidEmail((ve) => false);
          setValidPassword((vp) => false);
          throw new Error(data.message || "Something went wrong");
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error during registration:", err);
        setErrors((e) => [...e, err.message]);
      } finally {
        setLoading(false);
      }
    }
    setLoading(false);
  };
  return (
    <>
      {user ? (
        navigate("/")
      ) : (
        <div className="signin-wrapper">
          <div className="signin-image">
            <img src={Logo} alt="logo" />
          </div>
          <div className="signin-form-container">
            <h2 className="signin-title">Get Started!</h2>
            {errors.length > 0 && (
              <Alert variant="danger" onClose={() => setErrors([])} dismissible>
                {errors.map((error, index) => {
                  return (
                    <p className="signup-error-item" key={index}>
                      {error}
                    </p>
                  );
                })}
              </Alert>
            )}
            <Form className="signin-form" onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="signin-label">First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={handleFirstName}
                  className="signin-input"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="signin-label">Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={handleLastName}
                  className="signin-input"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="signin-label">Email</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your metropolia email"
                  name="email"
                  value={email}
                  onChange={handleEmail}
                  className="signin-input"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label className="signin-label">Password</Form.Label>
                <div className="password-container">
                  <Form.Control
                    type={passwordType}
                    name="password"
                    placeholder="Enter your password"
                    onChange={handlePassword}
                    value={password}
                    className="signin-input"
                  />
                  {passwordType === "password" ? (
                    <i
                      className="fa-solid fa-eye"
                      id="show-password"
                      onClick={handleTogglePassword}
                    ></i>
                  ) : (
                    <i
                      className="fa-solid fa-eye-slash"
                      onClick={handleTogglePassword}
                    ></i>
                  )}
                </div>
              </Form.Group>
              <Button variant="primary" type="submit" className="signin-button">
                {loading ? <Spinner animation="border" size="sm" /> : "SIGN UP"}
              </Button>
            </Form>

            <div className="signin-footer text-center">
              <p>
                Already have an account?{" "}
                <span>
                  <Link to="/login" className="signin-link">
                    <strong>Sign in</strong>
                  </Link>
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default SignUp;
