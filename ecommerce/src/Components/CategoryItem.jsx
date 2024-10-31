import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryItem = ({ category, level }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = Array.isArray(category.children) && category.children.length > 0;
  const navigate = useNavigate();

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  const handleNavigation = (id) => {
    navigate(`/category?query=${id}`);
  };

  return (
    <li className={`nav-item dropdown ${level > 1 ? 'dropdown-submenu d-none d-lg-block' : ''}`} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
    >
      <a
        className={`nav-link ${hasChildren ? 'dropdown-toggle' : ''}`}
        href="#"
        onClick={() => handleNavigation(category._id)}
      >
        {category.name}
      </a>

      {/* Check if category has children and render them recursively */}
      {open && hasChildren && (
        <ul className="dropdown-menu show">
          {category.children.map((child) => (
            <CategoryItem key={child._id} category={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CategoryItem;