import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Rating,
  Chip,
  Divider,
  Tab,
  Tabs,
  Avatar,
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
  Modal,
  Backdrop,
} from "@mui/material";
import {
  AddShoppingCart,
  FavoriteBorder,
  Favorite,
  Share,
  LocalShipping,
  Verified,
  Home,
  NavigateNext,
  Close,
  ShoppingBag,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";
import ProductCard from "../components/home/ProductCard";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isItemInWishlist } = useWishlist();

  const product = products.find((p) => p.id === parseInt(id)) || products[0];
  const isFavorite = isItemInWishlist(product.id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const imageRef = useRef(null);

  // Get related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      icon: "🛒",
      style: { background: "#2E7D32", color: "#fff", fontWeight: "600" },
    });
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate("/checkout");
    toast.success("Proceeding to checkout!", {
      icon: "🚀",
      style: { background: "#FF9800", color: "#fff", fontWeight: "600" },
    });
  };

  const handleFavoriteToggle = () => {
    toggleWishlist(product);
    toast.success(isFavorite ? "Removed from wishlist" : "Added to wishlist!", {
      icon: isFavorite ? "💔" : "❤️",
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setMousePosition({ x: clampedX, y: clampedY });
  }, []);

  const productImages = product.images || [product.image];
  const currentImage = productImages[selectedImage];

  return (
    <Box className="product-detail-page">
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          className="breadcrumbs"
        >
          <Link component="button" onClick={() => navigate("/")}>
            <Home sx={{ mr: 0.5, fontSize: "1.2rem" }} />
            Home
          </Link>
          <Link
            component="button"
            onClick={() => navigate(`/products?category=${product.category}`)}
          >
            {product.category}
          </Link>
          <Typography className="breadcrumb-active">{product.name}</Typography>
        </Breadcrumbs>

        {/* Main Product Section */}
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="product-main-section"
        >
          <Grid container>
            {/* Image Gallery */}
            <Grid item xs={12} md={6}>
              <Box className="product-gallery">
                {product.badge && (
                  <Chip label={product.badge} className="product-badge" />
                )}

                {/* Main Image with Zoom */}
                <Box
                  ref={imageRef}
                  className="main-image-container"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onClick={() => setZoomModalOpen(true)}
                >
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="main-product-image"
                  />

                  {/* Zoom Lens */}
                  {isHovering && (
                    <Box
                      className="zoom-lens"
                      style={{
                        left: `${mousePosition.x}%`,
                        top: `${mousePosition.y}%`,
                      }}
                    />
                  )}
                </Box>

                {/* Side Zoom Display */}
                {isHovering && (
                  <Box className="side-zoom-display">
                    <Box
                      className="zoomed-image"
                      style={{
                        backgroundImage: `url(${currentImage})`,
                        backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                        backgroundSize: "300%",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  </Box>
                )}

                {/* Thumbnail Gallery */}
                <Box className="thumbnail-gallery">
                  {productImages.map((img, index) => (
                    <Box
                      key={index}
                      className={`thumbnail ${
                        selectedImage === index ? "active" : ""
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Product Info */}
            <Grid item xs={12} md={6}>
              <Box className="product-info">
                <Typography className="product-brand">
                  {product.brand}
                </Typography>
                <Typography variant="h4" className="product-title">
                  {product.name}
                </Typography>

                <Box className="rating-section">
                  <Rating value={product.rating} precision={0.1} readOnly />
                  <Typography className="rating-text">
                    {product.rating} ({product.reviews} reviews)
                  </Typography>
                  <Chip
                    label={product.inStock ? "In Stock" : "Out of Stock"}
                    icon={<Verified />}
                    className={`stock-chip ${
                      product.inStock ? "in-stock" : "out-of-stock"
                    }`}
                  />
                </Box>

                <Box className="price-section">
                  <Typography className="current-price">
                    ₹{product.price.toLocaleString()}
                  </Typography>
                  {product.originalPrice && (
                    <>
                      <Typography className="original-price">
                        ₹{product.originalPrice.toLocaleString()}
                      </Typography>
                      {product.discount && (
                        <Chip
                          label={`${product.discount}% OFF`}
                          className="discount-chip"
                        />
                      )}
                    </>
                  )}
                </Box>

                <Typography className="tax-info">
                  Inclusive of all taxes
                </Typography>
                <Divider sx={{ my: 3 }} />

                <Typography className="product-description">
                  {product.description}
                </Typography>

                {/* Key Features */}
                {product.features && (
                  <Box className="features-section">
                    <Typography className="section-title">
                      Key Features
                    </Typography>
                    <Box className="features-chips">
                      {product.features.map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          className="feature-chip"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Action Buttons */}
                <Box className="action-buttons">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="add-to-cart-btn"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingBag />}
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    className="buy-now-btn"
                  >
                    Buy Now
                  </Button>
                  <IconButton
                    onClick={handleFavoriteToggle}
                    className="wishlist-icon-btn"
                  >
                    {isFavorite ? (
                      <Favorite sx={{ color: "#E91E63" }} />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                  <IconButton className="share-icon-btn">
                    <Share />
                  </IconButton>
                </Box>

                {/* Delivery Info */}
                <Paper className="delivery-info">
                  <LocalShipping className="delivery-icon" />
                  <Box>
                    <Typography className="delivery-title">
                      Free Delivery
                    </Typography>
                    <Typography className="delivery-text">
                      Delivered in 2-3 business days
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs Section */}
        <Paper className="tabs-section">
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            className="product-tabs"
          >
            <Tab label="Description" />
            <Tab label="Specifications" />
            <Tab label={`Reviews (${product.comments?.length || 0})`} />
          </Tabs>

          <Box className="tab-content">
            {tabValue === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Typography className="tab-text">
                  {product.description}
                </Typography>
                {product.features && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" className="features-title">
                      Product Features
                    </Typography>
                    <ul className="features-list">
                      {product.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </Box>
                )}
              </motion.div>
            )}

            {tabValue === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {product.specifications ? (
                  <Grid container spacing={2}>
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Box className="spec-item">
                            <Typography className="spec-key">{key}</Typography>
                            <Typography className="spec-value">
                              {value}
                            </Typography>
                          </Box>
                        </Grid>
                      )
                    )}
                  </Grid>
                ) : (
                  <Typography className="no-data">
                    Specifications not available
                  </Typography>
                )}
              </motion.div>
            )}

            {tabValue === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {product.comments && product.comments.length > 0 ? (
                  <>
                    <Box className="rating-summary">
                      <Typography className="rating-number">
                        {product.rating}
                      </Typography>
                      <Box>
                        <Rating
                          value={product.rating}
                          precision={0.1}
                          readOnly
                        />
                        <Typography className="reviews-count">
                          {product.reviews} reviews
                        </Typography>
                      </Box>
                    </Box>

                    <Box className="reviews-list">
                      {product.comments.map((comment) => (
                        <Paper key={comment.id} className="review-card">
                          <Box className="review-header">
                            <Avatar className="review-avatar">
                              {comment.user.charAt(0)}
                            </Avatar>
                            <Box className="review-user-info">
                              <Typography className="review-username">
                                {comment.user}
                              </Typography>
                              <Box className="review-rating-date">
                                <Rating
                                  value={comment.rating}
                                  size="small"
                                  readOnly
                                />
                                <Typography className="review-date">
                                  {new Date(comment.date).toLocaleDateString(
                                    "en-IN"
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label="Verified"
                              icon={<Verified />}
                              className="verified-chip"
                            />
                          </Box>
                          <Typography className="review-comment">
                            {comment.comment}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Box className="no-reviews">
                    <Typography variant="h6">No reviews yet</Typography>
                    <Typography>Be the first to review!</Typography>
                  </Box>
                )}
              </motion.div>
            )}
          </Box>
        </Paper>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Box className="related-products-section">
            <Typography variant="h5" className="related-title">
              Related Products
            </Typography>
            <Grid container spacing={3}>
              {relatedProducts.map((relProduct) => (
                <Grid item xs={12} sm={6} md={3} key={relProduct.id}>
                  <ProductCard product={relProduct} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Zoom Modal */}
        <Modal
          open={zoomModalOpen}
          onClose={() => setZoomModalOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Box className="zoom-modal">
            <IconButton
              className="zoom-modal-close"
              onClick={() => setZoomModalOpen(false)}
            >
              <Close />
            </IconButton>
            <img
              src={currentImage}
              alt={product.name}
              className="zoom-modal-image"
            />
            <Box className="zoom-modal-thumbnails">
              {productImages.map((img, index) => (
                <Box
                  key={index}
                  className={`modal-thumbnail ${
                    selectedImage === index ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`Thumb ${index + 1}`} />
                </Box>
              ))}
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default ProductDetail;
