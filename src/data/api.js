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

  // main image
  if (p.primaryImageFullUrl) {
    p.image = p.primaryImageFullUrl;
  } else if (p.primaryImage) {
    p.image = ensureFullUrl(p.primaryImage);
  } else if (Array.isArray(p.images) && p.images.length) {
    const first = p.images[0];
    p.image = first?.fullUrl ? first.fullUrl : ensureFullUrl(first?.url);
  } else if (p.image) {
    p.image = ensureFullUrl(p.image);
  } else {
    p.image = null;
  }

  // images -> fullUrl
  if (Array.isArray(p.images)) {
    p.images = p.images.map((img) => {
      const c = { ...(img || {}) };
      c.fullUrl = c.fullUrl || ensureFullUrl(c.url);
      return c;
    });
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
  fetchCategories,
  fetchBrands,
  fetchOfferProducts,
};

export default api;
