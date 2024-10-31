
import MainCategory from "./MainCategory.jsx";
import { useCategoryContext } from "../contexts/CategoryContext";
import { Navbar, Container } from "react-bootstrap";

// Updated PageLinks component to work with new data structure
const PageLinks = ({ }) => {
  const { categories } = useCategoryContext();

  return (
    <Navbar expand="lg" >
      <Container style={{ padding: "0px" }}>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ marginBottom: '10px' }} />
        <Navbar.Collapse id="basic-navbar-nav">
          <MainCategory categories={categories}/>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PageLinks;