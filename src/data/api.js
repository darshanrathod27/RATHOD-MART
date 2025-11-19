import axios from "axios";
import { getCategoryIcon, getCategoryColor } from "../utils/categoryIcons.js";

// --- CONFIGURATION ---
const RAW_BASE =
  (process.env.REACT_APP_API_URL && String(process.env.REACT_APP_API_URL)) ||
  "http://localhost:5000";

const SERVER_URL = RAW_BASE.replace(/\/+$/, "");

const API_PREFIX =
  (process.env.REACT_APP_API_PREFIX &&
    String(process.env.REACT_APP_API_PREFIX)) ||
  "/api";

// --- AXIOS INSTANCE ---
const http = axios.create({
  baseURL: `${SERVER_URL}${API_PREFIX}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------- Helpers ---------- */

const getImageUrl = (path) => {
  if (!path) return null;
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  )
    return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${SERVER_URL}/${cleanPath}`;
};

const buildQuery = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      v.forEach((val) => sp.append(k, val));
    } else {
      sp.append(k, String(v));
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
};

/* Normalize backend product for UI */
const normalizeProduct = (raw = {}) => {
  const p = { ...raw };
  p.id = p._id || p.id;

  // 1. Normalize ALL Images first
  let allImages = [];
  if (Array.isArray(p.images)) {
    allImages = p.images.map((img) => ({
      ...img,
      fullUrl: getImageUrl(
        img.fullUrl || img.fullImageUrl || img.url || img.imageUrl
      ),
      isPrimary: img.isPrimary || img.is_primary || img.primary || false,
      // Robustly get variant ID string
      variantId:
        img.variantId ||
        (img.variant &&
          (typeof img.variant === "object" ? img.variant._id : img.variant)) ||
        null,
    }));
  }
  p.images = allImages;

  // 2. Determine Primary Image
  const primaryImg = allImages.find((i) => i.isPrimary) || allImages[0];
  p.image = primaryImg
    ? primaryImg.fullUrl
    : getImageUrl(p.image) || "/images/placeholder.webp";

  // 3. Separate General Images (Images NOT linked to any variant)
  // These are shown by default or if a variant has no specific images
  p.generalImages = allImages
    .filter((img) => !img.variantId)
    .map((img) => img.fullUrl);

  // Fallback: if no general images, use the main image
  if (p.generalImages.length === 0 && p.image) {
    p.generalImages = [p.image];
  }

  // Normalize Stock
  p.stock = p.totalStock ?? p.stock ?? 0;
  p.inStock = p.stock > 0;

  // Normalize Price
  p.price = p.discountPrice ?? p.basePrice ?? 0;
  p.originalPrice =
    p.discountPrice && p.discountPrice < p.basePrice ? p.basePrice : null;

  if (typeof p.discountPercent !== "number") {
    if (
      p.basePrice > 0 &&
      p.discountPrice > 0 &&
      p.discountPrice < p.basePrice
    ) {
      p.discountPercent = Math.round(
        ((p.basePrice - p.discountPrice) / p.basePrice) * 100
      );
    } else {
      p.discountPercent = 0;
    }
  }

  p.name = p.name || p.title || "Untitled Product";
  p.shortDescription = p.shortDescription || p.description || "";
  p.description = p.description || p.longDescription || "";
  p.rating = typeof p.rating === "number" ? p.rating : 0;
  p.reviews = typeof p.reviewCount === "number" ? p.reviewCount : 0;

  // 4. Normalize Variants and ATTACH specific images
  p.variants = (p.variants || []).map((v) => {
    const id = v._id || v.id;
    const vIdString = String(id);

    const colorObj = v.color
      ? typeof v.color === "object"
        ? {
            name: v.color.name || v.color.colorName || "",
            value: v.color.value || "",
          }
        : { name: v.color, value: "" }
      : null;

    const sizeObj = v.size
      ? typeof v.size === "object"
        ? {
            name: v.size.name || v.size.sizeName || "",
            value: v.size.value || "",
          }
        : { name: v.size, value: "" }
      : null;

    // **CRITICAL FIX:** Filter images specifically for this variant ID
    const variantSpecificImages = allImages
      .filter((img) => String(img.variantId) === vIdString)
      .map((img) => img.fullUrl);

    return {
      id,
      _id: id,
      sku: v.sku || null,
      price: v.price ?? null,
      stock: v.currentStock ?? v.stock ?? 0,
      color: colorObj,
      size: sizeObj,
      // Use specific images if found, otherwise empty (UI will fallback to general)
      images: variantSpecificImages,
      raw: v,
    };
  });

  return p;
};

/* ---------- API functions ---------- */

export const fetchProducts = async (params = {}) => {
  const qs = buildQuery(params);
  try {
    const { data } = await http.get(`/products${qs}`);
    const arr = data?.data || [];
    return arr.map(normalizeProduct);
  } catch (err) {
    console.error("fetchProducts error:", err?.message || err);
    return [];
  }
};

export const fetchProductById = async (id) => {
  if (!id) throw new Error("id required");
  try {
    const { data } = await http.get(`/products/${id}`);
    return data?.data ? normalizeProduct(data.data) : null;
  } catch (err) {
    return null;
  }
};

export const fetchProductVariants = async (productId) => {
  if (!productId) return [];
  try {
    const { data } = await http.get(`/inventory/product-variants/${productId}`);
    const arr = data?.data || [];

    return arr.map((v) => {
      const id = v._id || v.id;
      const color =
        v.color && typeof v.color === "object"
          ? {
              name: v.color.colorName || v.color.name || "",
              value: v.color.value || "",
            }
          : { name: "N/A", value: "" };

      const size =
        v.size && typeof v.size === "object"
          ? {
              name: v.size.sizeName || v.size.name || "",
              value: v.size.value || "",
            }
          : { name: "N/A", value: "" };

      return {
        id,
        _id: id,
        sku: v.sku || null,
        price: v.price ?? null,
        stock: v.currentStock ?? v.stock ?? 0,
        color,
        size,
        raw: v,
      };
    });
  } catch (err) {
    return [];
  }
};

export const fetchCategories = async (params = {}) => {
  const qs = buildQuery(params);
  try {
    const { data } = await http.get(`/categories${qs}`);
    const arr = data?.data || [];
    return arr.map((cat) => ({
      id: cat._id,
      _id: cat._id,
      name: cat.name,
      icon: cat.icon || getCategoryIcon(cat.name),
      color: cat.color || getCategoryColor(cat.name),
      count: cat.productsCount || 0,
      slug: cat.slug,
    }));
  } catch (err) {
    return [];
  }
};

export const fetchBrands = async (params = {}) => {
  try {
    const qs = buildQuery(params);
    const { data } = await http.get(`/brands${qs}`);
    return data?.data || [];
  } catch (err) {
    return [];
  }
};

export const fetchOfferProducts = async ({
  minDiscount = 30,
  limit = 48,
} = {}) => {
  try {
    const prods = await fetchProducts({ limit });
    return prods.filter((p) => (p.discountPercent || 0) >= minDiscount);
  } catch (err) {
    return [];
  }
};

export const fetchAvailableCoupons = async () => {
  try {
    const { data } = await http.get("/promocodes/available");
    return data.data || [];
  } catch {
    return [];
  }
};

export const fetchReviewsForProduct = async (productId, params = {}) => {
  const qs = buildQuery(params);
  try {
    const { data } = await http.get(`/reviews/${productId}${qs}`);
    return data;
  } catch (err) {
    throw err;
  }
};

export const submitReview = async (productId, reviewData) => {
  try {
    const { data } = await http.post(`/reviews/${productId}`, reviewData);
    return data;
  } catch (err) {
    throw err;
  }
};

const api = {
  post: http.post.bind(http),
  get: http.get.bind(http),
  put: http.put ? http.put.bind(http) : undefined,
  delete: http.delete ? http.delete.bind(http) : undefined,
  fetchProducts,
  fetchProductById,
  fetchProductVariants,
  fetchCategories,
  fetchBrands,
  fetchOfferProducts,
  fetchAvailableCoupons,
  fetchReviewsForProduct,
  submitReview,
  buildQuery,
  getImageUrl,
  normalizeProduct,
};

export default api;
