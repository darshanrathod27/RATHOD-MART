// src/pages/ProductDetail.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
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
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";
import ProductCard from "../components/home/ProductCard";
import api from "../data/api";
import "./ProductDetail.css";

const PriceBlock = ({ basePrice, discountPrice, discountPercent }) => {
  const hasDiscount =
    typeof discountPrice === "number" &&
    discountPrice > 0 &&
    discountPrice < basePrice;
  return (
    <Box className="price-section">
      <Typography className="current-price">
        ₹{(hasDiscount ? discountPrice : basePrice)?.toLocaleString()}
      </Typography>
      {hasDiscount && (
        <>
          <Typography className="original-price">
            ₹{basePrice?.toLocaleString()}
          </Typography>
          <Chip
            label={`${discountPercent || 0}% OFF`}
            className="discount-chip"
          />
        </>
      )}
    </Box>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isItemInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await api.fetchProductById(id);
        if (!mounted) return;

        setProduct(data);

        const catId = data?.category?._id || data?.category || null;
        if (catId) {
          const rel = await api.fetchProducts({ category: catId, limit: 12 });
          setRelated(rel.filter((p) => p.id !== data.id).slice(0, 4));
        } else {
          setRelated([]);
        }

        setSelectedImage(0);
      } catch (e) {
        if (!mounted) return;
        setErr("Product not found");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) {
      return product.images
        .map((img) => img.fullUrl || img.url || product.image)
        .filter(Boolean);
    }
    return product.image ? [product.image] : [];
  }, [product]);

  const isFavorite = product ? isItemInWishlist(product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      icon: "🛒",
      style: { background: "#2E7D32", color: "#fff", fontWeight: 600 },
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product);
    navigate("/checkout");
    toast.success("Proceeding to checkout!", {
      icon: "🚀",
      style: { background: "#FF9800", color: "#fff", fontWeight: 600 },
    });
  };

  const handleFavoriteToggle = () => {
    if (!product) return;
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
    setMousePosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, []);

  if (loading) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography>Loading product…</Typography>
      </Container>
    );
  }
  if (err || !product) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography color="error">{err || "Error loading product"}</Typography>
      </Container>
    );
  }

  const currentImage = gallery[selectedImage];

  return (
    <Box className="product-detail-page">
      <Container maxWidth="xl">
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          className="breadcrumbs"
        >
          <Link component="button" onClick={() => navigate("/")}>
            <Home sx={{ mr: 0.5, fontSize: "1.2rem" }} />
            Home
          </Link>
          {product.category?.name && (
            <Link
              component="button"
              onClick={() =>
                navigate(
                  `/products?category=${
                    product.category._id || product.category
                  }`
                )
              }
            >
              {product.category.name}
            </Link>
          )}
          <Typography className="breadcrumb-active">{product.name}</Typography>
        </Breadcrumbs>

        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="product-main-section"
        >
          <Grid container>
            <Grid item xs={12} md={6}>
              <Box className="product-gallery">
                {product.badge && (
                  <Chip label={product.badge} className="product-badge" />
                )}

                <Box
                  ref={imageRef}
                  className="main-image-container"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onClick={() => setZoomModalOpen(true)}
                >
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="main-product-image"
                    />
                  ) : (
                    <Typography>No Image</Typography>
                  )}

                  {isHovering && currentImage && (
                    <Box
                      className="zoom-lens"
                      style={{
                        left: `${mousePosition.x}%`,
                        top: `${mousePosition.y}%`,
                      }}
                    />
                  )}
                </Box>

                {isHovering && currentImage && (
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

                <Box className="thumbnail-gallery">
                  {gallery.map((img, index) => (
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

            <Grid item xs={12} md={6}>
              <Box className="product-info">
                {product.brand && (
                  <Typography className="product-brand">
                    {product.brand}
                  </Typography>
                )}
                <Typography variant="h4" className="product-title">
                  {product.name}
                </Typography>

                <Box className="rating-section">
                  <Rating
                    value={product.rating || 0}
                    precision={0.1}
                    readOnly
                  />
                  <Typography className="rating-text">
                    {(product.rating || 0).toFixed(1)} ({product.reviews || 0}{" "}
                    reviews)
                  </Typography>
                  <Chip
                    label={
                      typeof product.totalStock === "number"
                        ? product.totalStock > 0
                          ? "In Stock"
                          : "Out of Stock"
                        : product.inStock !== false
                        ? "In Stock"
                        : "Out of Stock"
                    }
                    icon={<Verified />}
                    className={`stock-chip ${
                      typeof product.totalStock === "number"
                        ? product.totalStock > 0
                          ? "in-stock"
                          : "out-of-stock"
                        : product.inStock !== false
                        ? "in-stock"
                        : "out-of-stock"
                    }`}
                  />
                </Box>

                <PriceBlock
                  basePrice={product.basePrice}
                  discountPrice={product.discountPrice}
                  discountPercent={product.discountPercent}
                />

                {product.shortDescription && (
                  <Typography className="product-description">
                    {product.shortDescription}
                  </Typography>
                )}
                {product.description && (
                  <Typography
                    className="product-description"
                    sx={{ whiteSpace: "pre-line" }}
                  >
                    {product.description}
                  </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                <Box className="action-buttons">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={
                      typeof product.totalStock === "number"
                        ? product.totalStock <= 0
                        : product.inStock === false
                    }
                    className="add-to-cart-btn"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingBag />}
                    onClick={handleBuyNow}
                    disabled={
                      typeof product.totalStock === "number"
                        ? product.totalStock <= 0
                        : product.inStock === false
                    }
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

        <Paper className="tabs-section">
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
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
                  {product.description || "No description"}
                </Typography>
                {product.features?.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" className="features-title">
                      Product Features
                    </Typography>
                    <ul className="features-list">
                      {product.features.map((f, i) => (
                        <li key={i}>{f}</li>
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
                    {Object.entries(product.specifications).map(([k, v]) => (
                      <Grid item xs={12} sm={6} key={k}>
                        <Box className="spec-item">
                          <Typography className="spec-key">{k}</Typography>
                          <Typography className="spec-value">
                            {String(v)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
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
                        {(product.rating || 0).toFixed(1)}
                      </Typography>
                      <Box>
                        <Rating
                          value={product.rating || 0}
                          precision={0.1}
                          readOnly
                        />
                        <Typography className="reviews-count">
                          {product.reviews || 0} reviews
                        </Typography>
                      </Box>
                    </Box>

                    <Box className="reviews-list">
                      {product.comments.map((c, idx) => (
                        <Paper key={c.id || idx} className="review-card">
                          <Box className="review-header">
                            <Avatar className="review-avatar">
                              {(c.user || "?").charAt(0)}
                            </Avatar>
                            <Box className="review-user-info">
                              <Typography className="review-username">
                                {c.user || "User"}
                              </Typography>
                              <Box className="review-rating-date">
                                <Rating
                                  value={c.rating || 0}
                                  size="small"
                                  readOnly
                                />
                                <Typography className="review-date">
                                  {c.date
                                    ? new Date(c.date).toLocaleDateString(
                                        "en-IN"
                                      )
                                    : ""}
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
                            {c.comment || ""}
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

        {related.length > 0 && (
          <Box className="related-products-section">
            <Typography variant="h5" className="related-title">
              Related Products
            </Typography>
            <Grid container spacing={3}>
              {related.map((p) => (
                <Grid item xs={12} sm={6} md={3} key={p.id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Modal
          open={zoomModalOpen}
          onClose={() => setZoomModalOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 400 }}
        >
          <Box className="zoom-modal">
            <IconButton
              className="zoom-modal-close"
              onClick={() => setZoomModalOpen(false)}
            >
              <Close />
            </IconButton>
            {currentImage && (
              <img
                src={currentImage}
                alt={product.name}
                className="zoom-modal-image"
              />
            )}
            <Box className="zoom-modal-thumbnails">
              {gallery.map((img, index) => (
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
