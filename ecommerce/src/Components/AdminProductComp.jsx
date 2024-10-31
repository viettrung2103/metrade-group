import { useState, useEffect } from "react";
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
import Loading from "../Components/Loading";
import "../Styles/AdminProduct.css";
import { Link } from "react-router-dom";

const AdminProductComp = () => {
  const [products, setProducts] = useState([]); // State to hold products fetched from backend
  const [loading, setLoading] = useState(true); // Loading state
  const [page, setPage] = useState(1); // State to keep track of the current page
  const [error, setError] = useState(null); // Error state
  const limit = 8; // Limit of products to fetch per page
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [status, setStatus] = useState(null); // Status filter
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [counts, setCounts] = useState({ active: 0, processing: 0, sold: 0 }); // Counts for each status
  const [selectedProduct, setSelectedProduct] = useState(null); // Selected product for action
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State to control success modal visibility
  const [successMessage, setSuccessMessage] = useState(""); // State to store success message

  // Fetch product counts from backend
  const fetchCounts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/product/counts`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setCounts({
        all: data.allCount,
        active: data.activeCount,
        processing: data.processingCount,
        sold: data.soldCount,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted

    // Fetch products from backend
    const fetchProducts = async () => {
      setLoading(true); // Set loading when fetching new data
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/admin/product?page=${page}&status=${
            status || ""
          }&search=${searchQuery}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          setProducts([]); // Set products to empty array if no products found
        }

        const data = await response.json();

        if (isMounted) {
          setProducts(data.products); // Get all products
          setTotalPages(Math.ceil(data.totalProducts / limit)); // Calculate total pages
        }
      } catch (error) {
        setError(error.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        } // Set loading to false after fetching products
      }
    };

    fetchProducts();
    fetchCounts();

    return () => {
      isMounted = false; // Cleanup function to track if the component is unmounted
    };
  }, [page, status, searchQuery]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1); // Reset to first page when status changes
    setSearchQuery(""); //clear the search query to reset the previous search
  };

  // Handle search
  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      setSearchQuery(searchTerm);
      setSearchTerm(""); //clear search term
      setStatus(null); // Reset status filter
    }
  };

  // Handle opening the modal with the selected product
  const handleActionClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  // Handle closing the success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  // Handle activating a product
  const handleActivateProduct = async () => {
    if (selectedProduct) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/admin/product/activate/${selectedProduct._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          setProducts((prevProducts) =>
            prevProducts.map((product) =>
              product._id === selectedProduct._id
                ? { ...product, status: "active" }
                : product
            )
          );
          handleCloseModal();
          setSuccessMessage("Product activated successfully!");
          setShowSuccessModal(true);
          fetchCounts();
        } else {
          throw new Error("Failed to activate product");
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Handle deleting a product
  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/admin/product/delete/${selectedProduct._id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          setProducts((prevProducts) =>
            prevProducts.filter(
              (product) => product._id !== selectedProduct._id
            )
          );
          handleCloseModal();
          setSuccessMessage("Product deleted successfully!");
          setShowSuccessModal(true);
          fetchCounts();
        } else {
          throw new Error("Failed to delete product");
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  if (error) {
    return (
      <>
        <h1>Error: {error}</h1>
      </>
    );
  }

  if (loading) {
    return <Loading message="Loading..." />; // Show loading... while fetching data
  }

  return (
    <Container fluid className="product-dashboard p-4">
      {/* Status Cards */}
      <Row className="mb-4">
        <Col>
          <Card
            className="status-card text-center"
            onClick={() => handleStatusChange(null)}
          >
            <Card.Body>
              <Card.Title className="status-card-title">
                All Products
              </Card.Title>
              <Card.Text className="status-card-text fs-2">
                {counts.all}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card
            className="status-card text-center"
            onClick={() => handleStatusChange("active")}
          >
            <Card.Body>
              <Card.Title className="status-card-title">
                Active Products
              </Card.Title>
              <Card.Text className="status-card-text text-primary fs-2">
                {counts.active}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card
            className="status-card text-center"
            onClick={() => handleStatusChange("processing")}
          >
            <Card.Body>
              <Card.Title className="status-card-title">Processing</Card.Title>
              <Card.Text className="status-card-text text-success fs-2">
                {counts.processing}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card
            className="status-card text-center"
            onClick={() => handleStatusChange("sold")}
          >
            <Card.Body>
              <Card.Title className="status-card-title">Sold</Card.Title>
              <Card.Text
                className="status-card-text fs-2"
                style={{ color: "#F57C00" }}
              >
                {counts.sold}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Container></Container>

      {/* Search Bar */}
      <Row>
        <Col>
          <Container fluid className="search-bar-container d-flex">
            <FormControl
              className="search-input"
              placeholder="Search product id..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
            />
            <Button className="search-button" onClick={handleSearch}>
              <i className="fa-solid fa-magnifying-glass" />
            </Button>
          </Container>
        </Col>
      </Row>

      {/* Product Table */}
      {products && products.length > 0 ? (
        <Container fluid className="table-responsive p-0">
          <Table striped bordered hover className="product-table">
            <thead className="product-table-header">
              <tr>
                <th>Product Image</th>
                <th>Product Info</th>
                <th className="text-center">Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <Link to={`/product/detail/${product._id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                      />
                    </Link>
                  </td>
                  <td className="align-middle">
                    <div>
                      <b>Name:</b> {product.name}
                    </div>
                    <div>
                      <b>ID:</b> {product._id}
                    </div>
                  </td>
                  <td
                    className={`product-status ${
                      product.status === "processing"
                        ? "text-success"
                        : product.status === "active"
                        ? "text-primary"
                        : ""
                    }`}
                    style={
                      product.status === "sold" ? { color: "#F57C00" } : {}
                    }
                  >
                    {product.status}
                  </td>
                  <td className="text-center align-middle">
                    <Button
                      className="action-button"
                      onClick={() => handleActionClick(product)}
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
        <h3 className="mt-3">No products found</h3>
      )}
      {totalPages > 1 && (
        <Container className=" d-flex justify-content-center">
          <Pagination>
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === page}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </Container>
      )}

      {/* Action Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Product Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Product ID: {selectedProduct?._id}</p>
          <p>Status: {selectedProduct?.status}</p>
          {selectedProduct?.status === "processing" ? (
            <>
              <Button
                variant="success"
                className="me-2"
                onClick={handleActivateProduct}
              >
                Activate
              </Button>
              <Button variant="danger" onClick={handleDeleteProduct}>
                Delete
              </Button>
            </>
          ) : (
            <Button variant="danger" onClick={handleDeleteProduct}>
              Delete
            </Button>
          )}
        </Modal.Body>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{successMessage}</p>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminProductComp;
