// src/pages/SearchPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Home, NavigateNext, Search } from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import ProductCard from "../components/home/ProductCard";
import api from "../data/api"; // Aapka API helper

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);
      try {
        // API call aapke product controller ke search feature ko use karega
        const data = await api.fetchProducts({
          search: query,
          limit: 50,
        });
        if (!mounted) return;
        setProducts(data || []);
      } catch (e) {
        console.error("Search fetch error:", e);
        if (!mounted) return;
        setErr("Failed to load search results. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [query]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
          <Typography
            color="text.primary"
            sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}
          >
            <Search sx={{ mr: 0.5, fontSize: "1.2rem" }} />
            Search
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
            Search Results
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {loading
              ? `Searching for "${query}"...`
              : `Showing results for "${query}"`}
          </Typography>
        </Box>

        {err && (
          <Alert severity="error" sx={{ mt: 4 }}>
            {err}
          </Alert>
        )}

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 10,
            }}
          >
            <CircularProgress color="primary" size={60} />
          </Box>
        )}

        {!loading && !err && products.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No products found for "{query}"
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try checking your spelling or use different keywords.
            </Typography>
          </Box>
        )}

        {!loading && !err && products.length > 0 && (
          <Grid
            container
            spacing={3}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((product) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={product.id || product._id}
                component={motion.div}
                variants={itemVariants}
              >
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default SearchPage;
