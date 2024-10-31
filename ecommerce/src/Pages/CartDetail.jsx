import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import CartInfo from "../Components/CartInfo";
import { useAuthContext } from "../hooks/useAuthContext";

const CartDetail = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      navigate("/login");
    }
  }, [isAuthenticated(), isLoading, navigate]);


return (
  <Container>
    <CartInfo/>
  </Container>
)
};

export default CartDetail;