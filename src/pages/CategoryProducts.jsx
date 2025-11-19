// src/pages/CategoryProducts.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Breadcrumbs,
  Link,
  Chip,
  Fab,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Home,
  NavigateNext,
  FilterList,
  TrendingUp,
  Inventory,
} from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import ProductCard from "../components/home/ProductCard";
import AdvancedFilterDrawer from "../components/filter/AdvancedFilterDrawer";
import api from "../data/api";

const CategoryProducts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get("category") || "";
  const isTrendingPage = searchParams.get("trending") === "true";

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: categoryId ? [categoryId] : [],
    brands: [],
    priceRange: [0, 100000],
    ratings: [],
    discounts: [],
    inStock: false,
    sortBy: "featured",
  });

  const [categoryName, setCategoryName] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Helper for API params
  const sortMapping = (key) => {
    switch (key) {
      case "priceLowHigh":
        return { sortBy: "basePrice", sortOrder: "asc" };
      case "priceHighLow":
        return { sortBy: "basePrice", sortOrder: "desc" };
      case "newest":
        return { sortBy: "createdAt", sortOrder: "desc" };
      default:
        return { sortBy: "createdAt", sortOrder: "desc" };
    }
  };

  // Fetch Data
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setErr(null);
      try {
        const { sortBy, sortOrder } = sortMapping(filters.sortBy);
        const params = { limit: 120, sortBy, sortOrder };

        if (isTrendingPage) {
          params.trending = "true";
          setCategoryName("Trending Products");
        } else if (categoryId) {
          params.category = categoryId;
          // We'll fetch category name via side effect or rely on product data
        } else {
          setCategoryName("All Products");
        }

        // Apply filters to API call
        if (filters.brands?.length) params.brands = filters.brands;
        if (Array.isArray(filters.priceRange)) {
          params.minPrice = filters.priceRange[0];
          params.maxPrice = filters.priceRange[1];
        }

        const data = await api.fetchProducts(params);

        if (mounted) {
          setAllProducts(data);
          // If filtering by category ID, grab name from first product
          if (categoryId && data.length > 0 && !isTrendingPage) {
            setCategoryName(data[0].category?.name || "Category");
          }
        }
      } catch (e) {
        console.error("Fetch error:", e);
        if (mounted) setErr("Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [
    categoryId,
    isTrendingPage,
    filters.sortBy,
    filters.brands,
    filters.priceRange,
  ]);

  // Client-side filtering (for things API might not cover yet perfectly)
  const filteredProducts = useMemo(() => {
    let list = Array.isArray(allProducts) ? [...allProducts] : [];

    if (filters.ratings?.length) {
      const minRating = Math.min(...filters.ratings);
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }

    if (filters.discounts?.length) {
      const minDiscount = Math.min(...filters.discounts);
      list = list.filter((p) => (p.discountPercent || 0) >= minDiscount);
    }

    if (filters.inStock) {
      list = list.filter((p) => (p.totalStock || p.stock || 0) > 0);
    }

    return list;
  }, [allProducts, filters]);

  const handleApplyFilters = (newFilters) => setFilters(newFilters);

  const pageTitle = categoryName || "Products";

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        pt: { xs: 10, md: 12 },
        pb: 8,
      }}
    >
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            underline="hover"
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: "text.secondary",
            }}
            onClick={() => navigate("/")}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" /> Home
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}
          >
            {isTrendingPage ? (
              <TrendingUp sx={{ mr: 0.5, fontSize: "1.2rem" }} />
            ) : (
              <Inventory sx={{ mr: 0.5, fontSize: "1.2rem" }} />
            )}
            {pageTitle}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              background: "linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
              textTransform: "capitalize",
            }}
          >
            {pageTitle}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {loading
              ? "Loading products..."
              : `${filteredProducts.length} items found`}
          </Typography>
        </Box>

        {/* Active Filters Display */}
        {/* ... (Keep filter chips logic same as before) ... */}

        {/* Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={60} />
          </Box>
        ) : err ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {err}
          </Alert>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No products found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try removing some filters to see more results.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={product.id || product._id}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Container>

      {/* Filter FAB */}
      <Fab
        color="primary"
        onClick={() => setIsFilterOpen(true)}
        sx={{
          position: "fixed",
          bottom: 30,
          left: 30,
          background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
          zIndex: 1000,
        }}
      >
        <FilterList />
      </Fab>

      <AdvancedFilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={handleApplyFilters}
      />
    </Box>
  );
};

export default CategoryProducts;
