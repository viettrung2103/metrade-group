import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../Styles/MyPage.css";
import AccountInfo from "../Components/AccountInfo";
import { useAuthContext } from "../hooks/useAuthContext";
import SideBar from "../Components/SideBar";

const MyPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      navigate("/login");
    }
  }, [isAuthenticated(), isLoading, navigate]);
  
  return (
    <Container>
      <SideBar pageName="My Page">
        <AccountInfo />
      </SideBar>
    </Container>
  );
};

export default MyPage;
