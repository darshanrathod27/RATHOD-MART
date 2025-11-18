// File: rathod-mart/RATHOD-MART.../src/data/api.js
import axios from "axios";
// --- ADD THIS IMPORT ---
import { getCategoryIcon, getCategoryColor } from "../utils/categoryIcons.js";

/**
 * CRA env:
 * REACT_APP_API_URL    -> e.g. http://localhost:5000
 * REACT_APP_API_PREFIX -> e.g. /api (default /api)
 */
const RAW_BASE =
  (process.env.REACT_APP_API_URL && String(process.env.REACT_APP_API_URL)) ||
  "http://localhost:5000";

const API_BASE = RAW_BASE.replace(/\/+$/, "");
const API_PREFIX =
  (process.env.REACT_APP_API_PREFIX &&
    String(process.env.REACT_APP_API_PREFIX)) ||
  "/api";

const http = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`, // => http://localhost:5000/api
  withCredentials: true, // ensure cookies (session) are sent for auth endpoints
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------- Helpers ---------- */

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

/* Make any relative image path absolute */
const ensureFullUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

/* Normalize backend product for UI */
const normalizeProduct = (raw = {}) => {
  const p = { ...raw };
  p.id = p._id || p.id;

  // images -> objects with fullUrl and other metadata
  let imagesObj = [];
  if (Array.isArray(p.images)) {
    imagesObj = p.images.map((img) => {
      const c = { ...(img || {}) };
      c.fullUrl =
        c.fullUrl ||
        c.fullImageUrl ||
        ensureFullUrl(c.url) ||
        ensureFullUrl(c.imageUrl) ||
        null;
      c.variantId =
        c.variantId ||
        (c.variant &&
          (typeof c.variant === "object"
            ? c.variant._id || c.variant
            : c.variant)) ||
        null;
      c.isPrimary = c.isPrimary || c.is_primary || c.primary || false;
      return c;
    });
  }

  p.images = imagesObj;

  // choose primary image
  const primaryImg = imagesObj.find((i) => i.isPrimary) || imagesObj[0] || null;
  if (p.primaryImageFullUrl) {
    p.image = p.primaryImageFullUrl;
  } else if (p.primaryImage) {
    p.image = ensureFullUrl(p.primaryImage);
  } else if (primaryImg) {
    p.image = primaryImg.fullUrl || null;
  } else if (p.image) {
    p.image = ensureFullUrl(p.image);
  } else {
    p.image = null;
  }

  // discountPercent
  if (typeof p.discount === "number") {
    p.discountPercent = p.discount;
  } else if (
    typeof p.basePrice === "number" &&
    typeof p.discountPrice === "number" &&
    p.basePrice > 0
  ) {
    const pct = Math.round((1 - p.discountPrice / p.basePrice) * 100);
    p.discountPercent = pct > 0 ? pct : 0;
  } else {
    p.discountPercent = 0;
  }

  p.name = p.name || p.title || "Untitled product";
  p.shortDescription = p.shortDescription || p.description || "";
  p.description = p.description || p.longDescription || "";

  // price fields
  p.price = p.discountPrice ?? p.basePrice ?? null;
  p.originalPrice =
    typeof p.discountPrice === "number" && p.discountPrice < p.basePrice
      ? p.basePrice
      : null;

  // stock
  p.stock = p.totalStock ?? p.stock ?? 0;
  p.inStock = (p.totalStock ?? p.stock ?? 0) > 0;

  // rating & reviews
  p.rating = typeof p.rating === "number" ? p.rating : p.avgRating ?? 0;
  p.reviews =
    typeof p.reviewCount === "number" ? p.reviewCount : p.reviews || 0;

  // variants
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

    const vImages = imagesObj
      .filter((img) => {
        if (!img.variantId) return false;
        try {
          return String(img.variantId) === String(id);
        } catch {
          return false;
        }
      })
      .map((img) => img.fullUrl)
      .filter(Boolean);

    return {
      id,
      _id: id,
      sku: v.sku || v.SKU || null,
      price: v.price ?? null,
      stock: v.currentStock ?? v.stock ?? 0,
      color: colorObj,
      size: sizeObj,
      images: vImages,
      raw: v,
    };
  });

  // generalImages = images not tied to variant
  p.generalImages = imagesObj
    .filter((img) => !img.variantId)
    .map((img) => img.fullUrl)
    .filter(Boolean);

  p.imagesUrls = imagesObj.map((im) => im.fullUrl).filter(Boolean) || [];

  return p;
};

/* ---------- API functions ---------- */

/**
 * Fetch products (list)
 * params: { page, limit, q, category, brand, sort, etc. }
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
 * expected endpoint: GET /inventory/product-variants/:productId
 */
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
              name: v.color.sizeName || v.color.name || v.color.colorName || "",
              value: v.color.value || "",
            }
          : v.color
          ? { name: v.color, value: "" }
          : null;
      const size =
        v.size && typeof v.size === "object"
          ? {
              name: v.size.sizeName || v.size.name || "",
              value: v.size.value || "",
            }
          : v.size
          ? { name: v.size, value: "" }
          : null;
      return {
        id,
        _id: id,
        sku: v.sku || v.SKU || null,
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

// --- REPLACE THIS FUNCTION ---
/**
 * Fetch categories
 */
export const fetchCategories = async (params = {}) => {
  const qs = buildQuery(params);
  try {
    const { data } = await http.get(`/categories${qs}`);
    const arr = data?.data || [];

    // Normalize backend data to match frontend expectations
    return arr.map((cat) => ({
      id: cat._id, // Use _id as the main id
      _id: cat._id,
      name: cat.name,
      // Use backend icon/color first, or fallback to the utility function
      icon: cat.icon || getCategoryIcon(cat.name),
      color: cat.color || getCategoryColor(cat.name),
      // Use the product count from the backend
      count: cat.productsCount || 0,
      slug: cat.slug,
    }));
  } catch (err) {
    console.error("fetchCategories error:", err?.message || err);
    return [];
  }
};
// --- END OF REPLACED FUNCTION ---

/**
 * Fetch brands
 */
export const fetchBrands = async (params = {}) => {
  try {
    const qs = buildQuery(params);
    const { data } = await http.get(`/brands${qs}`);
    return data?.data || [];
  } catch (err) {
    console.error("fetchBrands error:", err?.message || err);
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
    const prods = await fetchProducts({ limit });
    return prods.filter((p) => (p.discountPercent || 0) >= minDiscount);
  } catch (err) {
    console.error("fetchOfferProducts error:", err?.message || err);
    return [];
  }
};

/* --- Reviews --- */
/**
 * Get all approved reviews for a product
 * returns raw response (data, pagination)
 */
export const fetchReviewsForProduct = async (productId, params = {}) => {
  if (!productId) throw new Error("Product ID is required");
  const qs = buildQuery(params);
  try {
    const { data } = await http.get(`/reviews/${productId}${qs}`);
    return data;
  } catch (err) {
    console.error("fetchReviewsForProduct error:", err?.message || err);
    throw err;
  }
};

/**
 * Submit a new review for a product
 */
export const submitReview = async (productId, reviewData) => {
  if (!productId) throw new Error("Product ID is required");
  try {
    const { data } = await http.post(`/reviews/${productId}`, reviewData);
    return data;
  } catch (err) {
    console.error("submitReview error:", err?.message || err);
    throw err;
  }
};

/* ---------- Expose simple http methods + helpers ---------- */
const api = {
  // raw axios helpers (useful for auth endpoints like /users/login, /users/logout)
  post: http.post.bind(http),
  get: http.get.bind(http),
  put: http.put ? http.put.bind(http) : undefined,
  delete: http.delete ? http.delete.bind(http) : undefined,

  // domain-specific functions
  fetchProducts,
  fetchProductById,
  fetchProductVariants,
  fetchCategories,
  fetchBrands,
  fetchOfferProducts,
  fetchReviewsForProduct,
  submitReview,
  // helpers if needed externally
  buildQuery,
  ensureFullUrl,
  normalizeProduct,
};

export default api;
