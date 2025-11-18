// src/pages/Profile.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";
import {
  CameraAlt,
  Save,
  Person,
  DeleteOutline,
  Home,
  Lock,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import api from "../data/api";
import { setCredentials } from "../store/authSlice"; // To update state after save

const API_BASE =
  (process.env.REACT_APP_API_URL && String(process.env.REACT_APP_API_URL)) ||
  "http://localhost:5000";

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  // Format date for input type=date (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      birthday: "",
      password: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
      },
    },
  });

  const [preview, setPreview] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);

  // Helper to get full image URL
  const getAvatarUrl = (relative) => {
    if (!relative) return null;
    return relative.startsWith("http") ? relative : `${API_BASE}${relative}`;
  };

  useEffect(() => {
    if (userInfo) {
      reset({
        name: userInfo.name || "",
        username: userInfo.username || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        birthday: formatDateForInput(userInfo.birthday),
        password: "",
        address: {
          street: userInfo.address?.street || "",
          city: userInfo.address?.city || "",
          state: userInfo.address?.state || "",
          postalCode: userInfo.address?.postalCode || "",
          country: userInfo.address?.country || "India",
        },
      });
      setPreview(getAvatarUrl(userInfo.profileImage));
    }
  }, [userInfo, reset]);

  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles?.[0]) return;
    const f = acceptedFiles[0];
    setPreview(URL.createObjectURL(f));
    setFileBlob(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const removeImage = () => {
    setPreview(null);
    setFileBlob(null);
  };

  const onSubmit = async (values) => {
    setLoading(true);
    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("username", values.username);
    fd.append("phone", values.phone);
    if (values.birthday) fd.append("birthday", values.birthday);
    if (values.password) fd.append("password", values.password);

    // Append nested address fields
    if (values.address) {
      fd.append("address[street]", values.address.street || "");
      fd.append("address[city]", values.address.city || "");
      fd.append("address[state]", values.address.state || "");
      fd.append("address[postalCode]", values.address.postalCode || "");
      fd.append("address[country]", values.address.country || "");
    }

    if (fileBlob) {
      fd.append("image", fileBlob); // 'image' field from middleware
    }

    try {
      // Use the new PUT /api/users/profile route
      const res = await api.put("/users/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(setCredentials(res.data)); // Update Redux state
      toast.success("Profile updated successfully!");
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "primary.dark",
            }}
          >
            <Person sx={{ fontSize: "2.5rem" }} />
            My Profile
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
            >
              Profile Picture
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 3,
                cursor: "pointer",
                transition: "all 0.3s ease",
                bgcolor: "background.default",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <input {...getInputProps()} />
              <Avatar
                src={preview}
                sx={{ width: 100, height: 100, bgcolor: "primary.light" }}
              />
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {isDragActive
                    ? "Drop image here..."
                    : "Change Profile Picture"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag & drop or click to browse (Max 5MB)
                </Typography>
                {preview && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutline />}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove Image
                  </Button>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
            >
              Personal Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Username"
                  {...register("username")}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  {...register("email")}
                  fullWidth
                  disabled
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  {...register("phone")}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Birthday"
                  type="date"
                  {...register("birthday")}
                  error={!!errors.birthday}
                  helperText={errors.birthday?.message}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
            >
              <Home sx={{ mb: -0.5, mr: 0.5 }} />
              Shipping Address
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Street Address"
                  {...register("address.street")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="City"
                  {...register("address.city")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="State"
                  {...register("address.state")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Postal Code"
                  {...register("address.postalCode")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Country"
                  {...register("address.country")}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
            >
              <Lock sx={{ mb: -0.5, mr: 0.5 }} />
              Security
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="New Password (optional)"
                  type="password"
                  {...register("password")}
                  error={!!errors.password}
                  helperText="Leave blank to keep your current password"
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* Actions */}
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Save />}
                disabled={loading || isSubmitting}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Grid>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Profile;
