// src/components/common/AuthDrawer.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { Close, Login, AppRegistration } from "@mui/icons-material";
import { closeLoginDrawer } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";

const AuthDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoginDrawerOpen } = useSelector((state) => state.auth);

  const handleClose = () => {
    dispatch(closeLoginDrawer());
  };

  const handleNavigate = (path) => {
    handleClose();
    navigate(path);
  };

  return (
    <Drawer
      anchor="right"
      open={isLoginDrawerOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 350 },
          p: 3,
          background: "#fff",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="700" color="primary">
          Welcome
        </Typography>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Please login or register to manage your wishlist, cart, and orders.
      </Typography>

      <Stack spacing={2}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Login />}
          onClick={() => handleNavigate("/login")}
          sx={{
            borderRadius: 50,
            py: 1.5,
            background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
          }}
        >
          Login
        </Button>
        <Divider>OR</Divider>
        <Button
          variant="outlined"
          size="large"
          startIcon={<AppRegistration />}
          onClick={() => handleNavigate("/register")}
          sx={{
            borderRadius: 50,
            py: 1.5,
            borderColor: "#2E7D32",
            color: "#2E7D32",
          }}
        >
          Create Account
        </Button>
      </Stack>
    </Drawer>
  );
};

export default AuthDrawer;
