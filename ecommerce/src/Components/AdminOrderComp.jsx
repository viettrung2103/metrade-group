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
  Pagination,
  Modal,
} from "react-bootstrap";
import AdminOrderStats from "./AdminOrderStats";
import { useAuthContext } from "../hooks/useAuthContext";
import {
  displaySellingStatusColor,
  capitalizeStatusStr,
  convertToQueryString,
  findTotalPage,
} from "../utils/transactionUtils";
import "../Styles/AdminOrder.css";
import Loading from "./Loading";

const STATUS_LIST = ["processing", "await-pickup", "delivered", "cancelled"];

const getNewSellingStatus = (str) => {
  switch (str) {
    case STATUS_LIST[0]:
      return STATUS_LIST[1];
    case STATUS_LIST[1]:
      return STATUS_LIST[2];
    default:
      return str;
  }
};

const AdminOrderComp = () => {
  // Sample data
  const { user, updateUser, scheduleTokenRenewal } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  // const [products, setProducts] = useState(initialProducts);
  const [orderItems, setOrderItems] = useState([]);
  const [pickupPlace, setPickUpPlace] = useState("");
  const [status, setStatus] = useState("");
  const [itemId, setItemId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [queryStrArr, setqueryStrArr] = useState([]);
  const [error, setError] = useState(null);

  const [selectedOrderItem, setSelectedOrderItem] = useState(null); // Selected product for action
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State to control success modal visibility
  const [successMessage, setSuccessMessage] = useState(""); // State to store success message

  //fetch stat stats
  useEffect(() => {
    const abortcontroller = new AbortController();
    const fetchStats = async () => {
      try {
        setLoading((l) => true);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/admin/orders/stats`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            signal: abortcontroller.signal,
          }
        );
        if (response.ok) {
          const statsData = await response.json();
          setStats((s) => ({ ...s, ...statsData.data }));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setError((e) => error.message);
          console.log("Error fetching stats", error.message);
        }
      } finally {
        setLoading((l) => false);
      }
    };
    fetchStats();
    return () => {
      abortcontroller.abort();
    };
  }, [orderItems]);

  // fetch orderItems
  useEffect(() => {
    const abortcontroller = new AbortController();
    setOrderItems((od) => []);

    const fetchOrderItems = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/admin/orders${convertToQueryString(
            queryStrArr
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            signal: abortcontroller.signal,
          }
        );
        if (response.ok) {
          const data = await response.json();

          setOrderItems((ot) => data.data);
          setTotalPages((tp) => findTotalPage(data.totalItems, data.limit));
        } else {
          setTotalPages((tp) => 0);
          throw new Error("Cannot get data");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log(error.message);
          setError((e) => error.message);
        }
      }
    };
    fetchOrderItems();
    return () => {
      abortcontroller.abort();
    };
  }, [queryStrArr, selectedOrderItem]);

  //update querystring automatically
  useEffect(() => {
    const updateQueryStringArray = () => {
      setqueryStrArr((qta) => {
        let newQueryStrArr = qta.filter(
          (param) =>
            !param.includes("selling_status") && !param.includes("page")
        );
        if (status) {
          newQueryStrArr.push(`selling_status=${status}`);
          setPage((p) => 1);
        }

        return newQueryStrArr;
      });
    };
    updateQueryStringArray();
  }, [status]);

  const changeSellingStatus = (str) => {
    setStatus((s) => str);
    setPage((p) => 1);
  };

  const displayAllOrderItem = () => {
    setqueryStrArr((qta) => []);
    setStatus((s) => "");
    setPage((p) => 1);
    setItemId((ii) => "");
  };

  const updateQueryStringArrayWithPage = (pageNumber) => {
    setPage((p) => pageNumber);
    setqueryStrArr((qta) => {
      let updatedQueryStrArr = qta.filter((param) => !param.includes("page"));
      if (page) {
        updatedQueryStrArr.push(`page=${pageNumber}`);
      }
      return updatedQueryStrArr;
    });
  };

  const handlePageChange = (pageNumber) => {
    updateQueryStringArrayWithPage(pageNumber);
  };

  const handleItemId = (e) => {
    setItemId((ii) => e.target.value);
  };

  const updateQueryStringArrayWithId = () => {
    setqueryStrArr((qta) => {
      let updatedQueryStrArr = qta.filter(
        (param) =>
          !param.includes("_id") &&
          !param.includes("page") &&
          !param.includes("selling_status")
      );
      if (itemId) {
        updatedQueryStrArr.push(`_id=${itemId}`);
        setPage((p) => 1);
      }
      return updatedQueryStrArr;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("submitting");
    updateQueryStringArrayWithId();
  };

  const handleKeyPress = (e) => {
    e.preventDefault();
    if (e.key === "Enter") {
      updateQueryStringArrayWithId();
    }
  };

  // Handle opening the modal with the selected order item
  const handleActionClick = (orderItem) => {
    setSelectedOrderItem(orderItem);
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrderItem(null);
  };

  // Handle closing the success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  //handle Button inside Modal
  const handleStatusChange = async (item) => {
    try {
      const newSellingStatus = getNewSellingStatus(item.selling_status);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/orders/${item._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selling_status: newSellingStatus,
          }),
          credentials: "include",
          // signal: abortcontroller.signal,
        }
      );
      if (response.ok) {
        handleCloseModal();
        setSuccessMessage("Order item changes status successfully");
        setShowSuccessModal(true);
      } else {
        throw new Error("Fail to change order item's status");
      }
    } catch (error) {
      console.error(error.message);
      setError((e) => error.message);
    }
  };

  const handleCancelStatus = async (item) => {
    try {
      console.log("handle cancel status");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/orders/${item._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selling_status: STATUS_LIST[3],
          }),

          credentials: "include",
        }
      );
      if (response.ok) {
        handleCloseModal();
        setSuccessMessage("Order item cancels successfully");
        setShowSuccessModal(true);
      } else {
        throw new Error("Fail to cancel order item");
      }
    } catch (error) {
      console.error(error.message);
      setError((e) => error.message);
    }
  };

  return (
    <Container fluid className=" production-dashbard p-4">
      {/* Statistics Cards */}
      <AdminOrderStats
        stats={stats}
        statusList={STATUS_LIST}
        changeSellingStatus={changeSellingStatus}
        displayAllOrderItem={displayAllOrderItem}
      />

      {/* Search bar */}
      <Row>
        <Col>
          <Container fluid className="search-bar-container d-flex">
            <FormControl
              className="search-input"
              placeholder="Search order item id..."
              value={itemId}
              onChange={handleItemId}
              onKeyUp={handleKeyPress}
            />
            <Button className="search-button" onClick={handleSubmit}>
              <i className="fa-solid fa-magnifying-glass" />
            </Button>
          </Container>
        </Col>
      </Row>

      {/* Order Table */}
      {loading ? (
        <Loading />
      ) : error ? (
        <>
          <h1>Error: {error}</h1>
          <Container style={{ height: "200px" }}></Container>
        </>
      ) : orderItems.length === 0 ? (
        <div>
          <p>Cannot find any order.</p>
        </div>
      ) : (
        <Container fluid className="table-responsive p-0">
          <Table striped bordered hover className="product-table">
            <thead className="product-table-header">
              <tr>
                <th>Order Item Picture</th>
                <th>Order Item Id</th>
                <th className="align-middle">Status</th>
                <th className="align-middle">Action</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="product-image"
                      style={{
                        width: "100px",
                        height: "auto",
                        objectFit: "contain",
                      }}
                    />
                  </td>
                  <td className="align-middle">{item._id}</td>
                  <td
                    className="align-middle"
                    style={{
                      color: `${displaySellingStatusColor(
                        item.selling_status
                      )}`,
                    }}
                  >
                    {item.selling_status}
                  </td>
                  <td className="text-center align-middle">
                    {item.selling_status !== STATUS_LIST[3] ? (
                      <Button
                        className="action-button"
                        onClick={() => handleActionClick(item)}
                      >
                        Action
                      </Button>
                    ) : (
                      <Button
                        className="action-button"
                        onClick={() => handleActionClick(item)}
                        disabled
                      >
                        Action
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Container className="d-flex justify-content-center">
            <Pagination className="order-page">
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === page}
                  onClick={() => handlePageChange(index + 1)}
                  className="order-page-item"
                >
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Container>

          {/* Action Modal */}
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Product Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Order Item ID: {selectedOrderItem?._id}</p>
              <p>Status: {selectedOrderItem?.selling_status}</p>
              {selectedOrderItem?.selling_status === STATUS_LIST[0] ? (
                <>
                  <Button
                    variant="success"
                    className="me-2"
                    onClick={() => handleStatusChange(selectedOrderItem)}
                  >
                    AWAIT PICKUP
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleCancelStatus(selectedOrderItem)}
                  >
                    CANCEL
                  </Button>
                </>
              ) : selectedOrderItem?.selling_status === STATUS_LIST[1] ? (
                <>
                  <Button
                    variant="success"
                    className="me-2"
                    onClick={() => handleStatusChange(selectedOrderItem)}
                  >
                    DELIVER
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleCancelStatus(selectedOrderItem)}
                  >
                    CANCEL
                  </Button>
                </>
              ) : (
                <Button
                  variant="danger"
                  onClick={() => handleCancelStatus(selectedOrderItem)}
                >
                  Cancel
                </Button>
              )}
            </Modal.Body>
          </Modal>

          {/* Success Modal */}
          <Modal
            show={showSuccessModal}
            onHide={handleCloseSuccessModal}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Success</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{successMessage}</p>
            </Modal.Body>
          </Modal>
        </Container>
      )}
    </Container>
  );
};

export default AdminOrderComp;
