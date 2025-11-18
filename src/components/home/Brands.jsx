import React, { useEffect, useRef } from "react";
import { Box, Container, Card } from "@mui/material";
import { motion } from "framer-motion";
import { brands } from "../../data/products";
import "./Brands.css";

const Brands = () => {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      addAnimation(scroller);
    }
  }, []);

  function addAnimation(scroller) {
    scroller.setAttribute("data-animated", true);

    const scrollerInner = scroller.querySelector(".scroller__inner");
    const scrollerContent = Array.from(scrollerInner.children);

    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      scrollerInner.appendChild(duplicatedItem);
    });
  }

  return (
    <Box className="brands-section" sx={{ py: 3 }}>
      <Container maxWidth="xl">
        <Box ref={scrollerRef} className="brand-scroller">
          <Box className="scroller__inner">
            {brands.map((brand) => (
              <Card
                key={brand.id}
                className="brand-logo-card"
                component={motion.div}
                whileHover={{
                  scale: 1.02, // Sirf scale animation rakha hai
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="brand-logo-img"
                />
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Brands;
