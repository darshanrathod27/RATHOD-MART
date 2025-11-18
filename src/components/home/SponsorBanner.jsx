import React, { useState, useEffect } from "react";
import { Card, Typography, Box, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const sponsors = [
  {
    name: "Foodie's Delight",
    tagline: "Fresh Flavors Delivered",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    bgColor: "linear-gradient(145deg, #f0f4c3, #e6ee9c)",
    textColor: "#33691e",
    btnColor: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
  },
  {
    name: "Tech Guru",
    tagline: "Your Daily Tech Dose",
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400",
    bgColor: "linear-gradient(145deg, #e3f2fd, #bbdefb)",
    textColor: "#0d47a1",
    btnColor: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
  },
  {
    name: "Style Hub",
    tagline: "Dress to Impress",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
    bgColor: "linear-gradient(145deg, #fce4ec, #f8bbd0)",
    textColor: "#880e4f",
    btnColor: "linear-gradient(135deg, #c2185b 0%, #e91e63 100%)",
  },
];

const SponsorBanner = () => {
  const [currentSponsor, setCurrentSponsor] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSponsor((prev) => (prev + 1) % sponsors.length);
    }, 4000); // Change sponsor every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const sponsor = sponsors[currentSponsor];

  return (
    <motion.div whileHover={{ y: -5 }} style={{ height: "100%" }}>
      <Card
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          background: sponsor.bgColor,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSponsor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={sponsor.image}
              alt={sponsor.name}
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
                mb: 2,
                border: "4px solid white",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: sponsor.textColor,
                fontSize: "1.1rem",
              }}
            >
              {sponsor.tagline}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 2, color: sponsor.textColor }}
            >
              Sponsored by {sponsor.name}
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{
                background: sponsor.btnColor,
                borderRadius: "50px",
              }}
            >
              Learn More
            </Button>
          </motion.div>
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default SponsorBanner;
