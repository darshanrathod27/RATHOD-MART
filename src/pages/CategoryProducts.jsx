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
} from "@mui/material";
import { Home, NavigateNext, FilterList } from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import ProductCard from "../components/home/ProductCard";
import AdvancedFilterDrawer from "../components/filter/AdvancedFilterDrawer";
import api from "../data/api";

const CategoryProducts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get("category") || "";

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { sortBy, sortOrder } = sortMapping(filters.sortBy);
        const params = {
          limit: 120,
          sortBy,
          sortOrder,
        };
        if (categoryId) params.category = categoryId;
        if (filters.brands?.length) params.brands = filters.brands;
        if (Array.isArray(filters.priceRange)) {
          params.minPrice = filters.priceRange[0];
          params.maxPrice = filters.priceRange[1];
        }

        const data = await api.fetchProducts(params);
        if (!mounted) return;

        setAllProducts(data);
        setCategoryName(data?.[0]?.category?.name || "");
      } catch {
        if (!mounted) return;
        setErr("Failed to load category products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [categoryId, filters.sortBy, filters.brands, filters.priceRange]);

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (filters.categories?.length) {
      list = list.filter((p) => {
        const pid = p?.category?._id || p?.category;
        return pid && filters.categories.includes(String(pid));
      });
    }

    if (filters.brands?.length) {
      list = list.filter((p) => p.brand && filters.brands.includes(p.brand));
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

  const activeFiltersCount =
    (filters.brands?.length || 0) +
    (filters.ratings?.length || 0) +
    (filters.discounts?.length || 0) +
    (filters.inStock ? 1 : 0) +
    (filters.categories?.length || 0);

  const handleApplyFilters = (newFilters) => setFilters(newFilters);

  const handleRemoveFilter = (field, value) => {
    setFilters((prev) =>
      Array.isArray(prev[field])
        ? { ...prev, [field]: prev[field].filter((v) => v !== value) }
        : prev
    );
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{ bgcolor: "#fafafa", minHeight: "100vh", pt: 12, pb: 8 }}
    >
      <Container maxWidth="xl">
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
            {categoryName || "All Products"}
          </Typography>
        </Breadcrumbs>

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
            {categoryName || "All Products"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {loading
              ? "Loading…"
              : err
              ? "Error loading products"
              : `${filteredProducts.length} products found`}
          </Typography>
        </Box>

        {activeFiltersCount > 0 && (
          <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {filters.categories.map((cat) => (
              <Chip
                key={cat}
                label={`Category: ${cat}`}
                onDelete={() => handleRemoveFilter("categories", cat)}
                color="success"
              />
            ))}
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
                onDelete={() => setFilters((p) => ({ ...p, inStock: false }))}
                color="success"
              />
            )}
          </Box>
        )}

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
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
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
