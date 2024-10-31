import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../Styles/MyPage.css";
import OrderHistory from "../Components/OrderHistory";
import { useAuthContext } from "../hooks/useAuthContext";
import SideBar from "../Components/SideBar";

const PurchaseHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Container>
      <SideBar pageName="My Page">
        <OrderHistory />
      </SideBar>
    </Container>
  );
};

export default PurchaseHistory;
