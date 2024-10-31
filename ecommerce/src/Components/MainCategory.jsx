import React from 'react';
import CategoryItem from './CategoryItem.jsx';

const MainCategory = ({ categories }) => {
  return (
    <ul className="navbar-nav">
      {categories.map((category) => (
        <CategoryItem key={category._id} category={category} level={1}/>
      ))}
    </ul>
  );
};

export default MainCategory;