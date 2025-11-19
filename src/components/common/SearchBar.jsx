// src/components/common/SearchBar.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  InputBase,
  Paper,
  Typography,
  List,
  // ListItem, // ✅ Removed unused
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  IconButton,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  // History, // ✅ Removed unused
  TrendingUp,
  Category,
  Store,
  Close,
  NorthWest,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../../hooks/useDebounce";
import api from "../../data/api";

const API_BASE =
  (process.env.REACT_APP_API_URL && String(process.env.REACT_APP_API_URL)) ||
  "http://localhost:5000";

const SearchBar = ({ categories = [] }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
  });
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions({ products: [], categories: [] });
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const matchedCats = categories
          .filter((c) =>
            c.name.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
          .slice(0, 3);

        const products = await api.fetchProducts({
          search: debouncedQuery,
          limit: 5,
        });

        setSuggestions({
          categories: matchedCats,
          products: products || [],
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, categories]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsFocused(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  };

  return (
    <Box
      ref={wrapperRef}
      component="form"
      onSubmit={handleSubmit}
      sx={{
        position: "relative",
        width: { xs: "100%", md: 500 },
        maxWidth: "100%",
        zIndex: 1200,
      }}
    >
      <Paper
        elevation={isFocused ? 4 : 0}
        sx={{
          p: "2px 15px",
          display: "flex",
          alignItems: "center",
          borderRadius: "50px",
          border: `1px solid ${
            isFocused ? theme.palette.primary.main : "rgba(0,0,0,0.1)"
          }`,
          bgcolor: isFocused ? "background.paper" : "rgba(255,255,255,0.9)",
          transition: "all 0.3s ease",
          height: 48,
        }}
      >
        <Search color={isFocused ? "primary" : "action"} />
        <InputBase
          sx={{ ml: 2, flex: 1, fontSize: "1rem" }}
          placeholder="Search for products, brands and more..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        {query && (
          <IconButton onClick={() => setQuery("")} size="small" sx={{ p: 0.5 }}>
            <Close fontSize="small" />
          </IconButton>
        )}
        {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
      </Paper>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              right: 0,
            }}
          >
            <Paper
              elevation={8}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                maxHeight: "80vh",
                overflowY: "auto",
                bgcolor: "background.paper",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {!query && (
                <Box sx={{ p: 2.5 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontWeight: 600,
                    }}
                  >
                    <TrendingUp fontSize="small" color="primary" /> Trending Now
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {[
                      "Smartphones",
                      "Running Shoes",
                      "Wireless Earbuds",
                      "Kurtas",
                      "Home Decor",
                    ].map((tag) => (
                      <Box
                        key={tag}
                        onClick={() => {
                          setQuery(tag);
                          navigate(`/search?q=${encodeURIComponent(tag)}`);
                          setIsFocused(false);
                        }}
                        sx={{
                          px: 2.5,
                          py: 0.8,
                          bgcolor: "rgba(46, 125, 50, 0.08)",
                          borderRadius: 50,
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          color: "primary.dark",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {query && (
                <List disablePadding>
                  {suggestions.categories.length > 0 && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          display: "block",
                          bgcolor: "#f9fafb",
                          fontWeight: 700,
                          color: "text.secondary",
                          letterSpacing: 0.5,
                        }}
                      >
                        CATEGORIES
                      </Typography>
                      {suggestions.categories.map((cat) => (
                        <ListItemButton
                          key={cat.id}
                          onClick={() => {
                            navigate(`/category?category=${cat.id}`);
                            setIsFocused(false);
                          }}
                          sx={{ px: 2.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Category fontSize="small" color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={cat.name}
                            primaryTypographyProps={{ fontWeight: 500 }}
                            secondary="Browse Category"
                          />
                          <NorthWest
                            fontSize="small"
                            color="action"
                            sx={{ transform: "rotate(90deg)", opacity: 0.5 }}
                          />
                        </ListItemButton>
                      ))}
                      <Divider />
                    </>
                  )}

                  {suggestions.products.length > 0 && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          display: "block",
                          bgcolor: "#f9fafb",
                          fontWeight: 700,
                          color: "text.secondary",
                          letterSpacing: 0.5,
                        }}
                      >
                        PRODUCTS
                      </Typography>
                      {suggestions.products.map((prod) => (
                        <ListItemButton
                          key={prod._id}
                          onClick={() => {
                            navigate(`/product/${prod._id}`);
                            setIsFocused(false);
                          }}
                          sx={{ px: 2.5, py: 1 }}
                        >
                          <ListItemIcon sx={{ minWidth: 56 }}>
                            <Avatar
                              variant="rounded"
                              src={getImageUrl(prod.primaryImage || prod.image)}
                              alt={prod.name}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: "grey.100",
                              }}
                            >
                              <Store />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                                sx={{ maxWidth: 300 }}
                              >
                                {prod.name}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {prod.brand ? `${prod.brand} • ` : ""}{" "}
                                {prod.category?.name || "Item"}
                              </Typography>
                            }
                          />
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="primary.main"
                          >
                            ₹
                            {(
                              prod.discountPrice || prod.basePrice
                            ).toLocaleString()}
                          </Typography>
                        </ListItemButton>
                      ))}
                    </>
                  )}

                  {!loading &&
                    suggestions.categories.length === 0 &&
                    suggestions.products.length === 0 && (
                      <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          No results found for "<strong>{query}</strong>"
                        </Typography>
                      </Box>
                    )}

                  {(suggestions.products.length > 0 ||
                    suggestions.categories.length > 0) && (
                    <ListItemButton
                      sx={{
                        justifyContent: "center",
                        bgcolor: "primary.50",
                        py: 1.5,
                        "&:hover": { bgcolor: "primary.100" },
                      }}
                      onClick={handleSubmit}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="primary.dark"
                      >
                        See all results for "{query}"
                      </Typography>
                    </ListItemButton>
                  )}
                </List>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SearchBar;
