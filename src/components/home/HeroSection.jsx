import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowForward, ShoppingBag, Star } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const heroSlides = [
  {
    id: 1,
    title: "Mega Electronics Sale",
    subtitle: "Up to 70% Off",
    description:
      "Discover extraordinary deals on laptops, headphones, and smart devices.",
    image:
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200",
    buttonText: "Shop Electronics",
    accent: "Deals You Can't Miss",
    gradient: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
  },
  {
    id: 2,
    title: "Fashion Freedom Sale",
    subtitle: "Minimum 50% Off",
    description:
      "Elevate your wardrobe with premium fashion essentials at unbeatable prices.",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
    buttonText: "Explore Fashion",
    accent: "Limited Time Offer",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: 3,
    title: "Home & Kitchen Deals",
    subtitle: "Starting at ₹199",
    description:
      "Upgrade your living space with our curated collection for home and kitchen.",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200",
    buttonText: "Shop Home",
    accent: "New Arrivals",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
];

const HeroBanner = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "90vh", md: "85vh" },
        overflow: "hidden",
        background: heroSlides[currentSlide].gradient,
        display: "flex",
        alignItems: "center",
        // Mask for smooth transition to content below
        WebkitMaskImage:
          "linear-gradient(to bottom, black 80%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
      }}
    >
      {/* Background Elements */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url(${heroSlides[currentSlide].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
        }}
        key={currentSlide}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1 }}
      />

      {/* Floating Decorative Elements */}
      <motion.div
        animate={floatingAnimation}
        style={{
          position: "absolute",
          top: "10%",
          right: "10%",
          width: 100,
          height: 100,
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          backdropFilter: "blur(20px)",
        }}
      />
      <motion.div
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 1 },
        }}
        style={{
          position: "absolute",
          bottom: "20%",
          left: "5%",
          width: 60,
          height: 60,
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "50%",
          backdropFilter: "blur(15px)",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                minHeight: "70vh",
                gap: 6,
              }}
            >
              {/* Content Section */}
              <Box
                sx={{
                  flex: 1,
                  color: "white",
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                <motion.div variants={itemVariants}>
                  <Box
                    sx={{
                      display: "inline-block",
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(20px)",
                      borderRadius: "50px",
                      px: 3,
                      py: 1,
                      mb: 3,
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Star sx={{ fontSize: 16, color: "#FFD700" }} />
                      {heroSlides[currentSlide].accent}
                    </Typography>
                  </Box>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant={isMobile ? "h3" : "h1"}
                    sx={{
                      fontWeight: 900,
                      mb: 2,
                      background: "linear-gradient(45deg, #FFFFFF, #E0E0E0)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1.2,
                    }}
                  >
                    {heroSlides[currentSlide].title}
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 300,
                      mb: 3,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    {heroSlides[currentSlide].subtitle}
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      color: "rgba(255, 255, 255, 0.8)",
                      maxWidth: "500px",
                      fontSize: "1.2rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {heroSlides[currentSlide].description}
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                      justifyContent: { xs: "center", md: "flex-start" },
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate("/products")}
                      sx={{
                        background: "linear-gradient(135deg, #2E7D32, #00695C)",
                        borderRadius: "50px",
                        px: 4,
                        py: 2,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: "0 10px 30px rgba(46, 125, 50, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #388E3C, #00796B)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 15px 40px rgba(46, 125, 50, 0.4)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {heroSlides[currentSlide].buttonText}
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<ShoppingBag />}
                      onClick={() => navigate("/categories")}
                      sx={{
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        color: "white",
                        borderRadius: "50px",
                        px: 4,
                        py: 2,
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        textTransform: "none",
                        backdropFilter: "blur(20px)",
                        background: "rgba(255, 255, 255, 0.1)",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          background: "rgba(255, 255, 255, 0.2)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Browse All
                    </Button>
                  </Box>
                </motion.div>
              </Box>

              {/* Visual Section */}
              <Box
                sx={{
                  flex: 1,
                  position: "relative",
                  display: { xs: "none", md: "block" },
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Box
                    sx={{
                      width: "400px",
                      height: "400px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(20px)",
                      border: "2px solid rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <ShoppingBag
                      sx={{ fontSize: 120, color: "rgba(255, 255, 255, 0.3)" }}
                    />

                    {/* Animated rings */}
                    <Box
                      sx={{
                        position: "absolute",
                        width: "120%",
                        height: "120%",
                        border: "1px dashed rgba(255, 255, 255, 0.2)",
                        borderRadius: "50%",
                        animation: "spin 20s linear infinite",
                      }}
                    />
                  </Box>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Container>

      {/* Slide Indicators */}
      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 2,
          zIndex: 3,
        }}
      >
        {heroSlides.map((_, index) => (
          <Box
            key={index}
            onClick={() => handleSlideChange(index)}
            sx={{
              width: currentSlide === index ? 40 : 12,
              height: 12,
              borderRadius: "6px",
              background:
                currentSlide === index
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(255, 255, 255, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.6)",
              },
            }}
          />
        ))}
      </Box>

      {/* Add rotation keyframes */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default HeroBanner;
