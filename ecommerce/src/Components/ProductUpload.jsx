import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useCategoryContext } from "../contexts/CategoryContext";
import {SuccessModal, FailureModal, LoadingModal} from "./ProductUploadStatus";
import { Form, Button, InputGroup, Dropdown, DropdownButton, Alert, } from "react-bootstrap";
import "../Styles/ProductUpload.css";
import Pica from "pica";
import coin from "../assets/star.png";

const ProductUpload = () => {
  const { user } = useAuthContext();
  const { categories } = useCategoryContext();
  const pica = Pica(); //use pica for image resizing cause cloudinary has a 10MB limit for free plan
  const alertRef = useRef(null); //reference to alert component for scrolling

  //Form state to track product details
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    quantity: 1,
    pickUpPoint: "Choose a pick-up point",
    keywords: "",
  });

  //States to track selected categories
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState(null);

  //States to track and alert validation errors
  const [errors, setErrors] = useState([]); //State for validation errors
  const [showAlert, setShowAlert] = useState(false); //State for showing alert

  //States to track photos and preview
  const [selectedFiles, setSelectedFiles] = useState([]); //state to store photos
  const [previewUrls, setPreviewUrls] = useState([]); //state to store preview before uploading

  //States for uploading status modals
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  //Handle changes in product's name, description, price, keywords
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  //Functions to handle chosen category dropdown
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setSelectedSubSubCategory(null);
  };
  const handleSubCategoryChange = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setSelectedSubSubCategory(null);
  };
  const handleSubSubCategoryChange = (subSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
  };

  //Handle pick-up point
  const handlePickupChange = (point) => () => {
    setForm((prev) => ({ ...prev, pickUpPoint: point }));
  };

  //Handle quantity
  const handleQuantityChange = (type) => {
    setForm((prev) => ({
      ...prev,
      quantity:
        type === "increase"
          ? prev.quantity + 1
          : Math.max(prev.quantity - 1, 1),
    }));
  };

  //Handle uploading images
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 4) {
      alert("You can only upload up to 4 images"); //alert if more than 4 images

      return;
    }
    const resizedFiles = await Promise.all(
      files.map((file) => resizeImage(file))
    ); //resize images if larger than 10MB

    setSelectedFiles((prevFiles) => [...prevFiles, ...resizedFiles]); //add new photo to array

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prevUrls) => [...prevUrls, ...urls]); //add preview
  };

  //Handle resizing images
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size <= 10 * 1024 * 1024) {
        // If the file size is already under 10MB, resolve immediately
        resolve(file);
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDimension = 800;
        const scale = Math.min(
          maxDimension / img.width,
          maxDimension / img.height
        );
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const resizeAndCompress = (quality) => {
          pica
            .resize(img, canvas)
            .then((result) => pica.toBlob(result, "image/jpeg", quality))
            .then((blob) => {
              if (blob.size <= 10 * 1024 * 1024) {
                // Check if the size is less than or equal to 10MB
                console.log(`Resized image size: ${blob.size} bytes`); // Log the size of the resized image
                const resizedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                });
                resolve(resizedFile);
              } else if (quality > 0.1) {
                // Reduce quality and try again if the size exceeds 10MB
                resizeAndCompress(quality - 0.1);
              } else {
                reject(new Error("Unable to resize image to be under 10MB"));
              }
            })
            .catch((error) => reject(error));
        };

        resizeAndCompress(0.8); // Start with 80% quality
      };
    });
  };

  //Handle removing images
  const handleRemoveImage = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  // Validate form fields before uploading
  const validateForm = () => {
    const newErrors = [];

    if (selectedFiles.length === 0)
          newErrors.push("At least one image is required"); //validate image
    if (!form.name) newErrors.push("Product name is required"); //validate name
    if (!form.description) newErrors.push("Description is required"); //validate description
    //Validate the smallest category ID is selected
    if (
      !selectedSubSubCategory &&
      selectedCategory &&
      selectedSubCategory &&
      selectedSubCategory.name === "Clothes"
    ) {
      newErrors.push("You must select the smallest category available");
    } else if (!selectedSubCategory && selectedCategory) {
      newErrors.push("You must select a sub category");
    } else if (!selectedCategory) {
      newErrors.push("You must select a category");
    }
    if (!form.price || form.price <= 0)
      newErrors.push("Price must be greater than 0"); //validate price
    if (!form.pickUpPoint || form.pickUpPoint === "Choose a pick-up point")
      newErrors.push("Pick-up point is required"); //validate pick-up point

    setErrors(newErrors);
    setShowAlert(newErrors.length > 0); //alert if there are errors
    return newErrors.length === 0;
  };

  //Scroll to alert if there are errors
  useEffect(() => {
    if (errors.length > 0 && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [errors]);

  //Function to upload product to database
  const uploadProduct = async () => {
    if (!validateForm()) {return;}// Stop if any missing details and scroll up to Alert component
    setShowLoading(true); //Show loading modal

    //get smallest category id
    const categoryId =
      selectedSubSubCategory?._id ||
      selectedSubCategory?._id ||
      selectedCategory?._id;

    try {
      const formData = new FormData(); //form data to send photos to backend for upload to cloudinary
      for (const file of selectedFiles) {
        formData.append("files", file);
      }
      //Upload images to cloudinary
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/seller/imageUpload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Can not upload images");
      }
      const data = await response.json();
      const { urls } = data; //retrieve image urls after successful upload
      const image = urls[0]; //set main image as first image
      const photos = urls; //save photos' urls to send to database

      //Create product object
      const product = {
        user_id: user._id,
        name: form.name,
        image: image,
        photos: photos,
        description: form.description,
        price: form.price,
        pickup_point: form.pickUpPoint,
        category_id: categoryId,
        stock_quantity: form.quantity,
        keywords: form.keywords.split(","),
      };

      //Upload product to database
      const productResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/seller/upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(product),
        }
      );
      if (!productResponse.ok) throw new Error("Can not upload product");
      const productData = await productResponse.json();
      console.log("Product uploaded successfully:", productData);
      setShowLoading(false);
      setShowSuccess(true);
    } catch (error) {
      console.log("Error uploading product:", error);
      setShowLoading(false);
      setShowFailure(true);
    }
  };
  return (
    <Form className="uploadForm">
      <h3>Sell your product</h3>

      {/* Show missing fields */}
      {errors.length > 0 && showAlert && (
        <Alert
          ref={alertRef}
          variant="danger"
          onClose={() => setShowAlert(false)}
          dismissible
        >
          <ul>
            {errors.map((error, index) => (
              <li key={index}>
                <span className="me-2">❌</span> {error}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Image Upload */}
      <Form.Group className="mb-3 text-center" controlId="formFileMultiple">
        <Form.Label
          className="d-block border border-secondary p-3 rounded"
          style={{ cursor: "pointer", borderStyle: "dashed" }}
        >
          Add photos (up to 4)
          {/* Image Previews */}
          <div>
            {previewUrls.map((url, index) => (
              <div
                key={index}
                style={{
                  display: "inline-block",
                  position: "relative",
                  margin: "10px",
                }}
              >
                <img
                  src={url}
                  alt={`Preview ${index}`}
                  style={{ width: "100px", height: "100px", objectFit: "cover", }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    color: "red",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </Form.Label>
        <Form.Control type="file" multiple hidden onChange={handleFileChange} />
      </Form.Group>

      {/* Product Name */}
      <Form.Group className="mb-3" controlId="name">
        <Form.Label>Product name</Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g. Marvel themed backpack"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="textInput"
        />
      </Form.Group>

      {/* Description */}
      <Form.Group className="mb-3" controlId="description">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="e.g. Featuring bold designs of your favorite Marvel characters..."
          name="description"
          value={form.description}
          onChange={handleChange}
          className="textInput"
        />
      </Form.Group>

      {/* Category Dropdowns */}
      <Form.Group className="mb-3" controlId="category">
        <Form.Label>Category</Form.Label>
        <DropdownButton
          id="dropdown-category"
          title={selectedCategory ? selectedCategory.name : "Select a category"}
        >
          {categories.map((category) => (
            <Dropdown.Item
              key={category._id}
              onClick={() => handleCategoryChange(category)}
            >
              {category.name}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </Form.Group>

      {selectedCategory?.children?.length > 0 && (
        <Form.Group className="mb-3" controlId="subCategory">
          <Form.Label>Sub-category</Form.Label>
          <DropdownButton
            id="dropdown-sub-category"
            title={
              selectedSubCategory
                ? selectedSubCategory.name
                : "Select a sub-category"
            }
          >
            {selectedCategory.children.map((subCategory) => (
              <Dropdown.Item
                key={subCategory._id}
                onClick={() => handleSubCategoryChange(subCategory)}
              >
                {subCategory.name}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Form.Group>
      )}

      {selectedSubCategory?.children?.length > 0 && (
        <Form.Group className="mb-3" controlId="subSubCategory">
          <Form.Label>Sub-sub-category</Form.Label>
          <DropdownButton
            id="dropdown-sub-sub-category"
            title={
              selectedSubSubCategory
                ? selectedSubSubCategory.name
                : "Select a sub-sub-category"
            }
          >
            {selectedSubCategory.children.map((subSubCategory) => (
              <Dropdown.Item
                key={subSubCategory._id}
                onClick={() => handleSubSubCategoryChange(subSubCategory)}
              >
                {subSubCategory.name}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Form.Group>
      )}

      {/* Keywords */}
      <Form.Group className="mb-3" controlId="keywords">
        <Form.Label>Keywords</Form.Label>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="e.g. fashion, style, healthcare, vintage"
            name="keywords"
            value={form.keywords}
            onChange={handleChange}
            className="textInput"
          />
        </InputGroup>
      </Form.Group>

      {/* Price */}
      <Form.Group className="mb-3" controlId="price">
        <Form.Label>Price</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <img src={coin} style={{ height: "20px" }} />
          </InputGroup.Text>
          <Form.Control
            type="number"
            placeholder="0,00"
            name="price"
            value={form.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="textInput"
          />
        </InputGroup>
      </Form.Group>

      {/* Pick-up Point */}
      <Form.Group className="mb-3" controlId="pickUpPoint">
        <Form.Label>Pick-up point</Form.Label>
        <DropdownButton id="dropdown-pickup-point" title={form.pickUpPoint}>
          {["Myyrmäki", "Myllypuro", "Karamalmi"].map((point) => (
            <Dropdown.Item key={point} onClick={handlePickupChange(point)}>
              {point}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </Form.Group>

      {/* Quantity */}
      <Form.Group className="mb-3" controlId="quantity">
        <Form.Label>Quantity</Form.Label>
        <InputGroup className="quantityInput">
          <Button
            className="quantityBtn"
            onClick={() => handleQuantityChange("decrease")}
          >
            -
          </Button>
          <Form.Control type="text" value={form.quantity} readOnly />
          <Button
            className="quantityBtn"
            onClick={() => handleQuantityChange("increase")}
          >
            +
          </Button>
        </InputGroup>
      </Form.Group>

      {/* Actions */}
      <div className="d-flex justify-content-end">
        <Button href="/new-product" className="cancelBtn">
          Cancel
        </Button>
        <Button onClick={uploadProduct} className="sellBtn">
          Sell now
        </Button>
      </div>

      {/* Status Modal */}
      <LoadingModal show={showLoading} />
      <SuccessModal show={showSuccess} />
      <FailureModal show={showFailure} />
    </Form>
  );
};

export default ProductUpload;
