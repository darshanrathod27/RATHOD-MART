import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Chip,
  Slider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { FilterList, Close } from "@mui/icons-material";
import { categories, products } from "../../data/products";

const allBrands = [...new Set(products.map((p) => p.brand || ""))].filter(
  Boolean
);
const allRatings = [5, 4, 3, 2];
const minPrice = Math.min(...products.map((p) => p.price || 0));
const maxPrice = Math.max(...products.map((p) => p.price || 1));

const defaultFilters = {
  categories: [],
  brands: [],
  price: [minPrice, maxPrice],
  ratings: [],
  discounts: [],
  inStock: false,
};

const AdvancedFilterDrawer = ({ open, onClose, filters, setFilters }) => {
  const [tempFilters, setTempFilters] = useState(filters || defaultFilters);

  // Handlers
  const handleCategory = (id) => {
    setTempFilters((f) => ({
      ...f,
      categories: f.categories.includes(id)
        ? f.categories.filter((x) => x !== id)
        : [...f.categories, id],
    }));
  };
  const handleBrand = (brand) => {
    setTempFilters((f) => ({
      ...f,
      brands: f.brands.includes(brand)
        ? f.brands.filter((x) => x !== brand)
        : [...f.brands, brand],
    }));
  };
  const handleRating = (rating) => {
    setTempFilters((f) => ({
      ...f,
      ratings: f.ratings.includes(rating)
        ? f.ratings.filter((x) => x !== rating)
        : [...f.ratings, rating],
    }));
  };
  const handleDiscount = (range) => {
    setTempFilters((f) => ({
      ...f,
      discounts: f.discounts.includes(range)
        ? f.discounts.filter((x) => x !== range)
        : [...f.discounts, range],
    }));
  };
  const handlePrice = (_, newValue) =>
    setTempFilters({ ...tempFilters, price: newValue });
  const handleStock = () =>
    setTempFilters((f) => ({ ...f, inStock: !f.inStock }));
  const handleApply = () => {
    setFilters(tempFilters);
    onClose && onClose();
  };
  const handleReset = () => setTempFilters(defaultFilters);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 360,
          borderTopRightRadius: 38,
          borderBottomRightRadius: 38,
          background: "linear-gradient(160deg,#e8f5e9 0,#f1f8e9 97%)",
          boxShadow: "0 8px 40px 12px rgba(46,125,50,0.13)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          py: 2,
          bgcolor: "#2E7D32",
          color: "#fff",
        }}
      >
        <FilterList sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
          Advanced Filters
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
        <Typography sx={{ mt: 1, mb: 1.5, fontWeight: 700 }}>
          Category
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              clickable
              color={
                tempFilters.categories.includes(c.id) ? "success" : "default"
              }
              onClick={() => handleCategory(c.id)}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Box>
        <Typography sx={{ mt: 3, mb: 1.5, fontWeight: 700 }}>Brand</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {allBrands.map((b) => (
            <Chip
              key={b}
              label={b}
              clickable
              color={tempFilters.brands.includes(b) ? "success" : "default"}
              onClick={() => handleBrand(b)}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Box>
        <Typography sx={{ mt: 3, mb: 1.5, fontWeight: 700 }}>Price</Typography>
        <Slider
          value={tempFilters.price}
          onChange={handlePrice}
          valueLabelDisplay="auto"
          min={minPrice}
          max={maxPrice}
          sx={{ color: "#2E7D32" }}
        />
        <Typography sx={{ mt: 3, mb: 1.5, fontWeight: 700 }}>Rating</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {allRatings.map((r) => (
            <Chip
              key={r}
              label={"★".repeat(r)}
              clickable
              variant={tempFilters.ratings.includes(r) ? "filled" : "outlined"}
              onClick={() => handleRating(r)}
            />
          ))}
        </Box>
        <Typography sx={{ mt: 3, mb: 1.5, fontWeight: 700 }}>
          Discount
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {[10, 20, 30, 40, 50].map((d) => (
            <Chip
              key={d}
              label={d + "%+"}
              clickable
              color={tempFilters.discounts.includes(d) ? "success" : "default"}
              onClick={() => handleDiscount(d)}
            />
          ))}
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={tempFilters.inStock}
              onChange={handleStock}
              sx={{ color: "#2E7D32" }}
            />
          }
          label="In stock only"
        />
      </Box>
      <Divider />
      <Box
        sx={{ p: 2, display: "flex", justifyContent: "space-between", gap: 2 }}
      >
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{ borderColor: "#2E7D32", color: "#2E7D32", fontWeight: 700 }}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          sx={{ bgcolor: "#2E7D32", fontWeight: 700 }}
        >
          Apply
        </Button>
      </Box>
    </Drawer>
  );
};

export default AdvancedFilterDrawer;
