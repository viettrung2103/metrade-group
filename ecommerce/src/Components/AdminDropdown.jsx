import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import ProfileImage from "../assets/profile-default-image.png";
import style from "../Styles/ProfileMenu.module.css";
import ButtonGroup from "react-bootstrap/ButtonGroup";

const AdminDropdown = () => {
  const { user, logout } = useAuthContext();

  const navigate = useNavigate();

  return (
    <Dropdown className={`${style.profileMenu}`}>
      <Dropdown.Toggle
        as={ButtonGroup}
        className={`${style.profileButton}`}
        id="dropdown-profile-button"
      >
        <i className="fa-solid fa-caret-down"></i>
        <img
          src={
            user.photo_url
              ? `${process.env.REACT_APP_API_PUBLIC_URL}/${user.photo_url}`
              : ProfileImage
          }
          alt="Profile"
        />
        <span className={`${style.profileName}`}>{user.first_name}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className={`${style.profileMenuItems}`}>
        <Dropdown.Item
          onClick={() => navigate("/admin-user")}
          className={`${style.profileMenuItem}`}
        >
          User Management
        </Dropdown.Item>
        <Dropdown.Item
          className={`${style.profileMenuItem}`}
          onClick={() => navigate("/admin-product")}
        >
          Product Management
        </Dropdown.Item>
        <Dropdown.Item
          className={`${style.profileMenuItem}`}
          onClick={() => navigate("/admin-order")}
        >
          Order Management
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => logout()}
          className={`${style.profileMenuItem}`}
        >
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AdminDropdown;
