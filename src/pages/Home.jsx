// rathod-mart/src/pages/Home.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceRange: [0, 100000],
    ratings: [],
    discounts: [],
    inStock: false,
    sortBy: "featured",
  });

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Smooth-scroll to a section (Unchanged, this logic is correct)
  useEffect(() => {
    if (location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      const t = setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) section.scrollIntoView({ behavior: "smooth" });
        navigate(location.pathname, { replace: true, state: {} });
      }, 120);

      return () => clearTimeout(t);
    }
  }, [location, navigate]);

  const sortMapping = (key) => {
    switch (key) {
      case "priceLowHigh":
        return { sortBy: "basePrice", sortOrder: "asc" };
      case "priceHighLow":
        return { sortBy: "basePrice", sortOrder: "desc" };
      default:
        return { sortBy: "createdAt", sortOrder: "desc" };
    }
  };

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!showAllProducts || activeFiltersCount === 0) return;
      setLoading(true);
      setErr(null);
      try {
        const { sortBy, sortOrder } = sortMapping(filters.sortBy);
        const params = { limit: 120, sortBy, sortOrder };
        if (filters.categories?.length) params.category = filters.categories;
        if (filters.brands?.length) params.brands = filters.brands;
        if (Array.isArray(filters.priceRange)) {
          params.minPrice = filters.priceRange[0];
          params.maxPrice = filters.priceRange[1];
        }

        const data = await api.fetchProducts(params);
        if (mounted) setAllProducts(data);
      } catch (e) {
        console.error("Home fetch error", e);
        if (mounted) setErr("Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [showAllProducts, activeFiltersCount, filters]);

  const filteredProducts = useMemo(() => {
    let list = Array.isArray(allProducts) ? [...allProducts] : [];

    if (filters.categories?.length) {
      list = list.filter((p) => {
        const cid = p?.category?._id || p?.category;
        return cid && filters.categories.includes(String(cid));
      });
    }

    if (filters.brands?.length) {
      list = list.filter((p) => p.brand && filters.brands.includes(p.brand));
    }

    if (Array.isArray(filters.priceRange)) {
      const [min, max] = filters.priceRange;
      list = list.filter((p) => {
        const price = Number(p.price ?? 0);
        return price >= min && price <= max;
      });
    }

    if (filters.ratings?.length) {
      const minRating = Math.min(...filters.ratings);
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }

    if (filters.discounts?.length) {
      const minDiscount = Math.min(...filters.discounts);
      list = list.filter((p) => (p.discountPercent || 0) >= minDiscount);
    }

    if (filters.inStock) {
      list = list.filter((p) =>
        typeof p.totalStock === "number"
          ? p.totalStock > 0
          : p.inStock !== false
      );
    }

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
        <Brands />
        <BestOffers />
        <Categories />
        {/* TrendingProducts removed to fix undefined component error */}

        {/* Featured/Filtered Products Section */}
        <Box id="products-section" sx={{ pb: 8 }}>
          {showAllProducts && activeFiltersCount > 0 ? (
            <Container maxWidth="xl">
              <Typography
                variant="h3"
                sx={{ fontWeight: 900, textAlign: "center", mb: 1 }}
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
                  ? err
                  : `${filteredProducts.length} products found`}
              </Typography>

              {/* (rest of the filter chips and grid logic remains the same) */}
              <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {filters.categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={`Category: ${cat}`}
                    onDelete={() =>
                      setFilters((p) => ({
                        ...p,
                        categories: p.categories.filter((c) => c !== cat),
                      }))
                    }
                    color="success"
                  />
                ))}
                {filters.brands.map((brand) => (
                  <Chip
                    key={brand}
                    label={`Brand: ${brand}`}
                    onDelete={() =>
                      setFilters((p) => ({
                        ...p,
                        brands: p.brands.filter((b) => b !== brand),
                      }))
                    }
                    color="success"
                  />
                ))}
                {filters.ratings.map((rating) => (
                  <Chip
                    key={rating}
                    label={`${rating}★ & up`}
                    onDelete={() =>
                      setFilters((p) => ({
                        ...p,
                        ratings: p.ratings.filter((r) => r !== rating),
                      }))
                    }
                    color="success"
                  />
                ))}
                {filters.discounts.map((discount) => (
                  <Chip
                    key={discount}
                    label={`${discount}% off`}
                    onDelete={() =>
                      setFilters((p) => ({
                        ...p,
                        discounts: p.discounts.filter((d) => d !== discount),
                      }))
                    }
                    color="success"
                  />
                ))}
              </Box>

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
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        key={product._id || product.id}
                      >
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
            <FeaturedProducts />
          )}
        </Box>

        {/* (Filter FAB and Drawer components remain unchanged) */}
        <Fab
          color="primary"
          onClick={() => setIsFilterOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            left: 24,
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
    </motion.div>
  );
};

export default Home;
