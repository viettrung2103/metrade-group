import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  FormControl,
  InputGroup,
  Modal,
  Pagination,
} from "react-bootstrap";
// import useAdminActions from "../hooks/useAdminAction";
import "../Styles/AdminUserComp.css";

const AdminUserComp = () => {
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState({
    all: 0,
    active: 0,
    banned: 0,
    deleted: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const pageLimit = 8; // 8 users per page
  const [searchTerm, setSearchTerm] = useState(""); //track the search input

  // Track the status and search query and fetch users accordingly
  const [searchQuery, setSearchQuery] = useState(""); //handle search input after submit
  const [status, setStatus] = useState(""); //track which 'status' button is clicked

  //Track actions upon user
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch user counts on top of the page
  const fetchUserCounts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/users/count`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setUserCount({
        all: data.allUsersCount,
        active: data.activeUserCount,
        banned: data.bannedUserCount,
        deleted: data.deletedUserCount,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/users?page=${currentPage}&status=${status}&search=${searchQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setUsers(data.users);
      setPageCount(Math.ceil(data.totalUsersDisplay / pageLimit));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUserCounts();
    fetchUsers();
  }, [searchQuery, status, currentPage, showModal]);

  // Handle action button
  const handleActionButton = async (user) => {
    setShowModal(true);
    setSelectedUser(user);
  };
  const handleClose = () => setShowModal(false);

  const handleActivateAction = async () => {
    if (!selectedUser) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/users/${selectedUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: "active",
          }),
        }
      );
      if (response.ok) {
        fetchUsers();
        setShowModal(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleBanAction = async () => {
    if (!selectedUser) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/users/${selectedUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: "banned",
          }),
        }
      );
      if (response.ok) {
        fetchUsers();
        setShowModal(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteAction = async () => {
    if (!selectedUser) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/users/${selectedUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: "deleted",
          }),
        }
      );
      if (response.ok) {
        setShowModal(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  //Search when Enter key is pressed
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  //Search when search button is clicked
  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setStatus("");
    setSearchTerm("");
  };

  //Handle status button click
  const handleStatusClick = (status) => {
    setStatus(status);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getTextVariant = (status) => {
    switch (status) {
      case "active":
        return "success"; // green
      case "banned":
        return "warning"; // yellow
      case "deleted":
        return "danger"; // red
      default:
        return "primary"; // default color
    }
  };

  return (
    <Container fluid className="p-4">
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col>
          <Card
            className="text-center status-card"
            onClick={() => handleStatusClick("")}
          >
            <Card.Body>
              <Card.Title className="status-card-title">All users</Card.Title>
              <Card.Text className="text-default fs-2 status-card-text">
                {userCount.all}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card
            className="text-center status-card"
            onClick={() => handleStatusClick("active")}
          >
            <Card.Body>
              <Card.Title className="status-card-title">Active</Card.Title>
              <Card.Text className="text-success fs-2 status-card-text">
                {userCount.active}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card
            className="text-center status-card"
            onClick={() => handleStatusClick("banned")}
          >
            <Card.Body>
              <Card.Title className="status-card-title">Banned</Card.Title>
              <Card.Text className="text-warning fs-2 status-card-text">
                {userCount.banned}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card
            className="text-center status-card"
            onClick={() => handleStatusClick("deleted")}
          >
            <Card.Body>
              <Card.Title className="status-card-title">Deleted</Card.Title>
              <Card.Text className="text-danger fs-2 status-card-text">
                {userCount.deleted}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row>
        <Col>
          <Container fluid className=" search-bar-container d-flex">
            <FormControl
              className="search-input"
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button className="search-button" onClick={handleSearch}>
              <i className="fa-solid fa-magnifying-glass" />
            </Button>
          </Container>
        </Col>
      </Row>

      {/* Product Table */}
      { users && users.length > 0  ? (
      <Container fluid className="table-responsive p-0">
        <Table striped bordered hover className="user-table">
          <thead className="user-table-header">
            <tr>
              <th>User email</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.email}</td>
                <td
                  className={`text-user-status-${getTextVariant(user.status)}`}
                >
                  {user.status}
                </td>
                <td>
                  <Button
                    className="action-button"
                    onClick={() => {
                      handleActionButton(user);
                    }}
                    {...(user.status === "deleted"
                      ? { disabled: true }
                      : { active: true })}
                  >
                    Action
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
      ) : (
        <h3 className="mt-3" >No users found</h3>
      )}
      {/*Popup menu to perform actions to users */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change user's status</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          {selectedUser?.status === "banned" ? (
            <>
              <Button variant="primary" onClick={handleActivateAction}>
                Reactivate user
              </Button>
              <Button variant="primary" onClick={handleDeleteAction}>
                Delete user
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" onClick={handleBanAction}>
                Ban user
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
      {/* Pagination */}
      {pageCount > 1 && (
        <Container className="d-flex justify-content-center">
          <Pagination>
            {[...Array(pageCount).keys()].map((index) => (
              <Pagination.Item
                key={index}
                active={currentPage === index + 1}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </Container>
      )}
    </Container>
  );
};

export default AdminUserComp;
