import axios from "axios";
import { getCategoryIcon, getCategoryColor } from "../utils/categoryIcons.js";

// --- CONFIGURATION ---
const RAW_BASE =
  (process.env.REACT_APP_API_URL && String(process.env.REACT_APP_API_URL)) ||
  "http://localhost:5000";

// Ensure no trailing slash on RAW_BASE
const SERVER_URL = RAW_BASE.replace(/\/+$/, "");

const API_PREFIX =
  (process.env.REACT_APP_API_PREFIX &&
    String(process.env.REACT_APP_API_PREFIX)) ||
  "/api";

// --- AXIOS INSTANCE ---
const http = axios.create({
  baseURL: `${SERVER_URL}${API_PREFIX}`, // e.g. http://localhost:5000/api
  withCredentials: true, // ensure cookies are sent
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------- Helpers ---------- */

/**
 * Helper to get full image URL correctly
 * If URL starts with /, prepend server base. If http, leave it.
 */
const getImageUrl = (path) => {
  if (!path) return null;
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  )
    return path;

  // Remove leading slash if present to avoid double slash
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${SERVER_URL}/${cleanPath}`;
};

/* Build query string from object (arrays allowed) */
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

  // Normalize Images
  let imagesObj = [];
  if (Array.isArray(p.images)) {
    imagesObj = p.images.map((img) => ({
      ...img,
      // Use getImageUrl to ensure full path
      fullUrl: getImageUrl(
        img.fullUrl || img.fullImageUrl || img.url || img.imageUrl
      ),
      isPrimary: img.isPrimary || img.is_primary || img.primary || false,
      variantId:
        img.variantId ||
        (img.variant &&
          (typeof img.variant === "object" ? img.variant._id : img.variant)) ||
        null,
    }));
  }
  p.images = imagesObj;

  // Determine Primary Image
  const primaryImg = imagesObj.find((i) => i.isPrimary) || imagesObj[0];

  // Priority: Explicit primary -> First image -> 'image' field -> Placeholder
  if (primaryImg) {
    p.image = primaryImg.fullUrl;
  } else if (p.image) {
    p.image = getImageUrl(p.image);
  } else {
    p.image = "/images/placeholder.webp"; // Ensure you have a placeholder
  }

  // Normalize Stock (Check both fields from backend)
  p.stock = p.totalStock ?? p.stock ?? 0;
  p.inStock = p.stock > 0;

  // Normalize Price & Discount
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

  // Text Fields
  p.name = p.name || p.title || "Untitled Product";
  p.shortDescription = p.shortDescription || p.description || "";
  p.description = p.description || p.longDescription || "";

  // Rating
  p.rating = typeof p.rating === "number" ? p.rating : 0;
  p.reviews = typeof p.reviewCount === "number" ? p.reviewCount : 0;

  // Normalize Variants
  p.variants = (p.variants || []).map((v) => {
    const id = v._id || v.id;
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

    return {
      id,
      _id: id,
      sku: v.sku || null,
      price: v.price ?? null,
      stock: v.currentStock ?? v.stock ?? 0,
      color: colorObj,
      size: sizeObj,
      images: v.images || [], // Variant specific images if any
      raw: v,
    };
  });

  return p;
};

/* ---------- API functions ---------- */

/**
 * Fetch products (list)
 */
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

/**
 * Fetch single product by id
 */
export const fetchProductById = async (id) => {
  if (!id) throw new Error("id required");
  try {
    const { data } = await http.get(`/products/${id}`);
    return data?.data ? normalizeProduct(data.data) : null;
  } catch (err) {
    console.error("fetchProductById error:", err?.message || err);
    return null;
  }
};

/**
 * Fetch product variants (inventory controller)
 */
export const fetchProductVariants = async (productId) => {
  if (!productId) return [];
  try {
    const { data } = await http.get(`/inventory/product-variants/${productId}`);
    const arr = data?.data || [];

    // Normalize variant structure
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
    console.error("fetchProductVariants error:", err?.message || err);
    return [];
  }
};

/**
 * Fetch categories
 */
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
    console.error("fetchCategories error:", err?.message || err);
    return [];
  }
};

/**
 * Fetch brands
 */
export const fetchBrands = async (params = {}) => {
  try {
    const qs = buildQuery(params);
    const { data } = await http.get(`/brands${qs}`);
    return data?.data || [];
  } catch (err) {
    return [];
  }
};

/**
 * Fetch offer products (filter by discount)
 */
export const fetchOfferProducts = async ({
  minDiscount = 30,
  limit = 48,
} = {}) => {
  try {
    // We reuse fetchProducts but filter on client or server depending on API capability
    // For now, assuming client filtering if server param doesn't exist
    const prods = await fetchProducts({ limit });
    return prods.filter((p) => (p.discountPercent || 0) >= minDiscount);
  } catch (err) {
    return [];
  }
};

/**
 * Fetch available coupons
 */
export const fetchAvailableCoupons = async () => {
  try {
    const { data } = await http.get("/promocodes/available");
    return data.data || [];
  } catch {
    return [];
  }
};

/* --- Reviews --- */
export const fetchReviewsForProduct = async (productId, params = {}) => {
  if (!productId) throw new Error("Product ID is required");
  const qs = buildQuery(params);
  try {
    const { data } = await http.get(`/reviews/${productId}${qs}`);
    return data;
  } catch (err) {
    throw err;
  }
};

export const submitReview = async (productId, reviewData) => {
  if (!productId) throw new Error("Product ID is required");
  try {
    const { data } = await http.post(`/reviews/${productId}`, reviewData);
    return data;
  } catch (err) {
    throw err;
  }
};

/* ---------- Export ---------- */
const api = {
  // Raw axios methods
  post: http.post.bind(http),
  get: http.get.bind(http),
  put: http.put ? http.put.bind(http) : undefined,
  delete: http.delete ? http.delete.bind(http) : undefined,

  // Domain methods
  fetchProducts,
  fetchProductById,
  fetchProductVariants,
  fetchCategories,
  fetchBrands,
  fetchOfferProducts,
  fetchAvailableCoupons,
  fetchReviewsForProduct,
  submitReview,

  // Helpers
  buildQuery,
  getImageUrl,
  normalizeProduct,
};

export default api;
