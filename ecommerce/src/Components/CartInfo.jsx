import CartItem from "../Components/CartItem";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Loading from "../Components/Loading";
import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import "../Styles/CartDetail.css";
import coin from "../assets/star.png";
import { useAuthContext } from "../hooks/useAuthContext";

const CartDetail = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [updatedCartItem, setUpdatedCartItem] = useState(null);
  const [totalCartItems, setTotalCartItems] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalOrderItems, setTotalOrderItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showCheckoutModal, setshowCheckoutModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(false);
  const [error, setError] = useState(null);
  const { cartCount, setCartCount, setReloadCartCount, user, updateUser } =
    useAuthContext();

  // Calculate total items in the cart
  const calculateTotalCartItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.adding_quantity, 0);
  }, [cartItems]);

  // Calculate total items in the order
  const calculateTotalOrderItems = (itemsToCheckout) => {
    return itemsToCheckout.reduce(
      (total, item) => total + item.adding_quantity,
      0
    );
  };

  // Calculate total price of the order
  const calculateTotalOrderPrice = (itemsToCheckout) => {
    return itemsToCheckout.reduce((total, item) => total + item.sub_total, 0);
  };

  // Function to fetch the detail information of the cart
  const fetchCartDetail = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cart/get-cart-detail`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        const cartDetailItems = data.cart_detail.cart_items || [];

        setCartItems(cartDetailItems);
        setCart(data.cart_detail);

        const cartCount = cartDetailItems.reduce(
          (acc, item) => acc + item.adding_quantity,
          0
        );
        setCartCount(cartCount);
      }
    } catch (error) {
      console.log("Error fetching product", error);
    }
  }, []);

  // Recalculate total cart items whenever cartItems change
  useEffect(() => {
    setTotalCartItems(calculateTotalCartItems());
  }, [cartItems, calculateTotalCartItems, updatedCartItem]);

  // Call fetchCartDetail on component mount or when the cart is updated
  useEffect(() => {
    fetchCartDetail();
  }, [updatedCartItem, fetchCartDetail]);

  // Function to update quantity of each cart item
  const fetchUpdateQuantity = async (cartItemId, quantity) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cart/update-quantity`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart_item: {
              id: cartItemId,
              quantity: quantity,
            },
          }),
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        const newCartItem = data.cart_item;
        setUpdatedCartItem(newCartItem);

        setCartCount(cartCount + quantity);
      }
    } catch (error) {
      console.log("Error updating cart item", error);
    }
  };

  const handleUpdateQuantity = useCallback((cartItemId, quantity) => {
    fetchUpdateQuantity(cartItemId, quantity);
  }, []);

  // Function to delete a cart item
  const deleteItem = async (cartItemId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cart/delete-cart-item/${cartItemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        const newCartItems = cartItems.filter(
          (item) => item._id.toString() != data.deleted_item._id.toString()
        );
        const newSelectedItems = selectedItems.filter(
          (id) => id !== data.deleted_item._id
        );
        setUpdatedCartItem(data.deleted_item);
        setReloadCartCount(true);
        setCartItems(newCartItems);
        setSelectedItems(newSelectedItems);
        console.log(selectedItems);
      }
    } catch (error) {
      console.log("Error deleting cart item", error);
    }
  };

  // Handle quantity button click
  const handleDeleteItem = useCallback((cartItemId) => {
    deleteItem(cartItemId);
  }, []);

  // Handle checkbox selection for checkout
  const handleSelectChange = useCallback((cartItemId) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = prevSelectedItems.includes(cartItemId)
        ? prevSelectedItems.filter((id) => id !== cartItemId)
        : [...prevSelectedItems, cartItemId];
      return updatedSelectedItems;
    });
  }, []);

  // Recalculate total checked items whenever selectedItems change
  useEffect(() => {
    const itemsToCheckout = cartItems.filter((item) =>
      selectedItems.includes(item._id)
    );

    if (itemsToCheckout.length > 0) {
      setTotalOrderItems(calculateTotalOrderItems(itemsToCheckout));
      setTotalPrice(calculateTotalOrderPrice(itemsToCheckout));
    } else {
      setTotalOrderItems(0);
      setTotalPrice(0);
    }
  }, [cartItems, selectedItems]);

  // Handle checkout button click
  const handleCheckout = () => {
    if (!user.is_verified) {
      setshowCheckoutModal(false);
      setShowVerifyModal(true);
      return;
    }
    setshowCheckoutModal(true);
  };

  //Function to checkout
  const checkoutOrder = async (checkoutItems) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cart/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkout: {
              order_items: checkoutItems,
              total_items: totalOrderItems,
              total_price: totalPrice,
            },
          }),
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUpdatedCartItem(data.order);
        fetchCartDetail();
        setReloadCartCount(true);
        updateUser(data.user);
        setCheckoutResult(true);
        setShowResultModal(true);
      } else if (response.status === 402) {
        setShowInsufficientModal(true);
      } else if (response.status === 422) {
        const data = await response.json();
        setUpdatedCartItem(data.updatedCart);
        fetchCartDetail();
        setError(data.message);
        setShowResultModal(true);
      }
      else {
        const data = await response.json();
        setError(data.message);
        setShowResultModal(true);
      }
    } catch (error) {
      console.log("Error checkout", error);
    }
  };

  // Confirm checkout
  const confirmCheckout = () => {
    const itemsToCheckout = cartItems.filter((item) =>
      selectedItems.includes(item._id)
    );

    checkoutOrder(itemsToCheckout);
    setshowCheckoutModal(false); // Close the modal after confirming
  };

  return !cart || !user ? (
    <Loading />
  ) : (
    <Container className="cart-detail-page">
      <Row className="cart-header">
        <div className="go-back-button-container">
          <button
            type="button"
            className="go-back-button"
            onClick={() => navigate(-1)}
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Continue Shopping</span>
          </button>
        </div>
        <h2 className="page-name">SHOPPING CART</h2>
        <div className="cart-summary">
          <div className="cart-total">
            <span>You have</span>
            <span className="total-item">{`${totalCartItems} ${
              totalCartItems >= 2 ? "items" : "item"
            } in your cart `}</span>
          </div>
        </div>
      </Row>

      <Row className="cart-body">
        {cartItems.map((item) => (
          <CartItem
            key={item._id}
            cartItemId={item._id}
            productId={item.product_id._id}
            productName={item.product_id.name}
            image={item.product_id.image}
            pickup_point={item.product_id.pickup_point}
            price={item.product_id.price}
            stock_quantity={item.product_id.stock_quantity}
            adding_quantity={item.adding_quantity}
            subTotal={item.sub_total}
            updateQuantity={(quantity) =>
              handleUpdateQuantity(item._id, quantity)
            }
            deleteItem={() => handleDeleteItem(item._id)}
            isSelected={selectedItems.includes(item._id)}
            onSelectChange={handleSelectChange}
          />
        ))}
      </Row>
      {cartItems.length !== 0 && (
        <Row className="cart-footer-container align-items-center">
          <Col xs={12} sm={12} md={8} lg={8}>
            <div className="footer-content">
              <div className="order-total">
                <span>Order Total</span>
                <span className="total-item">{`(${totalOrderItems} ${
                  totalOrderItems >= 2 ? "items" : "item"
                }): `}</span>
              </div>
              <div className="total-price">
                <span>{totalPrice}</span>
                <img
                  src={coin}
                  alt="coin"
                  style={{ width: "25px", height: "25px" }}
                />
              </div>
            </div>
          </Col>
          <Col xs={12} sm={12} md={4} lg={4}>
            <div className="checkout-button-container">
              <button
                className="checkout-button"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
              >
                Pay Now
              </button>
            </div>
          </Col>
        </Row>
      )}
      {/* {Checkout Modal} */}
      <Modal
        className="cart-modal-container"
        show={showCheckoutModal}
        onHide={() => setshowCheckoutModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title className="title">Confirm Checkout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="ask-confirm">Are you ready to checkout?</div>
          <div className="order-items">
            <span className="tag">Total Items:</span>
            <span className="number">{totalOrderItems}</span>
          </div>
          <div className="total-order-price">
            <span className="tag">Total Price:</span>
            <span className="number">{totalPrice}</span>
            <img
              src={coin}
              alt="coin"
              style={{ width: "25px", height: "25px" }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="cancel-button"
            variant="secondary"
            onClick={() => setshowCheckoutModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="confirm-button"
            variant="primary"
            onClick={() => confirmCheckout()}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      {/* {Email Verification Modal} */}
      <Modal
        className="cart-modal-container"
        show={showVerifyModal}
        onHide={() => setShowVerifyModal(false)}
      >
        <Modal.Header>
          <Modal.Title className="title">Verify Your Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="notification-container">
            <div className="notification">
              You must verify your email before proceeding to checkout.
            </div>
            <div></div>
          </div>
        </Modal.Body>
        <Modal.Footer className="button-container">
          <Button
            className="cancel-button"
            variant="secondary"
            onClick={() => setShowVerifyModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="navigate-button"
            variant="primary"
            onClick={() => navigate("/my-page")}
          >
            Go to My profile
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Insufficient Balance Modal */}
      <Modal
        className="cart-modal-container"
        show={showInsufficientModal}
        onHide={() => setShowInsufficientModal(false)}
      >
        <Modal.Header>
          <Modal.Title className="title">Insufficient Coins</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="notification">
            You do not have enough balance to complete the checkout. Please add
            more MetCoins
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="cancel-button"
            variant="secondary"
            onClick={() => setShowInsufficientModal(false)}
          >
            Close
          </Button>
          <Button className="navigate-button" variant="primary">
            Add MetCoins
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Checkout result Modal */}
      <Modal
        className="cart-modal-container"
        show={showResultModal}
        onHide={() => setShowResultModal(false)}
      >
        <Modal.Header>
          <Modal.Title className="title">
            {checkoutResult ? `Successful Checkout` : `Checkout failed`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="notification">
            {checkoutResult
              ? `Your order has been successfully placed. You can check your order in My Purchase History.`
              : `${error}. Your order could not be placed. Please try again.`}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="cancel-button"
            variant="secondary"
            onClick={() => setShowResultModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CartDetail;
