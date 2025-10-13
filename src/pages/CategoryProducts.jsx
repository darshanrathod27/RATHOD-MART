import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Breadcrumbs,
  Link,
  Chip,
  Fab,
} from "@mui/material";
import { Home, NavigateNext, FilterList } from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { products, categories } from "../data/products";
import ProductCard from "../components/home/ProductCard";
import AdvancedFilterDrawer from "../components/filter/AdvancedFilterDrawer";

const CategoryProducts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get("category");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: categoryId ? [parseInt(categoryId)] : [],
    brands: [],
    priceRange: [0, 100000],
    ratings: [],
    discounts: [],
    inStock: false,
    sortBy: "featured",
  });

  // Find the category
  const category = categories.find((c) => c.id === parseInt(categoryId));

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) =>
        filters.categories.includes(p.categoryId)
      );
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand));
    }

    // Price filter
    filtered = filtered.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Rating filter
    if (filters.ratings.length > 0) {
      const minRating = Math.min(...filters.ratings);
      filtered = filtered.filter((p) => (p.rating || 0) >= minRating);
    }

    // Discount filter
    if (filters.discounts.length > 0) {
      const minDiscount = Math.min(...filters.discounts);
      filtered = filtered.filter((p) => (p.discount || 0) >= minDiscount);
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.inStock !== false);
    }

    // Sort
    switch (filters.sortBy) {
      case "priceLowHigh":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "priceHighLow":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "discount":
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [filters]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRemoveFilter = (filterType, value) => {
    setFilters((prev) => {
      if (Array.isArray(prev[filterType])) {
        return {
          ...prev,
          [filterType]: prev[filterType].filter((v) => v !== value),
        };
      }
      return prev;
    });
  };

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    filters.ratings.length +
    filters.discounts.length +
    (filters.inStock ? 1 : 0);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{ bgcolor: "#fafafa", minHeight: "100vh", pt: 12, pb: 8 }}
    >
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            underline="hover"
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {category?.name || "All Products"}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              background: "linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            {category ? `${category.icon} ${category.name}` : "All Products"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filteredProducts.length} products found
          </Typography>
        </Box>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {filters.brands.map((brand) => (
              <Chip
                key={brand}
                label={`Brand: ${brand}`}
                onDelete={() => handleRemoveFilter("brands", brand)}
                color="success"
              />
            ))}
            {filters.ratings.map((rating) => (
              <Chip
                key={rating}
                label={`${rating}★ & up`}
                onDelete={() => handleRemoveFilter("ratings", rating)}
                color="success"
              />
            ))}
            {filters.discounts.map((discount) => (
              <Chip
                key={discount}
                label={`${discount}% off`}
                onDelete={() => handleRemoveFilter("discounts", discount)}
                color="success"
              />
            ))}
            {filters.inStock && (
              <Chip
                label="In Stock"
                onDelete={() => setFilters({ ...filters, inStock: false })}
                color="success"
              />
            )}
          </Box>
        )}

        {/* Products Grid */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {filteredProducts.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No products found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your filters
            </Typography>
          </Box>
        )}
      </Container>

      {/* Floating Filter Button */}
      <Fab
        color="primary"
        onClick={() => setIsFilterOpen(true)}
        sx={{
          position: "fixed",
          bottom: 24,
          left: 24,
          background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
          },
          zIndex: 1000,
        }}
      >
        <FilterList />
      </Fab>

      {/* Filter Drawer */}
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
