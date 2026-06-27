// ライトボックスとスライドショー

import { trainingData } from "../data/training.js";
import { galleries } from "../data/galleries.js";

// モジュールスコープの状態
let activeGalleryPhotos = [];
let currentPhotoIndex = 0;

// DOM要素キャッシュ
let lightboxEl = null;
let lightboxImg = null;
let lightboxCaption = null;
let prevBtn = null;
let nextBtn = null;
let closeBtn = null;

// イベントリスナー用 AbortController
let lightboxAbortController = null;

function cacheElements() {
  lightboxEl = document.querySelector("#imageLightbox");
  lightboxImg = document.querySelector("#lightboxImage");
  lightboxCaption = document.querySelector("#lightboxCaption");
  prevBtn = document.querySelector("#prevLightbox");
  nextBtn = document.querySelector("#nextLightbox");
  closeBtn = document.querySelector(".lightbox-close");
}

/**
 * ライトボックスを開く
 * @param {{ src: string, alt: string }} photo - 表示する写真
 * @param {string} galleryKey - ギャラリーキー
 * @param {Array} [bookletPages] - ブックレットページ配列（booklet用）
 */
export function openLightbox(photo, galleryKey, bookletPages) {
  if (!lightboxEl) cacheElements();
  if (!lightboxEl || !lightboxImg || !lightboxCaption) return;

  // 対象ギャラリーの写真リストを取得
  buildPhotoList(galleryKey, photo, bookletPages);

  lightboxImg.src = photo.src;
  lightboxImg.alt = photo.alt;
  lightboxCaption.textContent = photo.alt;

  lightboxEl.showModal();
  document.body.style.overflow = "hidden"; // スクロール防止

  // イベントリスナーのセットアップ
  setupLightboxNav();
}

function buildPhotoList(galleryKey, activePhoto, bookletPages) {
  activeGalleryPhotos = [];
  currentPhotoIndex = 0;

  if (galleryKey === "training") {
    activeGalleryPhotos = trainingData.inlinePhotos;
  } else if (galleryKey === "booklet") {
    // 冊子の全ページを対象にする
    const pages = bookletPages || [];
    activeGalleryPhotos = pages.map((page, idx) => ({
      src: page.src,
      alt: page.alt || `冊子「冠着山」 ${idx + 1}ページ / 全${pages.length}ページ`
    }));
  } else if (galleries[galleryKey]) {
    galleries[galleryKey].forEach((section) => {
      activeGalleryPhotos.push(...section.photos);
    });
  }

  currentPhotoIndex = activeGalleryPhotos.findIndex((p) => p.src === activePhoto.src);
  if (currentPhotoIndex < 0) {
    activeGalleryPhotos = [activePhoto];
    currentPhotoIndex = 0;
  }
}

function closeLightbox() {
  if (!lightboxEl) return;

  lightboxEl.close();
  document.body.style.overflow = ""; // スクロール有効化

  // イベントリスナーのクリーンアップ
  if (lightboxAbortController) {
    lightboxAbortController.abort();
    lightboxAbortController = null;
  }
}

function setupLightboxNav() {
  if (!prevBtn || !nextBtn || !closeBtn || !lightboxEl) return;

  // 前回のリスナーをクリーンアップ
  if (lightboxAbortController) {
    lightboxAbortController.abort();
  }
  lightboxAbortController = new AbortController();
  const { signal } = lightboxAbortController;

  // ナビゲーションボタンの表示・非表示
  const hasMultiple = activeGalleryPhotos.length > 1;
  prevBtn.style.display = hasMultiple ? "flex" : "none";
  nextBtn.style.display = hasMultiple ? "flex" : "none";

  // ボタンイベント
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  }, { signal });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  }, { signal });

  closeBtn.addEventListener("click", closeLightbox, { signal });

  lightboxEl.addEventListener("click", (e) => {
    if (e.target === lightboxEl) closeLightbox();
  }, { signal });

  // キーボードナビゲーション
  document.addEventListener("keydown", (e) => {
    if (!lightboxEl.open) return;
    if (e.key === "ArrowLeft" && hasMultiple) navigateLightbox(-1);
    if (e.key === "ArrowRight" && hasMultiple) navigateLightbox(1);
    if (e.key === "Escape") closeLightbox();
  }, { signal });
}

function navigateLightbox(direction) {
  if (!activeGalleryPhotos.length) return;

  currentPhotoIndex = (currentPhotoIndex + direction + activeGalleryPhotos.length) % activeGalleryPhotos.length;
  const photo = activeGalleryPhotos[currentPhotoIndex];

  if (lightboxImg && lightboxCaption) {
    lightboxImg.style.opacity = 0;
    setTimeout(() => {
      lightboxImg.src = photo.src;
      lightboxImg.alt = photo.alt;
      lightboxCaption.textContent = photo.alt;
      lightboxImg.style.opacity = 1;
    }, 100);
  }
}
