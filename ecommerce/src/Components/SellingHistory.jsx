import ProductStatus from "./ProductStatus.jsx";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext.jsx";
import ProfileImage from '../assets/profile-default-image.png';
import '../Styles/SellingHistory.css';
import coin from "../assets/star.png";

const SellingHistory = () => {
    const [allProductsFetched, setAllProductsFetched] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [userAvatar, setUserAvatar] = useState(ProfileImage);
    const { user } = useAuthContext();


    useEffect(() => {
        // Fetch products from backend
        if (user?._id) {
            const fetchProducts = async () => {
            try {
                const response = await fetch(
                `${process.env.REACT_APP_API_URL}/seller/selling-page/inventory/${user._id}`,
                {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
                );
                const data = await response.json();
                setAllProductsFetched(data);
                setFilteredProducts(data);
                setUserAvatar(user.photo_url ? `${process.env.REACT_APP_API_PUBLIC_URL}/${user.photo_url}` : ProfileImage);

                
            } catch (error) {
                console.error('Error fetching products:', error);
            }
          };
          fetchProducts();
        }

  }, [user]);

    function handleClickAll() {
        setFilteredProducts(allProductsFetched);     
    }    
    
    function handleClickActive() {
        setFilteredProducts(allProductsFetched.filter(product => product.status === 'active'));
    }    
    function handleClickProcessing() {
        setFilteredProducts(allProductsFetched.filter(product => product.status === 'processing'));
    }

    function handleClickSold() {
        setFilteredProducts(allProductsFetched.filter(product => product.status === 'sold'));
    }


    return (
    <>
      <Container>
        <Row>
            <Col>
                <div className="profileDetails d-flex flex-column" >
                  <div className="profileImgContainer">
                    <div className="profileImg">
                      <img src={userAvatar} alt="Profile" className="sellerImg sameFontSize" />
                    </div>
                      <h2>{user?.first_name} {user?.last_name[0]}</h2>
                  </div>

                  <div className="d-flex align-items-center">
                    <h3 style={{margin: 0}}>BALANCE: {user?.balance}</h3>
                    <img
                        src={coin}
                        alt="coin"
                        style={{ width: "20px", height: "20px" }}
                        />
                  </div>
                    <h3>{filteredProducts.length} items</h3>
                </div>
            </Col>
            <Col>
                <Container className="buttons">
                  <Button className="btnSort" onClick={handleClickAll}>All</Button>
                  <Button className="btnSort" onClick={handleClickActive}>Active</Button>
                  <Button className="btnSort" onClick={handleClickProcessing}>Processing</Button>
                  <Button className="btnSort" onClick={handleClickSold}>Sold</Button>
                </Container>
            </Col>
        </Row>
      </Container>

      <Container>
        {filteredProducts.length > 0 ? (
          <Row sm={2} md={3} lg={4} className="g-4">
            {filteredProducts.map((product) => (
              <Col key={product._id}>
                <ProductStatus {...product} />
              </Col>
            ))}
          </Row>
        ) : (
          <p>No products found</p>
        )}
      </Container>
    </>
    );
}

export default SellingHistory;