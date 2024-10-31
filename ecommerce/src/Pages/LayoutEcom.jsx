import Header from "./Header";
import Footer from "./Footer";
import { CategoryProvider } from "../contexts/CategoryContext";
import { Outlet } from "react-router-dom";

const LayoutEcom = () => {
  return (
    <CategoryProvider>
      <Header />
      <Outlet />
      <Footer />
    </CategoryProvider>
  );
}

export default LayoutEcom