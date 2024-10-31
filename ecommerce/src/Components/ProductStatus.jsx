import { Card, Button, Badge } from "react-bootstrap";
import coin from "../assets/star.png";
import clock from "../assets/clock.png";
import locImg from "../assets/location.png";
import style from "../Styles/ProductStatus.module.css";
import {useNavigate} from 'react-router-dom';

const ProductStatus = ({ _id, name, image, pickup_point, price, created_at, status }) => {
  //calculate days since creation
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(created_at)) / (1000 * 60 * 60 * 24)
  );

    const getBadgeVariant = (status) => {
    switch (status) {
        case 'active':
            return 'success'; // green
        case 'processing':
            return 'warning'; // yellow
        case 'sold':
            return 'danger'; // red
        default:
            return 'primary'; // default color
    }}

    const navigate = useNavigate();
    const handleEdit = () => {
        navigate(`/product/edit/${_id}`); }


  return (
    <Card className={style.productStatus}>
      <Card.Img
        variant="top"
        src={image}
        className={style.productImg}
        alt={name}
      />
      <Card.Body>
        <Card.Title className="fw-bold" style={{ color: "#173b45" }}>
          {name}
        </Card.Title>
        <div className={style.productInfo}>
          <div className="d-flex align-items-center">
            <img
              src={coin}
              alt="coin"
              style={{ width: "20px", height: "20px" }}
            />
            <Card.Text>{price}</Card.Text>
          </div>
          <div className="d-flex align-items-center">
            <img
              src={clock}
              alt="clock"
              style={{ width: "20px", height: "20px" }}
            />
            <Card.Text>{daysSinceCreation} days ago</Card.Text>
          </div>
          <div className="d-flex align-items-center">
            <img
              src={locImg}
              alt="location"
              style={{ width: "20px", height: "20px" }}
            />
            <Card.Text>{pickup_point}</Card.Text>
          </div>
        </div>
        <Button variant="primary" className={style.editBtn} onClick = {handleEdit}>
          Edit
          <i className="fas fa-edit"></i>
        </Button>
        <div className={style.statusBadgeBox}>
          <Badge bg={getBadgeVariant(status)} className="statusBadge">
            {status}{" "}
          </Badge>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductStatus;
