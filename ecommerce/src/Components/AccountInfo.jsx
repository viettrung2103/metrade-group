import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Form, Button, Row, Col, Image, Container, Toast, Spinner } from "react-bootstrap";
import ProfileImage from "../assets/profile-default-image.png";
import "../Styles/AccountInfo.css";
import { emailValidation } from "../utils/emailValidation";

const AccountInfo = () => {
  const [avatarData, setAvatarData] = useState(null); // for saving avatar in database
  const [avatarPreview, setAvatarPreview] = useState(ProfileImage); // For avatar preview
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { user, updateUser, scheduleTokenRenewal } = useAuthContext();
  const fileInputRef = useRef(null);
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  const fetchProfile = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/user/profile/detail`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include"
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAvatarPreview(data.user.photo_url ? `${process.env.REACT_APP_API_PUBLIC_URL}/${data.user.photo_url}` : ProfileImage);
        setFirstName(data.user.first_name);
        setLastName(data.user.last_name);
        setPhone(data.user.phone);
        setEmail(data.user.email);
        setIsVerified(data.user.is_verified);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [user, fetchProfile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarData(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    // File validation
    if (avatarData & !allowedTypes.includes(avatarData?.type)) {
      setError("Only image files (JPEG, PNG, GIF) are allowed");
      setLoading(false);
      return;
    }

    // Name validation
    if (!lastName || !firstName) {
      setError("Last name and first name are required");
      setLoading(false);
      return;
    }

    // Phone validation
    if (!phone) {
      setError("Phone are required");
      setLoading(false);
      return;
    }

    // Current Password validation
    if (newPassword & !currentPassword) {
      setError("Please input your current password");
      setLoading(false);
      return;
    }

    // Confirm New Password validation
    if (newPassword & !confirmNewPassword) {
      setError("Please confirm new password");
      setLoading(false);
      return;
    }

    // New Password validation
    if (newPassword & newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match");
      setLoading(false);
      return;
    }

    // Update profile
    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("phone", phone);

    // Add the avatar file only if it's selected
    if (avatarData) {
      formData.append("avatar", avatarData);
    }

    // Add password fields only if the user is changing the password
    if (currentPassword && newPassword) {
      formData.append("current_password", currentPassword);
      formData.append("new_password", newPassword);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/user/profile/update`,
        {
          method: "PATCH",
          body: formData,
          credentials: "include"
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Profile updated successfully");
        fetchProfile();
        // Update user in local storage and context
        updateUser({ ...user, ...data.user });
      } else {
        setError(data.message || "Failed to update profile");
      }

    } catch (error) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!user) {
      return;
    }

    const email = user.email;

    if (!emailValidation(email)) {
      setError("Email must be a valid Metropolia email");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/resend-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Verification email sent successfully");
      } else {
        setError(data.message || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setError("Server error. Please try again later.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };


  return (
    <Container>
      <Row className="account-info py-4">
        {error && (
          <Toast
            className="error-toast text-white"
            onClose={() => setError("")}
            delay={3000}
            autohide
            bg="danger"
          >
            <Toast.Body>{error}</Toast.Body>
          </Toast>
        )}

        {success && (
          <Toast
            className="success-toast text-white"
            onClose={() => setSuccess("")}
            delay={3000}
            autohide
            bg="success"
          >
            <Toast.Body>{success}</Toast.Body>
          </Toast>
        )}

        <div className="avatar-container">
          <Image src={avatarPreview} roundedCircle className="avatar-image" />

          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            ref={fileInputRef}
            className="d-none"
          />
          <button className="change-avatar-btn" onClick={triggerFileInput}>
            <i
              className="fa-solid fa-pen-to-square"
              style={{ cursor: "pointer" }}
            ></i>
          </button>
        </div>

        <Form onSubmit={handleSaveChanges}>
          <Row sm={1} md={2} className="mb-3">
            <Col sm={12} md={6}>
              <Form.Group controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col sm={12} md={6}>
              <Form.Group controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row sm={1} md={2} className="mb-3">
            <Col sm={12} md={6}>
              <Row>
                <Col sm={12} md={isVerified ? 12 : 9}>
                  <Form.Group controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={email} disabled />
                  </Form.Group>
                </Col>
                {!isVerified && (<Col sm={12} md={3} className="align-self-end">
                  <Button className="veriry-button" onClick={() => verifyEmail()}>
                    Verify
                  </Button>
                </Col>
                )}
              </Row>
            </Col>
            <Col sm={12} md={6}>
              <Form.Group controlId="phone">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Form.Label>Password Changes</Form.Label>
            <Form.Group controlId="currentPassword" className="mb-3">
              <Form.Control
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="newPassword" className="mb-3">
              <Form.Control
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="confirmNewPassword" className="mb-3">
              <Form.Control
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </Form.Group>
          </Row>

          <Row sm={1} md={2} className="justify-content-md-end">
            <Col sm={12} md={3}>
              <Button
                type="submit"
                className="save-changes-btn"
                disabled={loading}
              >
                <Spinner animation="border" hidden={!loading} /> Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      </Row>
    </Container>
  );
};

export default AccountInfo;
