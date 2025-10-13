import React, { useRef } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { products } from "../../data/products";
import ProductCard from "./ProductCard";
import "./ProductAnimations.css";

const FeaturedProducts = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <Box
      ref={ref}
      component={motion.section}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      className="featured-products-section"
      sx={{ py: 8, bgcolor: "#fafafa" }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 1,
              fontFamily: "'Playfair Display', 'Georgia', serif",
              background:
                "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "2rem", md: "2.8rem" },
              letterSpacing: "-0.5px",
            }}
          >
            Featured Collection
          </Typography>
          <Typography
            sx={{
              color: "#666",
              fontSize: "1.15rem",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              letterSpacing: "0.5px",
            }}
          >
            Discover Our Handpicked Premium Selection
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {products.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedProducts;
