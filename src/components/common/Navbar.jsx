import React, { useState, useEffect, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  InputBase,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  ListItemIcon,
  ListItemText,
  Fade,
  Tooltip,
  Drawer,
  List,
  ListItem,
  Container,
} from "@mui/material";
import {
  Search,
  ShoppingCart,
  FavoriteBorder,
  AccountCircle,
  Menu as MenuIcon,
  Store,
  Category,
  TrendingUp,
  FilterList,
  Close,
  Home as HomeIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useDebounce } from "../../hooks/useDebounce";
import AdvancedFilterDrawer from "../filter/AdvancedFilterDrawer";

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { getCartItemsCount, openCart } = useCart();
  const { getWishlistItemsCount, openWishlist } = useWishlist();

  const cartItemCount = getCartItemsCount();
  const wishlistItemCount = getWishlistItemsCount();

  const [searchValue, setSearchValue] = useState("");
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceRange: [0, 100000],
    ratings: [],
    discounts: [],
    inStock: false,
    sortBy: "featured",
  });

  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const headerVariants = {
    scrolled: {
      background: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(15px)",
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.07)",
      borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
    },
    top: {
      background: "rgba(255, 255, 255, 0.5)",
      backdropFilter: "blur(10px)",
      boxShadow: "none",
      borderBottom: `1px solid rgba(0, 0, 0, 0.05)`,
    },
  };

  useEffect(() => {
    const handleScrollEvent = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScrollEvent);
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

  useEffect(() => {
    if (debouncedSearch && debouncedSearch.length > 1) {
      const mockSuggestions = [
        "Premium Headphones",
        "Smart Watch Pro",
        "Wireless Earbuds",
      ];
      setSearchSuggestions(
        mockSuggestions.filter((item) =>
          item.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      );
    } else {
      setSearchSuggestions([]);
    }
  }, [debouncedSearch]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchValue.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
        setSearchValue("");
        setIsSearchFocused(false);
      }
    },
    [searchValue, navigate]
  );

  const handleNavClick = (item) => {
    item.action();
    setActiveLink(item.name);
  };

  const handleScrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navigationItems = [
    {
      name: "Home",
      path: "/",
      icon: <HomeIcon />,
      action: () => navigate("/"),
    },
    {
      name: "Categories",
      path: "#categories",
      icon: <Category />,
      action: () => handleScrollToSection("categories-section"),
    },
    {
      name: "Trending",
      path: "#trending",
      icon: <TrendingUp />,
      action: () => handleScrollToSection("trending-section"),
    },
  ];

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
    // Navigate to home with filter state
    navigate("/", { state: { filters: newFilters, applyFilters: true } });
  };

  const MobileDrawer = (
    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      sx={{ "& .MuiDrawer-paper": { width: 280, background: "#fff" } }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          Rathod Mart
        </Typography>
        <IconButton onClick={() => setMobileOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem
            button
            key={item.name}
            onClick={() => {
              item.action();
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        component={motion.header}
        animate={isScrolled ? "scrolled" : "top"}
        variants={headerVariants}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: "70px" }}>
            {/* Logo */}
            <Box
              onClick={() => navigate("/")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mr: 2,
                cursor: "pointer",
              }}
            >
              <Store sx={{ color: "primary.main", fontSize: 32 }} />
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: { xs: "none", sm: "block" },
                }}
              >
                Rathod Mart
              </Typography>
            </Box>

            {/* Desktop Menu */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {navigationItems.map((item) => {
                  const isActive =
                    activeLink === item.name || activeLink === item.path;
                  return (
                    <Button
                      key={item.name}
                      onClick={() => handleNavClick(item)}
                      className="nav-link"
                      sx={{
                        color: "text.primary",
                        fontWeight: 500,
                        px: 1.5,
                        position: "relative",
                        paddingBottom: "8px",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          width: isActive ? "80%" : "0%",
                          height: "2px",
                          bottom: "4px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background:
                            "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                          transition: "width 0.3s ease-in-out",
                        },
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "primary.main",
                        },
                      }}
                    >
                      {item.name}
                    </Button>
                  );
                })}
              </Box>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Search Bar */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                position: "relative",
                width: { xs: "100%", md: "auto" },
                maxWidth: 400,
                mx: 2,
              }}
            >
              <motion.div
                animate={{ scale: isSearchFocused ? 1.02 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  sx={{
                    position: "relative",
                    background:
                      theme.palette.mode === "light"
                        ? "rgba(241, 248, 233, 0.8)"
                        : "rgba(0,0,0,0.2)",
                    borderRadius: 50,
                    border: `1px solid ${
                      isSearchFocused
                        ? theme.palette.primary.main
                        : "transparent"
                    }`,
                    boxShadow: isSearchFocused
                      ? `0 0 12px ${theme.palette.primary.main}50`
                      : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <InputBase
                    placeholder="Search products..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsSearchFocused(false), 200)
                    }
                    startAdornment={
                      <Search sx={{ mx: 1, color: "text.secondary" }} />
                    }
                    sx={{ width: "100%", py: 0.5, fontSize: "0.95rem" }}
                  />
                </Box>
              </motion.div>
              <AnimatePresence>
                {isSearchFocused && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      position: "absolute",
                      top: "110%",
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                    }}
                  >
                    <Box
                      sx={{
                        background: "background.paper",
                        borderRadius: 3,
                        boxShadow: 5,
                        overflow: "hidden",
                      }}
                    >
                      {searchSuggestions.map((suggestion) => (
                        <MenuItem
                          key={suggestion}
                          onClick={() => {
                            setSearchValue(suggestion);
                            navigate(
                              `/search?q=${encodeURIComponent(suggestion)}`
                            );
                            setIsSearchFocused(false);
                          }}
                        >
                          {suggestion}
                        </MenuItem>
                      ))}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>

            {/* Right Side Icons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Filter Button */}
              <Tooltip title="Filters">
                <motion.div whileHover={{ scale: 1.1 }}>
                  <IconButton
                    onClick={() => setIsFilterOpen(true)}
                    sx={{
                      color: "#2E7D32",
                      transition: "all 0.3s",
                      "&:hover": {
                        bgcolor: "#E8F5E9",
                      },
                    }}
                  >
                    <FilterList />
                  </IconButton>
                </motion.div>
              </Tooltip>

              {/* Wishlist */}
              <Tooltip title="Wishlist">
                <motion.div whileHover={{ scale: 1.1 }}>
                  <IconButton
                    onClick={openWishlist}
                    aria-label="Open wishlist"
                    sx={{
                      color: "text.primary",
                      position: "relative",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        color: "#E91E63",
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <Badge
                      badgeContent={wishlistItemCount}
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          right: -3,
                          top: -3,
                          border: "2px solid white",
                          padding: "0 4px",
                          minWidth: 20,
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        },
                      }}
                    >
                      <FavoriteBorder />
                    </Badge>
                  </IconButton>
                </motion.div>
              </Tooltip>

              {/* Cart */}
              <Tooltip title="Shopping Cart">
                <motion.div whileHover={{ scale: 1.1 }}>
                  <IconButton
                    onClick={openCart}
                    aria-label="Open shopping cart"
                    sx={{
                      color: "text.primary",
                      position: "relative",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        color: "primary.main",
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <Badge
                      badgeContent={cartItemCount}
                      color="primary"
                      sx={{
                        "& .MuiBadge-badge": {
                          right: -3,
                          top: -3,
                          border: "2px solid white",
                          padding: "0 4px",
                          minWidth: 20,
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        },
                      }}
                    >
                      <ShoppingCart />
                    </Badge>
                  </IconButton>
                </motion.div>
              </Tooltip>

              {/* Account */}
              <Tooltip title="Account">
                <motion.div whileHover={{ scale: 1.1 }}>
                  <IconButton
                    onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                    aria-label="Open user menu"
                    sx={{
                      color: "text.primary",
                      transition: "color 0.2s ease-in-out",
                      "&:hover": {
                        color: "primary.main",
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <AccountCircle />
                  </IconButton>
                </motion.div>
              </Tooltip>

              {/* Mobile Menu */}
              {isMobile && (
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open mobile menu"
                  sx={{ color: "text.primary" }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {MobileDrawer}

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            mt: 2,
            borderRadius: 3,
            minWidth: 220,
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            navigate("/profile");
            setUserMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setUserMenuAnchor(null)}>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Filter Drawer */}
      <AdvancedFilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
};

export default Navbar;
