import React from "react";
import { Box, Container, Grid } from "@mui/material";
import OfferGridCard from "./OfferGridCard";
import SponsorBanner from "./SponsorBanner";
import { products } from "../../data/products";

const DealGrids = () => {
  const electronicsBestsellers = products
    .filter((p) => p.category === "Electronics")
    .slice(0, 4);
  const fashionDeals = products
    .filter((p) => p.category === "Fashion")
    .slice(0, 4);
  const homeEssentials = products
    .filter((p) => p.category === "Home")
    .slice(0, 4);
  const beautyPicks = products
    .filter((p) => p.category === "Beauty")
    .slice(0, 4);

  return (
    <Box sx={{ mt: -16, mb: 4, position: "relative", zIndex: 10 }}>
      <Container maxWidth="xl">
        <Grid container spacing={2.5}>
          {/* Main Deal Cards */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}>
                <OfferGridCard
                  title="Up to 50% off | Electronics"
                  products={electronicsBestsellers}
                  linkText="See all deals"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <OfferGridCard
                  title="Revamp your style | Fashion"
                  products={fashionDeals}
                  linkText="Explore more"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <OfferGridCard
                  title="Sign in for Best Experience"
                  isSignIn={true}
                />
              </Grid>
            </Grid>
          </Grid>
          {/* Sponsor Section */}
          <Grid item xs={12} md={3}>
            <SponsorBanner />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DealGrids;
