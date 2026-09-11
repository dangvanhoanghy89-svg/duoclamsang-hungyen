/**
 * PHARMAVITA / CLINICALRX - CẤU HÌNH HỆ THỐNG VÀ KẾT NỐI SUPABASE
 */

export const CONFIG = {
  APP_NAME: "ClinicalRx",
  APP_SUBTITLE: "Cổng Thông Tin Thuốc & Hỗ Trợ Ra Quyết Định Dược Lâm Sàng",
  APP_VERSION: "3.0.0 Pro",
  DEFAULT_SUPABASE_URL: "https://xhhlhrenrxviksknpvck.supabase.co",
  DEFAULT_SUPABASE_ANON_KEY: "sb_publishable_1KBhNM0o0pbuYYT-b6stmQ_Kk8DJ2k5",
  STORAGE_KEYS: {
    SUPABASE_URL: "CLINICALRX_SUPABASE_URL",
    SUPABASE_KEY: "CLINICALRX_SUPABASE_KEY",
    AUTH_USER: "CLINICALRX_AUTH_USER",
    OFFLINE_QUESTIONS: "CLINICALRX_LOCAL_QUESTIONS",
    OFFLINE_ADR: "CLINICALRX_LOCAL_ADR"
  }
};

export function getSupabaseCredentials() {
  const url = localStorage.getItem(CONFIG.STORAGE_KEYS.SUPABASE_URL) || CONFIG.DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem(CONFIG.STORAGE_KEYS.SUPABASE_KEY) || CONFIG.DEFAULT_SUPABASE_ANON_KEY;
  return { url, key };
}

export function saveSupabaseCredentials(url, key) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.SUPABASE_URL, url.trim());
  localStorage.setItem(CONFIG.STORAGE_KEYS.SUPABASE_KEY, key.trim());
}

if (typeof window !== "undefined") {
  window.__clinicalrx_config = { CONFIG, getSupabaseCredentials, saveSupabaseCredentials };
}

