import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import SellingHistory from "../Components/SellingHistory";

const MySellingHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
        if (!isAuthenticated()) {
            navigate("/login");
        } else if (user?.role !== 'seller') {
            navigate("/");
        }
    }
    
  }, [isAuthenticated(), isLoading, user, navigate]);
  

  return (
    <SellingHistory />
  );

};

export default MySellingHistory;
