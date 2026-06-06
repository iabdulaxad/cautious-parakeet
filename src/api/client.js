import axios from "axios";
import config from "../config";

// ---------------------------------------------------------------------------
// Token storage (localStorage) — single source of truth for the JWT pair.
// ---------------------------------------------------------------------------
const ACCESS_KEY = "hm_access_token";
const REFRESH_KEY = "hm_refresh_token";

export const tokenStore = {
  access: () => localStorage.getItem(ACCESS_KEY) || "",
  refresh: () => localStorage.getItem(REFRESH_KEY) || "",
  set(access, refresh) {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// Registered by AuthContext so the client can force a logout when the session
// can no longer be refreshed.
let onSessionExpired = () => {};
export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn || (() => {});
}

const http = axios.create({
  baseURL: config.baseUrl,
  headers: {
    "Content-Type": "application/json",
    "environment-id": config.environmentId,
  },
  timeout: 30000,
});

http.interceptors.request.use((cfg) => {
  const token = tokenStore.access();

  // Parse payload to check if this is a login or registration call.
  // These should never carry an Authorization header.
  let isPublicMethod = false;
  try {
    const body = typeof cfg.data === "string" ? JSON.parse(cfg.data) : cfg.data;
    const method = body?.data?.method;
    isPublicMethod =
      method === "login" ||
      method === "register_patient" ||
      method === "register_doctor" ||
      method === "register_receptionist";
  } catch {
    // ignore parse errors
  }

  if (token && !isPublicMethod) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

function makeError(payload, fallback) {
  const message =
    payload?.error?.message ||
    payload?.data?.message ||
    payload?.message ||
    fallback ||
    "Request failed";
  const err = new Error(message);
  err.code = payload?.error?.code || "ERROR";
  return err;
}

// unwrap digs through the response envelope. Our function returns
// {status:"success", data:...} or {status:"error", error:{code,message}};
// uCode may nest that under its own {data:...}, so we descend a few levels.
function unwrap(payload) {
  let p = payload;
  for (let i = 0; i < 4 && p && typeof p === "object"; i++) {
    if (p.status === "error") throw makeError(p);
    if (p.status === "success") return p.data;
    if ("data" in p) {
      p = p.data;
      continue;
    }
    break;
  }
  return p;
}

async function rawInvoke(method, objectData) {
  const url = `/v2/invoke_function/${config.functionSlug}/?project-id=${config.projectId}`;
  try {
    const res = await http.post(url, {
      data: { method, object_data: objectData || {} },
    });
    return unwrap(res.data);
  } catch (err) {
    if (err.isAxiosError && err.response) {
      // Non-2xx — our error body may still be inside; unwrap throws a clean error.
      return unwrap(err.response.data);
    }
    throw err;
  }
}

// Single-flight refresh so concurrent 401s only refresh once.
let refreshing = null;
async function tryRefresh() {
  if (!tokenStore.refresh()) return false;
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const data = await rawInvoke("refresh_token", {
          refresh_token: tokenStore.refresh(),
        });
        const t = data?.token;
        if (t?.access_token) {
          tokenStore.set(t.access_token, t.refresh_token);
          return true;
        }
      } catch {
        /* fall through to clear */
      }
      return false;
    })();
  }
  const ok = await refreshing;
  refreshing = null;
  return ok;
}

// invoke calls a backend method, transparently refreshing an expired access
// token once before giving up and signalling the session as expired.
export async function invoke(method, objectData = {}, _retried = false) {
  try {
    return await rawInvoke(method, objectData);
  } catch (err) {
    const recoverable =
      !_retried &&
      err.code === "UNAUTHORIZED" &&
      method !== "login" &&
      method !== "refresh_token";
    if (recoverable && (await tryRefresh())) {
      return invoke(method, objectData, true);
    }
    if (err.code === "UNAUTHORIZED" && method !== "login") {
      tokenStore.clear();
      onSessionExpired();
    }
    throw err;
  }
}

export default { invoke, tokenStore };
