// src/pages/Home.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Box, Container, Typography, Grid, Fab, Chip } from "@mui/material";
import { FilterList } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

import HeroBanner from "../components/home/HeroSection";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import BestOffers from "../components/home/BestOffers";
import DealGrids from "../components/home/DealGrids";
import Brands from "../components/home/Brands";
import ProductCard from "../components/home/ProductCard";
import AdvancedFilterDrawer from "../components/filter/AdvancedFilterDrawer";

import api from "../data/api";

const Home = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Unified filters state your drawer already understands
  const [filters, setFilters] = useState({
    categories: [], // array of category IDs (strings)
    brands: [], // array of brand names (strings)
    priceRange: [0, 100000],
    ratings: [], // array like [4, 3] => min = 3
    discounts: [], // array like [10, 30] => min = 10
    inStock: false,
    sortBy: "featured", // "featured" | "priceLowHigh" | "priceHighLow" | "rating" | "discount"
  });

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // server-sort mapping
  const sortMapping = (key) => {
    switch (key) {
      case "priceLowHigh":
        return { sortBy: "basePrice", sortOrder: "asc" };
      case "priceHighLow":
        return { sortBy: "basePrice", sortOrder: "desc" };
      // "rating" & "discount" we’ll handle client-side below (most APIs don’t store rating/discount as sortable fields)
      case "featured":
      default:
        return { sortBy: "createdAt", sortOrder: "desc" };
    }
  };

  // Determine if any filter is truly active (to decide whether to show Featured section or filtered grid)
  const activeFiltersCount = useMemo(() => {
    return (
      (filters.categories?.length || 0) +
      (filters.brands?.length || 0) +
      (filters.ratings?.length || 0) +
      (filters.discounts?.length || 0) +
      (filters.inStock ? 1 : 0) +
      (filters.sortBy !== "featured" ? 1 : 0)
    );
  }, [filters]);

  // Fetch from API when filters are applied
  useEffect(() => {
    const shouldLoad = showAllProducts && activeFiltersCount > 0;
    if (!shouldLoad) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);

      try {
        // Build server params
        const { sortBy, sortOrder } = sortMapping(filters.sortBy);

        // If multiple categories chosen, we can pass the first one, or all (backend may ignore array)
        // We pass all as repeated params: categories=... (api.js supports arrays)
        const params = {
          limit: 120, // get a big chunk; client can still refine
          sortBy,
          sortOrder,
        };

        if (filters.categories?.length > 0) {
          // If your backend expects `category` single string, pass first:
          // params.category = filters.categories[0];
          // If it can accept multiple, pass array:
          params.category = filters.categories; // api.js will serialize arrays
        }

        if (filters.brands?.length > 0) {
          // Your backend may not filter by brand; harmless to send
          params.brands = filters.brands;
        }

        // Price to backend
        if (Array.isArray(filters.priceRange)) {
          params.minPrice = filters.priceRange[0];
          params.maxPrice = filters.priceRange[1];
        }

        const data = await api.fetchProducts(params);
        if (!mounted) return;
        setAllProducts(data);
      } catch (e) {
        if (!mounted) return;
        setErr("Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showAllProducts, activeFiltersCount, filters]);

  // Client-side refine for rating/discount/inStock + brand (if server didn’t filter)
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Brand refine (if backend ignored it)
    if (filters.brands?.length) {
      list = list.filter((p) => p.brand && filters.brands.includes(p.brand));
    }

    // Rating refine
    if (filters.ratings?.length) {
      const minRating = Math.min(...filters.ratings);
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }

    // Discount refine (uses api normalization: discountPercent)
    if (filters.discounts?.length) {
      const minDiscount = Math.min(...filters.discounts);
      list = list.filter((p) => (p.discountPercent || 0) >= minDiscount);
    }

    // Stock refine
    if (filters.inStock) {
      // Prefer `totalStock` if present; fallback to `inStock` boolean
      list = list.filter((p) =>
        typeof p.totalStock === "number"
          ? p.totalStock > 0
          : p.inStock !== false
      );
    }

    // Sort refine for "rating" / "discount" that backend can’t handle
    if (filters.sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === "discount") {
      list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    }

    return list;
  }, [allProducts, filters]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowAllProducts(true);
  };

  const handleRemoveFilterChip = (field, value) => {
    setFilters((prev) => {
      if (Array.isArray(prev[field])) {
        return { ...prev, [field]: prev[field].filter((x) => x !== value) };
      }
      return prev;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box>
        <HeroBanner />
        <DealGrids />
        <Box id="brands-section">
          <Brands />
        </Box>
        <BestOffers />
        <Box id="categories-section">
          <Categories />
        </Box>

        <Box id="products-section">
          {showAllProducts && activeFiltersCount > 0 ? (
            <Container maxWidth="xl" sx={{ py: 8 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  textAlign: "center",
                  mb: 1,
                  background:
                    "linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Filtered Products
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: "center", mb: 4 }}
              >
                {loading
                  ? "Loading..."
                  : err
                  ? "Error loading products"
                  : `${filteredProducts.length} products found`}
              </Typography>

              {/* Active filter chips */}
              <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {filters.categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={`Category: ${cat}`}
                    onDelete={() => handleRemoveFilterChip("categories", cat)}
                    color="success"
                  />
                ))}
                {filters.brands.map((brand) => (
                  <Chip
                    key={brand}
                    label={`Brand: ${brand}`}
                    onDelete={() => handleRemoveFilterChip("brands", brand)}
                    color="success"
                  />
                ))}
                {filters.ratings.map((rating) => (
                  <Chip
                    key={rating}
                    label={`${rating}★ & up`}
                    onDelete={() => handleRemoveFilterChip("ratings", rating)}
                    color="success"
                  />
                ))}
                {filters.discounts.map((discount) => (
                  <Chip
                    key={discount}
                    label={`${discount}% off`}
                    onDelete={() =>
                      handleRemoveFilterChip("discounts", discount)
                    }
                    color="success"
                  />
                ))}
                {filters.inStock && (
                  <Chip
                    label="In Stock"
                    onDelete={() =>
                      setFilters((p) => ({ ...p, inStock: false }))
                    }
                    color="success"
                  />
                )}
              </Box>

              {/* Grid */}
              {err ? (
                <Box sx={{ textAlign: "center", py: 10 }}>
                  <Typography color="error">{err}</Typography>
                </Box>
              ) : loading ? (
                <Box sx={{ textAlign: "center", py: 10 }}>
                  <Typography>Loading…</Typography>
                </Box>
              ) : filteredProducts.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 10 }}>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    No products found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Try adjusting your filters
                  </Typography>
                </Box>
              ) : (
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
              )}
            </Container>
          ) : (
            // If no active filters -> show your Featured section as before
            <FeaturedProducts />
          )}
        </Box>

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
              transform: "scale(1.08)",
            },
            zIndex: 1000,
            transition: "all 0.25s",
            boxShadow: "0 6px 20px rgba(46,125,50,0.35)",
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
    </motion.div>
  );
};

export default Home;
