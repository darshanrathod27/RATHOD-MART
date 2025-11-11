// rathod-mart/src/components/home/DealGrids.jsx
import React, { useState, useEffect } from "react";
import { Box, Container, Grid } from "@mui/material";
import OfferGridCard from "./OfferGridCard";
import SponsorBanner from "./SponsorBanner";
// --- NEW ---
import { useSelector } from "react-redux";
import api from "../../data/api";
// --- END NEW ---

// Helper function to get N random items from an array
function getRandomItems(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

const DealGrids = () => {
  // --- NEW: Get auth state ---
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);

  // --- NEW: State for dynamic deals ---
  const [dynamicDeals, setDynamicDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDynamicDeals = async () => {
      try {
        setLoading(true);
        // 1. Fetch categories (e.g., top 10 with most products)
        const categories = await api.fetchCategories({
          limit: 10,
          sortBy: "productsCount",
        });

        // 2. Filter categories that have products and pick 2 random ones
        const validCategories = categories.filter((cat) => cat.count > 0);
        const randomCategories = getRandomItems(validCategories, 2);

        // 3. Fetch 4 products for each random category
        const deals = await Promise.all(
          randomCategories.map(async (category) => {
            const products = await api.fetchProducts({
              category: category.id,
              limit: 4,
            });
            return {
              title: `Top Deals in ${category.name}`,
              linkText: "See all deals",
              products: products,
            };
          })
        );
        setDynamicDeals(deals);
      } catch (err) {
        console.error("Failed to fetch dynamic deals", err);
        // Fallback to static data on error if you want
      } finally {
        setLoading(false);
      }
    };
    fetchDynamicDeals();
  }, []);
  // --- END NEW ---

  return (
    <Box sx={{ mt: -16, mb: 4, position: "relative", zIndex: 10 }}>
      <Container maxWidth="xl">
        <Grid container spacing={2.5}>
          {/* Main Deal Cards */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={2.5}>
              {/* --- NEW: Dynamic Deals --- */}
              {loading
                ? // You can put a shimmer/skeleton loader here
                  [...Array(2)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <OfferGridCard
                        title="Loading Deals..."
                        products={[]}
                        linkText=""
                      />
                    </Grid>
                  ))
                : dynamicDeals.map((deal, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <OfferGridCard
                        title={deal.title}
                        products={deal.products}
                        linkText={deal.linkText}
                      />
                    </Grid>
                  ))}
              {/* --- END NEW --- */}

              <Grid item xs={12} sm={6} md={4}>
                <OfferGridCard
                  isSignIn={true}
                  // --- NEW: Pass auth state ---
                  isAuthenticated={isAuthenticated}
                  userInfo={userInfo}
                  // --- END NEW ---
                />
              </Grid>
            </Grid>
          </Grid>
          {/* Sponsor Section (Unchanged) */}
          <Grid item xs={12} md={3}>
            <SponsorBanner />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DealGrids;
