import { Card, Button } from "react-bootstrap";
import coin from "../assets/star.png";
import clock from "../assets/clock.png";
import locImg from "../assets/location.png";
import style from "../Styles/ProductCard.module.css";
import { Link } from "react-router-dom";

const ProductCard = ({ _id, name, image, pickup_point, price, created_at }) => {
  //calculate days since creation
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(created_at)) / (1000 * 60 * 60 * 24)
  );
  // Determine text color based on pickup_point
  const getPickupPointColor = (pickup_point) => {
    switch (pickup_point) {
      case "Myyrmäki":
        return "#009e54";
      case "Myllypuro":
        return "#ee0017";
      case "Karamalmi":
        return "#e67300";
    }
  };
  return (
    <Card className={style.productCard}>
      <Link to={`/product/detail/${_id}`}>
        <Card.Img
          variant="top"
          src={image}
          className={style.productImg}
          alt={name}
        />
      </Link>
      <Card.Body>
        <Card.Title className="fw-bold" style={{ color: "#173b45" }}>
          {name}
        </Card.Title>
        <div className="d-flex align-items-center">
          <img
            src={coin}
            alt="coin"
            style={{ width: "20px", height: "20px" }}
          />
          <Card.Text style={{ fontWeight: "600" }}>{price}</Card.Text>
        </div>
        <div className="d-flex align-items-center">
          <img
            src={clock}
            alt="clock"
            style={{ width: "20px", height: "20px" }}
          />
          <Card.Text style={{ fontWeight: "600" }}>
            {daysSinceCreation} days ago
          </Card.Text>
        </div>
        <div className="d-flex align-items-center">
          <img
            src={locImg}
            alt="location"
            style={{ width: "20px", height: "20px" }}
          />
          <Card.Text
            style={{
              color: getPickupPointColor(pickup_point),
              fontWeight: "600",
            }}
          >
            {pickup_point}
          </Card.Text>
        </div>
        <div className="d-flex justify-content-end">
          <Button variant="primary" hidden>
            Edit
          </Button>
          <Link to={`/product/detail/${_id}`}>
            <Button variant="primary">See more...</Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
