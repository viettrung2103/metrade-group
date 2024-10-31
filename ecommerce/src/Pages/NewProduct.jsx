import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../Styles/MyPage.css";
import ProductUpload from "../Components/ProductUpload";
import { useAuthContext } from "../hooks/useAuthContext";
import SideBar from "../Components/SideBar";

const NewProduct = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        //if user is not authenticated, navigate to login
        navigate("/login");
      } else if (user?.role !== "seller") {
        //if user authenticated but not an seller, navigate to homepage
        navigate("/");
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <Container>
      <SideBar pageName="My Page">
        <ProductUpload />
      </SideBar>
    </Container>
  );
};

export default NewProduct;
