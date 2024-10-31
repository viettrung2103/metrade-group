import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import style from "../Styles/SearchBar.module.css";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); 

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      //Navigate to results page with search term as query parameter
      navigate(`/search-results?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  //Search when Enter key is pressed
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(); 
    }
  };

  return (
    <div className={style.searchContainer}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder="  Search for products by keyword..."
        className={style.searchBar}
      />
      <button onClick={handleSearch} className={style.searchButton}>
        <i className="fa-solid fa-magnifying-glass" />
      </button>
    </div>
  );
};

export default SearchBar;
