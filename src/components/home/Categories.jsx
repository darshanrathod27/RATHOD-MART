// File: rathod-mart/RATHOD-MART.../src/components/home/Categories.jsx
import React, { useRef, useState, useEffect } from "react"; // <-- MODIFIED
import { Box, Container, Typography, IconButton } from "@mui/material";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
// import { categories } from "../../data/products"; // <-- DELETED
import api from "../../data/api"; // <-- ADDED
import "./Categories.css";

const Categories = () => {
  const scrollerRef = useRef(null);
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // --- ADDED ---
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  // --- END ---

  const x = useMotionValue(0);
  const scale = useTransform(x, [-100, 0, 100], [0.98, 1, 0.98]);

  // --- ADDED: Data fetching logic ---
  useEffect(() => {
    let mounted = true;
    api
      .fetchCategories({ limit: 20, sortBy: "productsCount" }) // Fetch top 20 by product count
      .then((data) => {
        if (mounted) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Failed to fetch categories", err))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);
  // --- END ---

  const checkScrollButtons = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const scrollAmount = direction === "left" ? -400 : 400;
    const target = scroller.scrollLeft + scrollAmount;

    animate(scroller.scrollLeft, target, {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (latest) => {
        scroller.scrollLeft = latest;
        checkScrollButtons();
      },
    });
  };
  const handleCategoryClick = (categoryId, categoryName) => {
    if (!isDragging) {
      // --- MODIFIED: Use correct path from App.jsx ---
      navigate(`/category?category=${categoryId}`);
    }
  };

  const handleDragStart = (e) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    setIsDragging(true);
    setDragStart(e.type.includes("mouse") ? e.pageX : e.touches[0].pageX);
    setScrollStart(scroller.scrollLeft);
    scroller.style.cursor = "grabbing";
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    const diff = dragStart - currentX;

    scroller.scrollLeft = scrollStart + diff;
    x.set(-diff);
    checkScrollButtons();
  };

  const handleDragEnd = () => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.style.cursor = "grab";
    }

    setTimeout(() => {
      setIsDragging(false);
      x.set(0);
    }, 100);
  };

  return (
    <Box className="categories-section" id="categories-section">
      {" "}
      {/* Added ID for scrolling */}
      <Container maxWidth="xl">
        {/* Header with Navigation Buttons */}
        {/* ... (Your commented out header) ... */}

        {/* Categories Scroller */}
        <Box className="categories-wrapper">
          <Box
            ref={scrollerRef}
            className="category-scroller"
            onScroll={checkScrollButtons}
          >
            <Box
              className="category-scroller__inner"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              {/* --- ADDED: Loading check --- */}
              {loading && (
                <Box sx={{ p: 4, color: "text.secondary" }}>
                  Loading categories...
                </Box>
              )}
              {categories.map((category, index) => (
                <motion.div
                  key={category.id} // <-- Uses API data
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  whileHover={{
                    scale: 1.03,
                    y: -4,
                    transition: {
                      duration: 0.3,
                      ease: [0.34, 1.56, 0.64, 1],
                    },
                  }}
                  whileTap={{
                    scale: 0.98,
                    transition: { duration: 0.15 },
                  }}
                  style={{ scale }}
                >
                  <Box
                    className="category-card"
                    onClick={
                      () => handleCategoryClick(category.id, category.name) // <-- Uses API data
                    }
                    sx={{
                      "--category-color": category.color, // <-- Uses API data
                      "--category-color-light": `${category.color}10`, // <-- Uses API data
                      "--category-color-border": `${category.color}40`, // <-- Uses API data
                    }}
                  >
                    {/* ... (Glow and Shine effects) ... */}
                    <Box className="category-glow" />
                    <Box className="category-shine" />

                    {/* Icon */}
                    <motion.div
                      className="category-icon-wrapper"
                      whileHover={{
                        rotate: [0, -10, 10, -10, 0],
                        transition: {
                          duration: 0.5,
                          ease: "easeInOut",
                        },
                      }}
                    >
                      <Typography className="category-icon">
                        {category.icon} {/* <-- Uses API data */}
                      </Typography>
                    </motion.div>

                    {/* Text Content */}
                    <Box className="category-text">
                      <Typography className="category-name">
                        {category.name} {/* <-- Uses API data */}
                      </Typography>
                      <Typography className="category-count">
                        {category.count} Products {/* <-- Uses API data */}
                      </Typography>
                    </Box>

                    {/* ... (Particle effects) ... */}
                    <Box className="category-particles">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="particle"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                            y: [0, -40],
                            x: [0, (Math.random() - 0.5) * 30],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.25,
                            ease: "easeOut",
                          }}
                          style={{
                            left: `${15 + i * 12}%`,
                            bottom: "10px",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Categories;
