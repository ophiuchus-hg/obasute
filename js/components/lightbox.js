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
  } else if (galleryKey === "legend") {
    activeGalleryPhotos = [
      { src: "assets/legend_ofure.jpg", alt: "お触れの立て札を見る村人たち" },
      { src: "assets/legend_mountain.jpg", alt: "母親を背負って山を登る多平" }
    ];
  } else if (galleryKey === "kataribe") {
    activeGalleryPhotos = [
      { src: "kataribe.jpg", alt: "更級かたりべの会の皆様" },
      { src: "kataribe1.jpg", alt: "語り部と演奏の様子" },
      { src: "kataribe2.jpg", alt: "語り部の姨捨伝説イラスト" }
    ];
  } else if (galleryKey === "noh") {
    activeGalleryPhotos = [
      { src: "assets/noh_sitting.jpg", alt: "能「姨捨」舞台写真（着座）" },
      { src: "assets/noh_dancing.png", alt: "能「姨捨」舞台写真（舞）" },
      { src: "assets/noh_poster.jpg", alt: "謡曲「姨捨」イメージ（秋乃月とシテ）" },
      { src: "assets/noh_moon.jpg", alt: "更級の満月と歴史的建造物（煙突と赤レンガ）" },
      { src: "assets/noh_himebotaru.png", alt: "冠着山の姫ボタル（発光）" }
    ];
  } else if (galleryKey === "booklet") {
    // 冊子の全ページを対象にする
    const pages = bookletPages || [];
    activeGalleryPhotos = pages.map((page, idx) => ({
      src: page.src,
      alt: page.alt || `冊子「冠着山」 ${idx + 1}ページ`
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

  // タッチスワイプ操作の追加
  let touchStartX = 0;
  let touchStartY = 0;

  lightboxEl.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { signal, passive: true });

  lightboxEl.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // 左右スワイプで前後の画像へ
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (hasMultiple) {
        if (diffX > 0) {
          navigateLightbox(-1); // 右スワイプで前へ
        } else {
          navigateLightbox(1); // 左スワイプで次へ
        }
      }
    } 
    // 下スワイプでライトボックスを閉じる
    else if (diffY > 80 && Math.abs(diffY) > Math.abs(diffX)) {
      closeLightbox();
    }
  }, { signal, passive: true });

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
