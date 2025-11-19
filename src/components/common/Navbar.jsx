// src/components/common/Navbar.jsx
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
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
  Avatar,
} from "@mui/material";
import {
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
  Logout as LogoutIcon,
  Settings,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import AdvancedFilterDrawer from "../filter/AdvancedFilterDrawer";
import SearchBar from "./SearchBar"; // ✅ Using the new SearchBar component

import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "../../store/authSlice";
import api from "../../data/api";
import toast from "react-hot-toast";

const API_BASE =
  (process.env.REACT_APP_API_URL && String(process.env.REACT_APP_API_URL)) ||
  "http://localhost:5000";

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { getCartItemsCount, openCart } = useCart();
  const { getWishlistItemsCount, openWishlist } = useWishlist();
  const dispatch = useDispatch();
  const { isAuthenticated, userInfo } = useSelector(
    (state) => state.auth || {}
  );

  const cartItemCount = getCartItemsCount();
  const wishlistItemCount = getWishlistItemsCount();

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(location.pathname);

  // Filter State
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

  const [navCategories, setNavCategories] = useState([]);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);

  const getAvatarUrl = (relative) => {
    if (!relative) return null;
    return relative.startsWith("http") ? relative : `${API_BASE}${relative}`;
  };

  useEffect(() => {
    if (
      location.pathname === "/category" &&
      location.search.includes("trending=true")
    ) {
      setActiveLink("Trending");
    } else {
      setActiveLink(location.pathname);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScrollEvent = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScrollEvent);
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

  // Fetch Categories for Dropdown & SearchBar
  useEffect(() => {
    api
      .fetchCategories({ limit: 50, sortBy: "name", sortOrder: "asc" })
      .then((data) => setNavCategories(data))
      .catch((err) => console.error("Failed to fetch nav categories", err));
  }, []);

  const handleNavClick = (item, e) => {
    if (item.action) item.action(e);
    if (item.name === "Trending") setActiveLink("Trending");
    else if (item.name !== "Categories") setActiveLink(item.name);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
    navigate("/", { state: { filters: newFilters, applyFilters: true } });
  };

  const handleLogout = async () => {
    setUserMenuAnchor(null);
    try {
      await api.post("/users/logout");
      dispatch(logoutAction());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
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
      icon: <Category />,
      action: (e) => setCategoryMenuAnchor(e.currentTarget),
    },
    {
      name: "Trending",
      icon: <TrendingUp />,
      action: () => navigate("/category?trending=true"),
    },
  ];

  const headerVariants = {
    scrolled: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
    },
    top: {
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      boxShadow: "none",
    },
  };

  return (
    <>
      <AppBar
        position="fixed"
        component={motion.header}
        animate={isScrolled ? "scrolled" : "top"}
        variants={headerVariants}
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ minHeight: { xs: "64px", md: "74px" }, gap: 2 }}
          >
            {/* Logo */}
            <Box
              onClick={() => navigate("/")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                mr: 1,
              }}
            >
              <Store
                sx={{ color: "primary.main", fontSize: { xs: 28, md: 32 } }}
              />
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: { xs: "none", sm: "block" },
                  letterSpacing: "-0.5px",
                }}
              >
                Rathod Mart
              </Typography>
            </Box>

            {/* Desktop Nav Links */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 1 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.name}
                    onClick={(e) => handleNavClick(item, e)}
                    startIcon={item.icon}
                    sx={{
                      color:
                        activeLink === item.name || activeLink === item.path
                          ? "primary.main"
                          : "text.secondary",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: "primary.50",
                        color: "primary.main",
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* ✅ ADVANCED SEARCH BAR HERE */}
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                mx: 2,
              }}
            >
              <SearchBar categories={navCategories} />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Right Actions */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, md: 1.5 },
              }}
            >
              <Tooltip title="Filters">
                <IconButton
                  onClick={() => setIsFilterOpen(true)}
                  sx={{ color: "primary.main", bgcolor: "primary.50" }}
                >
                  <FilterList />
                </IconButton>
              </Tooltip>

              <Tooltip title="Wishlist">
                <IconButton onClick={openWishlist}>
                  <Badge badgeContent={wishlistItemCount} color="error">
                    <FavoriteBorder />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Cart">
                <IconButton onClick={openCart}>
                  <Badge badgeContent={cartItemCount} color="primary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Profile">
                <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                  {isAuthenticated && userInfo?.profileImage ? (
                    <Avatar
                      src={getAvatarUrl(userInfo.profileImage)}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              </Tooltip>

              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawers & Menus */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: 280 } }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" color="primary" fontWeight={700}>
            Menu
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

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
            boxShadow: theme.shadows[4],
          },
        }}
      >
        {isAuthenticated
          ? [
              <MenuItem
                key="prof"
                onClick={() => {
                  navigate("/profile");
                  setUserMenuAnchor(null);
                }}
              >
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>{" "}
                Profile
              </MenuItem>,
              <MenuItem
                key="set"
                onClick={() => {
                  navigate("/profile");
                  setUserMenuAnchor(null);
                }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>{" "}
                Settings
              </MenuItem>,
              <Divider key="div" />,
              <MenuItem key="out" onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>{" "}
                Logout
              </MenuItem>,
            ]
          : [
              <MenuItem
                key="in"
                onClick={() => {
                  navigate("/login");
                  setUserMenuAnchor(null);
                }}
              >
                Login
              </MenuItem>,
              <MenuItem
                key="up"
                onClick={() => {
                  navigate("/register");
                  setUserMenuAnchor(null);
                }}
              >
                Register
              </MenuItem>,
            ]}
      </Menu>

      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => setCategoryMenuAnchor(null)}
        PaperProps={{
          sx: { mt: 1.5, borderRadius: 2, minWidth: 250, maxHeight: 400 },
        }}
      >
        {navCategories.map((cat) => (
          <MenuItem
            key={cat.id}
            onClick={() => {
              navigate(`/category?category=${cat.id}`);
              setCategoryMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <Typography sx={{ fontSize: "1.2rem" }}>{cat.icon}</Typography>
            </ListItemIcon>
            <ListItemText primary={cat.name} />
          </MenuItem>
        ))}
      </Menu>

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
