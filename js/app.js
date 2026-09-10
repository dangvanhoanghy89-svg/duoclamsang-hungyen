/**
 * PHARMAVITA / CLINICALRX - CORE APPLICATION ENTRY POINT
 */

import { initDrugDirectory } from "./modules/drugDirectory.js?v=20260910_v13_adr_doctor_auth";
import { initInteractionChecker } from "./modules/interactionCheck.js?v=20260910_v13_adr_doctor_auth";
import { initCalculators } from "./modules/calculators.js?v=20260910_v13_adr_doctor_auth";
import { initConsultationModule } from "./modules/consultation.js?v=20260910_v13_adr_doctor_auth";
import { initAdrModule } from "./modules/adrReporting.js?v=20260910_v13_adr_doctor_auth";
import { initIvCompatibilityModule } from "./modules/ivCheck.js?v=20260910_v13_adr_doctor_auth";
import { initAuthModule } from "./modules/auth.js?v=20260910_v13_adr_doctor_auth";

function initApp() {
  console.log("Khởi động ClinicalRx - Nền tảng Thông tin Thuốc & Dược Lâm Sàng");

  // Khởi tạo phân hệ Xác thực & Phân quyền
  initAuthModule();

  // Khởi tạo các phân hệ chuyên môn
  initDrugDirectory();
  initInteractionChecker();
  initCalculators();
  initConsultationModule();
  initAdrModule();
  initIvCompatibilityModule();

  // Khởi tạo icons Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Navigation tabs handler
  setupNavigation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function setupNavigation() {
  const navLinks = document.querySelectorAll("[data-nav-target]");
  const sections = document.querySelectorAll(".app-section");

  const switchSection = (targetId) => {
    sections.forEach(sec => {
      if (sec.id === targetId) {
        sec.classList.remove("hidden");
      } else {
        sec.classList.add("hidden");
      }
    });

    navLinks.forEach(link => {
      if (link.getAttribute("data-nav-target") === targetId) {
        link.classList.add("text-teal-700", "font-bold", "bg-teal-50", "border-teal-600");
        link.classList.remove("text-slate-600", "border-transparent");
      } else {
        link.classList.remove("text-teal-700", "font-bold", "bg-teal-50", "border-teal-600");
        link.classList.add("text-slate-600", "border-transparent");
      }
    });

    // Cuộn lên đầu trang nhẹ nhàng
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Refresh consultation auth UI khi vào section consultation
    if (targetId === "consultation") {
      if (window.updateConsultationAuthUI) window.updateConsultationAuthUI();
      if (window.renderConsultationsList) window.renderConsultationsList();
    }

    // Refresh ADR auth UI khi vào section adr
    if (targetId === "adr") {
      if (window.updateAdrAuthUI) window.updateAdrAuthUI();
    }

    // Refresh icons
    if (window.lucide) window.lucide.createIcons();
  };

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-nav-target");
      if (target) {
        switchSection(target);
        // Cập nhật hash trên URL mà không reload
        history.pushState(null, "", `#${target}`);
      }
    });
  });

  // Handle URL Hash khi tải trang
  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && document.getElementById(initialHash)) {
    switchSection(initialHash);
  }

  window.addEventListener("popstate", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById(hash)) {
      switchSection(hash);
    }
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenuDrawer = document.getElementById("mobileMenuDrawer");
  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenuDrawer.classList.toggle("hidden");
    });

    // Đóng drawer khi click vào item
    mobileMenuDrawer.querySelectorAll("[data-nav-target]").forEach(btn => {
      btn.addEventListener("click", () => {
        mobileMenuDrawer.classList.add("hidden");
      });
    });
  }
}

// Shortcut điều hướng toàn cục
window.navigateToSection = function(sectionId) {
  const targetLink = document.querySelector(`[data-nav-target="${sectionId}"]`);
  if (targetLink) targetLink.click();
};
