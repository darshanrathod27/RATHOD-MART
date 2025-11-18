import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Grid,
  useTheme,
  Stack,
  Fab,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Instagram,
  Twitter,
  YouTube,
  LinkedIn,
  Email,
  Phone,
  Store,
  ArrowUpward,
} from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, [showScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const socialIcons = [
    { icon: <Instagram />, color: "#E4405F", name: "Instagram" },
    { icon: <Twitter />, color: "#1DA1F2", name: "Twitter" },
    { icon: <YouTube />, color: "#FF0000", name: "YouTube" },
    { icon: <LinkedIn />, color: "#0077B5", name: "LinkedIn" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <Box sx={{ mt: 6, position: "relative" }}>
      {/* Main Footer */}
      <Box
        component="footer"
        sx={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(0, 191, 165, 0.1) 0%, #1B5E20 40%)",
          color: "rgba(255, 255, 255, 0.8)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Box sx={{ py: 5 }}>
              <Grid container spacing={4} alignItems="center">
                {/* Brand Section */}
                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Store sx={{ color: "#00BFA5", fontSize: 32 }} />
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: "white",
                            fontSize: { xs: "1.5rem", md: "1.8rem" },
                          }}
                        >
                          Rathod Mart
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "1rem",
                          fontWeight: 500,
                        }}
                      >
                        Premium shopping experience
                      </Typography>
                    </Stack>
                  </motion.div>
                </Grid>

                {/* Contact Info */}
                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Stack
                      spacing={1.5}
                      alignItems={{ xs: "center", md: "center" }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Email sx={{ color: "#00BFA5", fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                          info@rathodmart.com
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Phone sx={{ color: "#00BFA5", fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                          +91 12345 67890
                        </Typography>
                      </Box>
                    </Stack>
                  </motion.div>
                </Grid>

                {/* Social Media */}
                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Box sx={{ textAlign: { xs: "center", md: "right" } }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: "white",
                          fontSize: "1.1rem",
                        }}
                      >
                        Follow Us
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: { xs: "center", md: "flex-end" },
                          gap: 1,
                        }}
                      >
                        {socialIcons.map((social, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.15, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                          >
                            <IconButton
                              sx={{
                                width: 40,
                                height: 40,
                                background: "rgba(255, 255, 255, 0.1)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                color: social.color,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  background: "rgba(255, 255, 255, 0.2)",
                                  boxShadow: `0 4px 15px ${social.color}40`,
                                },
                              }}
                              aria-label={social.name}
                            >
                              {social.icon}
                            </IconButton>
                          </motion.div>
                        ))}
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>

              {/* Copyright */}
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "0.85rem",
                    }}
                  >
                    © 2025 Rathod Mart. All rights reserved.
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Back to Top Floating Button */}
      <AnimatePresence>
        {showScroll && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Fab
              onClick={scrollToTop}
              sx={{
                position: "fixed",
                bottom: 30,
                right: 30,
                background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                color: "white",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #388E3C 0%, #00796B 100%)",
                  transform: "scale(1.1)",
                },
                transition: "transform 0.2s ease-in-out",
              }}
              aria-label="scroll back to top"
            >
              <ArrowUpward />
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Footer;
