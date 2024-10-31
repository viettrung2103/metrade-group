import { Row, Button, Col } from "react-bootstrap";
import coin from "../assets/star.png";
import "../Styles/CartItem.css";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";

const CardItem = ({
  cartItemId,
  productId,
  productName,
  image,
  pickup_point,
  price,
  stock_quantity,
  adding_quantity,
  subTotal,
  updateQuantity,
  deleteItem,
  isSelected,
  onSelectChange
}) => {
  const handdleQuantityButton = (change) => {
    updateQuantity(change);
  };

  const handdleDeleteButton = () => {
    deleteItem();
  };

  return (
    <Row className="cart-item-container">
      <Col className="image-name-pickup" xs={12} sm={12} md={6} lg={6}>
        <Row>
          <Col className="align-content-center" xs={1} sm={1}>
            <Form.Check
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectChange(cartItemId)}
            />
          </Col>
          <Col>
            <Link to={`/product/detail/${productId}`}>
              <div className="item-image">
                <img src={image} alt={productName} />
              </div>
            </Link>
          </Col>
          <Col>
            <div className="name-pickup">
              <div className="item-name">{productName}</div>
              <div
                className={`pick-up ${pickup_point}`}
              >{`Pick-up: ${pickup_point}`}</div>
              <div className="stock-number">{`Available in stock: ${stock_quantity}`}</div>
            </div>
          </Col>
        </Row>
      </Col>
      <Col className="p-3" xs={12} sm={12} md={6} lg={6}>
        <Row className="price-and-quantity">
          <Col className="align-content-center">
            <div className="item-price">
              <span>{price}</span>
              <img
                src={coin}
                alt="coin"
                style={{ width: "20px", height: "20px" }}
              />
            </div>  
          </Col>
          <Col className="align-content-center">
            <div className="quantity-container">
              <div
                className="quantity-btn"
                onClick={() => handdleQuantityButton(-1)}
              >
                <i className="fa-solid fa-minus"></i>
              </div>
              <span className="quantity-number">{adding_quantity}</span>
              <div
                className="quantity-btn"
                onClick={() => handdleQuantityButton(+1)}
              >
                <i className="fa-solid fa-plus"></i>
              </div>
            </div>
          </Col>
          <Col className="align-content-center">
            <div className="price-tag">
              <span>{subTotal}</span>
              <img
                src={coin}
                alt="coin"
                style={{ width: "20px", height: "20px" }}
              />
            </div>
          </Col>
          <Col className="align-content-center">
            <div
              className="delete-item-button"
              onClick={() => handdleDeleteButton()}
            >
              <i className="fa-regular fa-trash-can"></i>
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default CardItem;
