// src/data/api.js
import axios from "axios";

/**
 * CRA env:
 *   REACT_APP_API_URL    -> e.g. http://localhost:5000
 *   REACT_APP_API_PREFIX -> e.g. /api (default /api)
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
  withCredentials: false,
});

/* Build query string from object (arrays allowed) */
const buildQuery = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) v.forEach((val) => sp.append(k, val));
    else sp.append(k, String(v));
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

  // ensure images are objects with fullUrl and keep variant/variantId if present
  let imagesObj = [];
  if (Array.isArray(p.images)) {
    imagesObj = p.images.map((img) => {
      const c = { ...(img || {}) };
      // prefer existing fullUrl fields, otherwise make full url from url
      c.fullUrl =
        c.fullUrl ||
        c.fullImageUrl ||
        ensureFullUrl(c.url) ||
        ensureFullUrl(c.imageUrl) ||
        null;
      // variant identification — backend may send variantId or variant
      c.variantId =
        c.variantId ||
        (c.variant &&
          (typeof c.variant === "object"
            ? c.variant._id || c.variant
            : c.variant)) ||
        null;
      // keep other fields like isPrimary if available
      c.isPrimary = c.isPrimary || c.is_primary || c.primary || false;
      return c;
    });
  }

  p.images = imagesObj;

  // select primary image
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

  // discountPercent (keep original logic)
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

  // === PRICE FIX ===
  // frontend expects `price`, backend gives basePrice & discountPrice
  p.price = p.discountPrice ?? p.basePrice ?? null;
  p.originalPrice =
    typeof p.discountPrice === "number" && p.discountPrice < p.basePrice
      ? p.basePrice
      : null;

  // === STOCK / IN-STOCK FIX ===
  // prefer totalStock, fallback to stock
  p.stock = p.totalStock ?? p.stock ?? 0;
  p.inStock = (p.totalStock ?? p.stock ?? 0) > 0;

  // === RATING & REVIEWS ===
  p.rating = typeof p.rating === "number" ? p.rating : p.avgRating ?? 0;
  p.reviews =
    typeof p.reviewCount === "number" ? p.reviewCount : p.reviews || 0;

  // === VARIANTS normalization ===
  // backend may supply variants (with color, size, sku, price etc.)
  p.variants = (p.variants || []).map((v) => {
    const id = v._id || v.id;
    // map color/size fields defensively
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

    // collect images mapped to this variant from product images list
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
    };
  });

  // generalImages (images not tied to any variant)
  p.generalImages = imagesObj
    .filter((img) => !img.variantId)
    .map((img) => img.fullUrl)
    .filter(Boolean);

  // keep images as objects with fullUrl for places that expect fullUrl
  // (productDetail expects product.images which is an array of objects with .fullUrl)
  // p.images already set above.

  // also expose a simple imagesUrls array for convenience
  p.imagesUrls = imagesObj.map((im) => im.fullUrl).filter(Boolean) || [];

  return p;
};

/* -------- API -------- */

export const fetchProducts = async (params = {}) => {
  const qs = buildQuery(params);
  const { data } = await http.get(`/products${qs}`);
  const arr = data?.data || [];
  return arr.map(normalizeProduct);
};

export const fetchProductById = async (id) => {
  if (!id) throw new Error("id required");
  const { data } = await http.get(`/products/${id}`);
  return data?.data ? normalizeProduct(data.data) : null;
};

/* Fetch product variants (inventory controller) */
export const fetchProductVariants = async (productId) => {
  if (!productId) return [];
  try {
    const { data } = await http.get(`/inventory/product-variants/${productId}`);
    // expect data.data to be an array (inventoryController returns variants with currentStock)
    const arr = data?.data || [];
    // ensure consistent shape for frontend
    return arr.map((v) => {
      const id = v._id || v.id;
      const color = v.color
        ? typeof v.color === "object"
          ? {
              name: v.color.sizeName || v.color.name || v.color.colorName || "",
              value: v.color.value || "",
            }
          : { name: v.color, value: "" }
        : null;
      const size = v.size
        ? typeof v.size === "object"
          ? {
              name: v.size.sizeName || v.size.name || "",
              value: v.size.value || "",
            }
          : { name: v.size, value: "" }
        : null;
      return {
        id,
        _id: id,
        sku: v.sku || v.SKU || null,
        price: v.price ?? null,
        stock: v.currentStock ?? v.stock ?? 0,
        color,
        size,
        // other fields may be present; include raw for fallback
        raw: v,
      };
    });
  } catch (err) {
    console.error("fetchProductVariants error:", err?.message || err);
    return [];
  }
};

export const fetchCategories = async (params = {}) => {
  try {
    const qs = buildQuery(params);
    const { data } = await http.get(`/categories${qs}`);
    return data?.data || [];
  } catch {
    return [];
  }
};

export const fetchBrands = async (params = {}) => {
  try {
    const qs = buildQuery(params);
    const { data } = await http.get(`/brands${qs}`);
    return data?.data || [];
  } catch {
    return [];
  }
};

export const fetchOfferProducts = async ({
  minDiscount = 30,
  limit = 48,
} = {}) => {
  const prods = await fetchProducts({ limit });
  return prods.filter((p) => (p.discountPercent || 0) >= minDiscount);
};

const api = {
  fetchProducts,
  fetchProductById,
  fetchProductVariants,
  fetchCategories,
  fetchBrands,
  fetchOfferProducts,
};

export default api;
