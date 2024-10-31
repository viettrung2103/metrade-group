import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../Styles/MyPage.css";
import { useAuthContext } from "../hooks/useAuthContext";
import AdminSideBar from "../Components/AdminSideBar";
import AdminUserComp from "../Components/AdminUserComp";

const AdminUser = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        //if user is not authenticated, navigate to login
        navigate("/login");
      } else if (user?.role !== "admin") {
        //if user authenticated but not an admin, navigate to homepage
        navigate("/");
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <Container>
      <AdminSideBar pageName="Admin Dashboard">
        <AdminUserComp />
      </AdminSideBar>
    </Container>
  );
};

export default AdminUser;
