import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import ProductCard from "../Components/ProductCard";
import style from "../Styles/Newsfeed.module.css"; //Same styling as Newsfeed
import Loading from "../Components/Loading";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query"); //Extract search term from query parameter
  const [searchResults, setSearchResults] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(8); //Keep track of the number of products to display
  const [loading, setLoading] = useState(true); //Loading state
  const [error, setError] = useState(null); //Error state

  //Filter products based on the search query
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query) {
        setLoading(true); //set loading when fetching new data
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/product/search?query=${query}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          ); //fetch search results from backend

          const data = await response.json();
          setSearchResults(data);
        } catch (error) {
          console.error("Error fetching search results:", error.message); //browser shows
          setError(error.message); //set error message
        } finally {
          setLoading(false); //set loading to false after fetching search results
        }
      }
    };

    fetchSearchResults();
  }, [query]);

  //Load more products when "Load more" button is clicked
  const loadMoreProducts = () => {
    setVisibleProducts(visibleProducts + 8);
  };

  if (error) {
    return (
      <>
        <h1 className={style.error}>Error: {error}</h1>
        <Container style={{ height: "200px" }}></Container>
      </>
    );
  }

  if (loading) {
    return <Loading message="Loading..." />; //show loading... while fetching data
  }

  return (
    <>
      <Container fluid className={style.newfeed}>
        <Container>
          <h2>Search Results for "{query}"</h2>
        </Container>
        <Container>
          {searchResults.length > 0 ? (
            <Row sm={2} md={3} lg={4} className="g-4">
              {searchResults.slice(0, visibleProducts).map((product) => (
                <Col key={product._id}>
                  <ProductCard {...product} />
                </Col>
              ))}
            </Row>
          ) : (
            <>
              <p>No products found matching "{query}".</p>
              {/* Display empty container to fill out the screen */}
              <Container style={{ height: "200px" }}></Container>
            </>
          )}
        </Container>
        <Container className="d-flex justify-content-center">
          {/*Only show "Load More" button if there are more than 8 products to show*/}
          {visibleProducts < searchResults.length && (
            <Button
              variant="primary"
              className="mt-4"
              onClick={loadMoreProducts}
            >
              Load more...
            </Button>
          )}
        </Container>
      </Container>
    </>
  );
};

export default SearchResults;
