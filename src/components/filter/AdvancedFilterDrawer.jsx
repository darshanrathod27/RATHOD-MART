import React, { useState, useMemo } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  TextField,
  Badge,
} from "@mui/material";
import {
  FilterList,
  Close,
  ExpandMore,
  TuneOutlined,
  LocalOfferOutlined,
  StarOutlined,
  CategoryOutlined,
  MonetizationOnOutlined,
  InventoryOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { categories, products } from "../../data/products";

// Extract unique values from products
const allBrands = [
  ...new Set(products.map((p) => p.brand).filter(Boolean)),
].sort();
const allRatings = [5, 4, 3, 2, 1];
const minPrice = Math.min(...products.map((p) => p.price || 0));
const maxPrice = Math.max(...products.map((p) => p.price || 100000));

const defaultFilters = {
  categories: [],
  brands: [],
  priceRange: [minPrice, maxPrice],
  ratings: [],
  discounts: [],
  inStock: false,
  sortBy: "featured",
};

const AdvancedFilterDrawer = ({ open, onClose, filters, setFilters }) => {
  const [tempFilters, setTempFilters] = useState(filters || defaultFilters);
  const [expanded, setExpanded] = useState(["categories", "price"]);

  // Toggle handlers
  const toggleCategory = (id) => {
    setTempFilters((f) => ({
      ...f,
      categories: f.categories.includes(id)
        ? f.categories.filter((x) => x !== id)
        : [...f.categories, id],
    }));
  };

  const toggleBrand = (brand) => {
    setTempFilters((f) => ({
      ...f,
      brands: f.brands.includes(brand)
        ? f.brands.filter((x) => x !== brand)
        : [...f.brands, brand],
    }));
  };

  const toggleRating = (rating) => {
    setTempFilters((f) => ({
      ...f,
      ratings: f.ratings.includes(rating)
        ? f.ratings.filter((x) => x !== rating)
        : [...f.ratings, rating],
    }));
  };

  const toggleDiscount = (range) => {
    setTempFilters((f) => ({
      ...f,
      discounts: f.discounts.includes(range)
        ? f.discounts.filter((x) => x !== range)
        : [...f.discounts, range],
    }));
  };

  const handlePriceChange = (_, newValue) => {
    setTempFilters({ ...tempFilters, priceRange: newValue });
  };

  const handleStockToggle = () => {
    setTempFilters((f) => ({ ...f, inStock: !f.inStock }));
  };

  const handleSortChange = (e) => {
    setTempFilters({ ...tempFilters, sortBy: e.target.value });
  };

  const handleAccordionChange = (panel) => (_, isExpanded) => {
    setExpanded(
      isExpanded ? [...expanded, panel] : expanded.filter((p) => p !== panel)
    );
  };

  const handleApply = () => {
    setFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters(defaultFilters);
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (tempFilters.categories.length > 0)
      count += tempFilters.categories.length;
    if (tempFilters.brands.length > 0) count += tempFilters.brands.length;
    if (tempFilters.ratings.length > 0) count += tempFilters.ratings.length;
    if (tempFilters.discounts.length > 0) count += tempFilters.discounts.length;
    if (tempFilters.inStock) count += 1;
    if (
      tempFilters.priceRange[0] !== minPrice ||
      tempFilters.priceRange[1] !== maxPrice
    )
      count += 1;
    return count;
  }, [tempFilters]);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        component: motion.div,
        initial: { x: -400 },
        animate: { x: 0 },
        exit: { x: -400 },
        transition: { type: "spring", damping: 25, stiffness: 200 },
        sx: {
          width: { xs: "85%", sm: 380 },
          maxWidth: 400,
          borderTopRightRadius: 32,
          borderBottomRightRadius: 32,
          background:
            "linear-gradient(165deg, #e8f5e9 0%, #f1f8e9 50%, #e8f5e9 100%)",
          boxShadow: "0 20px 60px rgba(46, 125, 50, 0.25)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)",
          color: "#fff",
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TuneOutlined sx={{ fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: 0.5 }}
            >
              Advanced Filters
            </Typography>
            {activeFiltersCount > 0 && (
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}{" "}
                active
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </Box>

      {/* Filter Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#2E7D32",
            borderRadius: "10px",
          },
        }}
      >
        {/* Sort By */}
        <Accordion
          expanded={expanded.includes("sort")}
          onChange={handleAccordionChange("sort")}
          sx={{
            mb: 1.5,
            borderRadius: 3,
            "&:before": { display: "none" },
            boxShadow: "0 2px 8px rgba(46,125,50,0.08)",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterList sx={{ color: "#2E7D32", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 700 }}>Sort By</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <RadioGroup value={tempFilters.sortBy} onChange={handleSortChange}>
              <FormControlLabel
                value="featured"
                control={<Radio sx={{ color: "#2E7D32" }} />}
                label="Featured"
              />
              <FormControlLabel
                value="priceLowHigh"
                control={<Radio sx={{ color: "#2E7D32" }} />}
                label="Price: Low to High"
              />
              <FormControlLabel
                value="priceHighLow"
                control={<Radio sx={{ color: "#2E7D32" }} />}
                label="Price: High to Low"
              />
              <FormControlLabel
                value="rating"
                control={<Radio sx={{ color: "#2E7D32" }} />}
                label="Highest Rated"
              />
              <FormControlLabel
                value="discount"
                control={<Radio sx={{ color: "#2E7D32" }} />}
                label="Biggest Discount"
              />
            </RadioGroup>
          </AccordionDetails>
        </Accordion>

        {/* Categories */}
        <Accordion
          expanded={expanded.includes("categories")}
          onChange={handleAccordionChange("categories")}
          sx={{
            mb: 1.5,
            borderRadius: 3,
            "&:before": { display: "none" },
            boxShadow: "0 2px 8px rgba(46,125,50,0.08)",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CategoryOutlined sx={{ color: "#2E7D32", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 700 }}>Category</Typography>
              {tempFilters.categories.length > 0 && (
                <Badge
                  badgeContent={tempFilters.categories.length}
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={`${cat.icon} ${cat.name}`}
                  clickable
                  onClick={() => toggleCategory(cat.id)}
                  color={
                    tempFilters.categories.includes(cat.id)
                      ? "success"
                      : "default"
                  }
                  sx={{
                    fontWeight: 600,
                    transition: "all 0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Price Range */}
        <Accordion
          expanded={expanded.includes("price")}
          onChange={handleAccordionChange("price")}
          sx={{
            mb: 1.5,
            borderRadius: 3,
            "&:before": { display: "none" },
            boxShadow: "0 2px 8px rgba(46,125,50,0.08)",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MonetizationOnOutlined sx={{ color: "#2E7D32", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 700 }}>Price Range</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ px: 1 }}>
              <Slider
                value={tempFilters.priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={minPrice}
                max={maxPrice}
                sx={{
                  color: "#2E7D32",
                  "& .MuiSlider-thumb": {
                    width: 20,
                    height: 20,
                    boxShadow: "0 2px 8px rgba(46,125,50,0.3)",
                  },
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                }}
              >
                <TextField
                  size="small"
                  label="Min"
                  value={tempFilters.priceRange[0]}
                  InputProps={{ readOnly: true }}
                  sx={{ width: "48%" }}
                />
                <TextField
                  size="small"
                  label="Max"
                  value={tempFilters.priceRange[1]}
                  InputProps={{ readOnly: true }}
                  sx={{ width: "48%" }}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Brands */}
        <Accordion
          expanded={expanded.includes("brands")}
          onChange={handleAccordionChange("brands")}
          sx={{
            mb: 1.5,
            borderRadius: 3,
            "&:before": { display: "none" },
            boxShadow: "0 2px 8px rgba(46,125,50,0.08)",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InventoryOutlined sx={{ color: "#2E7D32", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 700 }}>Brand</Typography>
              {tempFilters.brands.length > 0 && (
                <Badge
                  badgeContent={tempFilters.brands.length}
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {allBrands.map((brand) => (
                <Chip
                  key={brand}
                  label={brand}
                  clickable
                  onClick={() => toggleBrand(brand)}
                  color={
                    tempFilters.brands.includes(brand) ? "success" : "default"
                  }
                  variant={
                    tempFilters.brands.includes(brand) ? "filled" : "outlined"
                  }
                  sx={{
                    fontWeight: 600,
                    transition: "all 0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Ratings */}
        <Accordion
          expanded={expanded.includes("rating")}
          onChange={handleAccordionChange("rating")}
          sx={{
            mb: 1.5,
            borderRadius: 3,
            "&:before": { display: "none" },
            boxShadow: "0 2px 8px rgba(46,125,50,0.08)",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StarOutlined sx={{ color: "#2E7D32", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 700 }}>Rating</Typography>
              {tempFilters.ratings.length > 0 && (
                <Badge
                  badgeContent={tempFilters.ratings.length}
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {allRatings.map((rating) => (
                <Chip
                  key={rating}
                  label={`${"⭐".repeat(rating)} & up`}
                  clickable
                  onClick={() => toggleRating(rating)}
                  color={
                    tempFilters.ratings.includes(rating) ? "success" : "default"
                  }
                  sx={{
                    fontWeight: 600,
                    transition: "all 0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Discount */}
        <Accordion
          expanded={expanded.includes("discount")}
          onChange={handleAccordionChange("discount")}
          sx={{
            mb: 1.5,
            borderRadius: 3,
            "&:before": { display: "none" },
            boxShadow: "0 2px 8px rgba(46,125,50,0.08)",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocalOfferOutlined sx={{ color: "#2E7D32", fontSize: 22 }} />
              <Typography sx={{ fontWeight: 700 }}>Discount</Typography>
              {tempFilters.discounts.length > 0 && (
                <Badge
                  badgeContent={tempFilters.discounts.length}
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {[10, 20, 30, 40, 50].map((discount) => (
                <Chip
                  key={discount}
                  label={`${discount}% & above`}
                  clickable
                  onClick={() => toggleDiscount(discount)}
                  color={
                    tempFilters.discounts.includes(discount)
                      ? "success"
                      : "default"
                  }
                  sx={{
                    fontWeight: 600,
                    transition: "all 0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Stock Availability */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(46,125,50,0.08)",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={tempFilters.inStock}
                onChange={handleStockToggle}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#2E7D32" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#2E7D32",
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontWeight: 600 }}>In Stock Only</Typography>
            }
          />
        </Box>
      </Box>

      {/* Footer Actions */}
      <Divider />
      <Box
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          background: "#fff",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleReset}
          fullWidth
          sx={{
            borderRadius: 50,
            borderColor: "#2E7D32",
            color: "#2E7D32",
            fontWeight: 700,
            py: 1.5,
            "&:hover": {
              borderColor: "#1B5E20",
              bgcolor: "#f1f8e9",
            },
          }}
        >
          Clear All
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          fullWidth
          sx={{
            borderRadius: 50,
            background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
            fontWeight: 700,
            py: 1.5,
            boxShadow: "0 4px 15px rgba(46,125,50,0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
              boxShadow: "0 6px 20px rgba(46,125,50,0.4)",
            },
          }}
        >
          Apply Filters
        </Button>
      </Box>
    </Drawer>
  );
};

export default AdvancedFilterDrawer;
