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
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
  Modal,
  Backdrop,
  TextField,
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
  Star,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";
import ProductCard from "../components/home/ProductCard";
import api from "../data/api";
import "./ProductDetail.css";

const PriceBlock = ({
  basePrice,
  discountPrice,
  discountPercent,
  currentPrice,
}) => {
  const priceToShow =
    typeof currentPrice !== "undefined" && currentPrice !== null
      ? currentPrice
      : discountPrice ?? basePrice;

  const hasDiscount =
    typeof discountPrice === "number" &&
    discountPrice > 0 &&
    discountPrice < basePrice;

  return (
    <Box className="price-section">
      <Typography className="current-price">
        ₹{priceToShow?.toLocaleString() || 0}
      </Typography>
      {hasDiscount && (
        <>
          <Typography className="original-price">
            ₹{basePrice?.toLocaleString() || 0}
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

  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentStock, setCurrentStock] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const imageRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await api.fetchProductById(id);
        if (!mounted) return;

        setProduct(data);
        setCurrentImages(
          data.generalImages && data.generalImages.length > 0
            ? data.generalImages
            : (data.imagesUrls || [data.image]).filter(Boolean)
        );
        setCurrentStock(data.totalStock ?? data.stock ?? 0);
        setCurrentPrice(data.price ?? data.basePrice ?? null);

        try {
          const invVariants = await api.fetchProductVariants(id);
          let merged = [];
          if (Array.isArray(data.variants) && data.variants.length > 0) {
            merged = data.variants.map((v) => {
              const found = invVariants.find(
                (iv) => String(iv.id) === String(v.id)
              );
              return {
                ...v,
                stock: found?.stock ?? v.stock ?? 0,
                price: v.price ?? found?.price ?? null,
              };
            });
          } else {
            merged = invVariants.map((v) => ({
              id: v.id,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              color: v.color,
              size: v.size,
              images: v.images || [],
            }));
          }

          setVariants(merged);
          if (merged.length > 0) {
            const def = merged.find((v) => v.stock > 0) || merged[0];
            handleVariantChange(def, data);
          }
        } catch (err) {
          console.warn("Variant fetch failed:", err);
        }

        const catId = data?.category?._id || data?.category || null;
        if (catId) {
          const rel = await api.fetchProducts({ category: catId, limit: 12 });
          setRelated(rel.filter((p) => p.id !== data.id).slice(0, 4));
        }
      } catch (err) {
        setErr("Product not found");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(currentImages) && currentImages.length)
      return currentImages.filter(Boolean);
    if (Array.isArray(product.images))
      return product.images
        .map((i) => i.fullUrl || i.url || product.image)
        .filter(Boolean);
    return product.image ? [product.image] : [];
  }, [product, currentImages]);

  const isFavorite = product
    ? isItemInWishlist(product.id || product._id)
    : false;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant || null);
    toast.success(`${product.name} added to cart!`, {
      icon: "🛒",
      style: { background: "#2E7D32", color: "#fff", fontWeight: 600 },
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedVariant || null);
    navigate("/checkout");
  };

  const handleFavoriteToggle = () => {
    toggleWishlist(product);
    toast.success(isFavorite ? "Removed from wishlist" : "Added to wishlist!", {
      icon: isFavorite ? "💔" : "❤️",
    });
  };

  const handleVariantChange = (variant, prod = product) => {
    if (!variant) {
      setSelectedVariant(null);
      setCurrentStock(prod?.stock ?? 0);
      setCurrentImages(
        prod?.generalImages?.length
          ? prod.generalImages
          : (prod?.imagesUrls || [prod?.image]).filter(Boolean)
      );
      setCurrentPrice(prod?.price ?? null);
      return;
    }

    setSelectedVariant(variant);
    setCurrentStock(variant.stock ?? prod?.stock ?? 0);
    setCurrentPrice(variant.price ?? prod?.price ?? null);
    if (Array.isArray(variant.images) && variant.images.length > 0)
      setCurrentImages(variant.images);
    else setCurrentImages(prod?.generalImages || [prod?.image]);
  };

  const handleMouseMove = useCallback((e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  }, []);

  const handleSubmitRating = () => {
    if (userRating === 0) {
      toast.error("Please select a rating!");
      return;
    }
    toast.success("Thank you for your feedback!");
    setUserRating(0);
    setRatingComment("");
  };

  if (loading)
    return (
      <Container sx={{ py: 10 }}>
        <Typography>Loading product…</Typography>
      </Container>
    );

  if (err || !product)
    return (
      <Container sx={{ py: 10 }}>
        <Typography color="error">{err}</Typography>
      </Container>
    );

  const currentImage = gallery[selectedImage];

  return (
    <Box className="product-detail-page">
      <Container maxWidth="xl">
        {/* Breadcrumb */}
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
            {/* Left gallery */}
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
                </Box>

                <Box className="thumbnail-gallery">
                  {gallery.map((img, i) => (
                    <Box
                      key={i}
                      className={`thumbnail ${
                        selectedImage === i ? "active" : ""
                      }`}
                      onClick={() => setSelectedImage(i)}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Right info */}
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

                {/* Rating + Stock */}
                <Box className="rating-section">
                  <Rating
                    value={product.rating || 0}
                    precision={0.5}
                    readOnly
                  />
                  <Typography className="rating-text">
                    {(product.rating || 0).toFixed(1)} ({product.reviews || 0}{" "}
                    reviews)
                  </Typography>
                  <Chip
                    label={
                      currentStock > 0
                        ? `In Stock (${currentStock} available)`
                        : "Out of Stock"
                    }
                    icon={<Verified />}
                    className={`stock-chip ${
                      currentStock > 0 ? "in-stock" : "out-of-stock"
                    }`}
                  />
                </Box>

                <PriceBlock
                  basePrice={product.basePrice}
                  discountPrice={product.discountPrice}
                  discountPercent={product.discountPercent}
                  currentPrice={currentPrice}
                />

                {product.shortDescription && (
                  <Typography className="product-description">
                    {product.shortDescription}
                  </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Variants */}
                {variants.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, mb: 1 }}>
                      Choose variant
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {variants.map((v) => (
                        <Button
                          key={v.id}
                          size="small"
                          variant={
                            selectedVariant?.id === v.id
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() => handleVariantChange(v)}
                          disabled={Number(v.stock ?? 0) <= 0}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            minWidth: 110,
                          }}
                        >
                          {v.color?.name || ""}{" "}
                          {v.size?.name ? ` / ${v.size.name}` : ""}
                          {Number(v.stock ?? 0) <= 0 ? " — Out" : ""}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Actions */}
                <Box className="action-buttons">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={currentStock <= 0}
                    className="add-to-cart-btn"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingBag />}
                    onClick={handleBuyNow}
                    disabled={currentStock <= 0}
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
                      Delivered in 2–3 business days
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Rating Input */}
        <Paper className="user-rating-section" sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Leave a rating
          </Typography>
          <Rating
            value={userRating}
            precision={0.5}
            onChange={(e, val) => setUserRating(val)}
            size="large"
            icon={<Star fontSize="inherit" />}
          />
          <TextField
            fullWidth
            placeholder="Write a short review..."
            multiline
            rows={3}
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSubmitRating}
          >
            Submit Review
          </Button>
        </Paper>

        {/* Related Products */}
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

        {/* Zoom Modal */}
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
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default ProductDetail;
