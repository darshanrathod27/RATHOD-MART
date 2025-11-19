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
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button, // ✅ Added missing import
} from "@mui/material";
import { Home, NavigateNext, Search } from "@mui/icons-material"; // Removed unused 'Tune'
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/home/ProductCard";
import api from "../data/api";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("relevance");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchResults = async () => {
      try {
        // Pass advanced search query
        const data = await api.fetchProducts({
          search: query,
          limit: 50,
          sortBy: sortBy === "price_low" ? "basePrice" : "createdAt",
          sortOrder: sortBy === "price_low" ? "asc" : "desc",
        });
        setProducts(data || []);
        setErr(null);
      } catch (e) {
        setErr("Something went wrong while searching.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, sortBy]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        pt: { xs: 10, md: 14 },
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
            color="inherit"
            onClick={() => navigate("/")}
            sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" /> Home
          </Link>
          <Typography color="text.primary">Search Results</Typography>
        </Breadcrumbs>

        {/* Header & Sort */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { sm: "center" },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                color="primary.dark"
                gutterBottom
              >
                {loading ? "Searching..." : `Results for "${query}"`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {products.length} items found matching your criteria
              </Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="newest">Newest Arrivals</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {err && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {err}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {products.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Search sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No matches found
                </Typography>
                <Typography color="text.secondary">
                  Try checking your spelling or using more general terms.
                </Typography>
                <Button
                  onClick={() => navigate("/")}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Go Back Home
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {products.map((product, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={product._id}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default SearchPage;
