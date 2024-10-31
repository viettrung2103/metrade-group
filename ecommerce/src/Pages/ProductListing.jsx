import { Container, Row, Col } from 'react-bootstrap';
import { useSearchParams, useNavigate} from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProductCard from '../Components/ProductCard';
import style from "../Styles/ProductListing.module.css"

const ProductListing = ({}) => {
  const [searchParams] = useSearchParams();
  const category_id = searchParams.get('query'); 
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Fetch products from backend
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/categories/get-children-categories/${category_id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        setFilteredProducts(data);
        //console.log('Filtered products changed to:', data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [category_id]);


  return (
    <>
      <Container className={`${style.resultTextContainer}`}>
        <h2 className={`${style.resultText}`}>Search Results</h2>
      </Container>
      <Container>
        {filteredProducts.length > 0 ? (
          <Row sm={2} md={3} lg={4} className="g-4">
            {filteredProducts.map((product) => (
              <Col key={product._id}>
                <ProductCard {...product} />
              </Col>
            ))}
          </Row>
        ) : (
          <p>No products found</p>
        )}
      </Container>
    </>
  );
};

export default ProductListing;