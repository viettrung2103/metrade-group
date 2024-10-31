import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useCategoryContext } from "../contexts/CategoryContext";
import {
  SuccessModal,
  FailureModal,
  LoadingModal,
} from "../Components/ProductEditStatus";
import {
  Form,
  Button,
  InputGroup,
  Dropdown,
  DropdownButton,
  Alert,
} from "react-bootstrap";
import "../Styles/ProductEdit.css";
import Pica from "pica";
import coin from "../assets/star.png"

const ProductEdit = () => {
  const { user } = useAuthContext();
  const { categories } = useCategoryContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const pica = Pica();
  const alertRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    quantity: 1,
    pickUpPoint: "Choose a pick-up point",
    keywords: "",
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState(null);

  const [errors, setErrors] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/product/detail/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch product data");
        const data = await response.json();
        const { product } = data;
        setForm({
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: product.stock_quantity,
          pickUpPoint: product.pickup_point,
          keywords: Array.isArray(product.keywords)
            ? product.keywords.join(", ")
            : "",
        });

        setSelectedFiles(product.photos);
        setPreviewUrls(product.photos);

        // Set category based on product's category_id
        const categoryId = product.category_id._id;

        // Find the corresponding sub-category or sub-sub-category from the categories context
        let category = null;
        let subCategory = null;
        let subSubCategory = null;

        console.log("Looking for categoryId:", categoryId);

        for (let cat of categories) {
          console.log("Checking top-level category:", cat.children);

          // Check if category_id is a sub-category
          const subCat = cat.children.find(
            (child) => child._id === categoryId
          );
          if (subCat) {
            console.log("Found as sub-category:", subCat);
            category = cat;
            subCategory = subCat;
            break;
          }

          // Check if category_id is a sub-sub-category
          for (let child of cat.children) {
            const subSubCat = child.children?.find(
              (subChild) => subChild._id === categoryId
            );
            if (subSubCat) {
              console.log("Found as sub-sub-category:", subSubCat);
              category = cat;
              subCategory = child;
              subSubCategory = subSubCat;
              break;
            }
          }
          if (subSubCategory) break;
        }

        // Update selected category states
        setSelectedCategory(category);
        setSelectedSubCategory(subCategory);
        setSelectedSubSubCategory(subSubCategory);

        console.log(
          "Selected category:",
          category,
          subCategory,
          subSubCategory
        );
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProduct();
  }, [id, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

  const handlePickupChange = (point) => () => {
    setForm((prev) => ({ ...prev, pickUpPoint: point }));
  };

  const handleQuantityChange = (type) => {
    setForm((prev) => ({
      ...prev,
      quantity:
        type === "increase"
          ? prev.quantity + 1
          : Math.max(prev.quantity - 1, 1),
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 4) {
      alert("You can only upload up to 4 images");
      return;
    }
    const resizedFiles = await Promise.all(
      files.map((file) => resizeImage(file))
    );
    setSelectedFiles((prevFiles) => [...prevFiles, ...resizedFiles]);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prevUrls) => [...prevUrls, ...urls]);
  };

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size <= 10 * 1024 * 1024) {
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
                const resizedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                });
                resolve(resizedFile);
              } else if (quality > 0.1) {
                resizeAndCompress(quality - 0.1);
              } else {
                reject(new Error("Unable to resize image to be under 10MB"));
              }
            })
            .catch((error) => reject(error));
        };

        resizeAndCompress(0.8);
      };
    });
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = [];

    if (selectedFiles.length === 0)
      newErrors.push("At least one image is required");
    if (!form.name) newErrors.push("Product name is required");
    if (!form.description) newErrors.push("Description is required");
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
      newErrors.push("Price must be greater than 0");
    if (!form.pickUpPoint || form.pickUpPoint === "Choose a pick-up point")
      newErrors.push("Pick-up point is required");

    setErrors(newErrors);
    setShowAlert(newErrors.length > 0);
    return newErrors.length === 0;
  };

  useEffect(() => {
    if (errors.length > 0 && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [errors]);

  const updateProduct = async () => {
    if (!validateForm()) return;
    setShowLoading(true);

    const categoryId =
      selectedSubSubCategory?._id ||
      selectedSubCategory?._id ||
      selectedCategory?._id;

    try {
      const formData = new FormData();
      for (const file of selectedFiles) {
        if (typeof file === "string") {
          // Existing URLs, skip adding to form data
          continue;
        }
        formData.append("files", file);
      }

      let newUrls = [];
      if (formData.has("files")) {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/seller/imageUpload`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );
        if (!response.ok) throw new Error("Cannot upload images");
        const data = await response.json();
        newUrls = data.urls;
      }

      // Combine existing URLs with new ones
      const updatedPhotos = [
        ...selectedFiles.filter((file) => typeof file === "string"), // Existing URLs
        ...newUrls, // Newly uploaded URLs
      ];

      const product = {
        name: form.name,
        image: updatedPhotos[0],
        photos: updatedPhotos,
        description: form.description,
        price: form.price,
        pickup_point: form.pickUpPoint,
        category_id: categoryId,
        stock_quantity: form.quantity,
        keywords: form.keywords.split(","),
        status: "processing",
      };

      const productResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/seller/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(product),
        }
      );
      if (!productResponse.ok) throw new Error("Can not update product");
      const productData = await productResponse.json();
      console.log("Product updated successfully:", productData);
      setShowLoading(false);
      setShowSuccess(true);
    } catch (error) {
      console.log("Error updating product:", error);
      setShowLoading(false);
      setShowFailure(true);
    }
  };

  return (
    <Form className="editForm">
      <h3>Edit your product</h3>

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

      <Form.Group className="mb-3 text-center" controlId="formFileMultiple">
        <Form.Label
          className="d-block border border-secondary p-3 rounded"
          style={{ cursor: "pointer", borderStyle: "dashed" }}
        >
          Add photos (up to 4)
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
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
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

      <div className="d-flex justify-content-end">
        <Button href="/selling-history" className="cancelBtn">
          Cancel
        </Button>
        <Button onClick={updateProduct} className="sellBtn">
          Save Changes
        </Button>
      </div>

      <LoadingModal show={showLoading} />
      <SuccessModal show={showSuccess} />
      <FailureModal show={showFailure} />
    </Form>
  );
};

export default ProductEdit;
