// ブックレットリーダーのコントロール

import { openLightbox } from "./lightbox.js";

// モジュールスコープの状態
let bookletPages = [];
let currentPageIndex = 0;

// DOM要素キャッシュ
let bookletReader = null;
let leftPageSlot = null;
let rightPageSlot = null;
let leftPageImage = null;
let rightPageImage = null;
let leftPageCaption = null;
let rightPageCaption = null;
let prevButton = null;
let nextButton = null;
let thumbnailContainer = null;

function cacheElements() {
  bookletReader = document.querySelector(".booklet-reader");
  leftPageSlot = document.querySelector("#leftPageSlot");
  rightPageSlot = document.querySelector("#rightPageSlot");
  leftPageImage = document.querySelector("#leftPageImage");
  rightPageImage = document.querySelector("#rightPageImage");
  leftPageCaption = document.querySelector("#leftPageCaption");
  rightPageCaption = document.querySelector("#rightPageCaption");
  prevButton = document.querySelector("#prevSpread");
  nextButton = document.querySelector("#nextSpread");
  thumbnailContainer = document.querySelector("#bookletThumbnails");
}

export function initBooklet() {
  bookletPages = Array.isArray(window.BOOKLET_PAGES) ? window.BOOKLET_PAGES : [];
  cacheElements();

  if (!bookletPages.length) return;

  // サムネイルの描画
  if (thumbnailContainer) {
    thumbnailContainer.replaceChildren(
      ...bookletPages.map((page, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("aria-label", `ページ ${index + 1} へ移動`);

        const img = document.createElement("img");
        img.src = page.src;
        img.alt = `ページ ${index + 1} のミニ画像`;
        img.loading = "lazy";

        const span = document.createElement("span");
        span.textContent = `P. ${index + 1}`;

        btn.append(img, span);
        btn.addEventListener("click", () => {
          goToPage(index);
        });
        return btn;
      })
    );
  }

  prevButton?.addEventListener("click", () => movePage(-1));
  nextButton?.addEventListener("click", () => movePage(1));

  // キーボード操作のリスナー
  document.addEventListener("keydown", (event) => {
    const bookletArea = document.querySelector("#bookletInline");
    if (!bookletArea || !bookletArea.matches(":hover")) return;
    if (event.key === "ArrowLeft") movePage(-1);
    if (event.key === "ArrowRight") movePage(1);
  });
  renderBooklet(true);
}

function shouldShowSpread() {
  // 常に1ページ表示
  return false;
}

function clampPageIndex(index) {
  return Math.min(Math.max(index, 0), Math.max(bookletPages.length - 1, 0));
}

function renderBooklet(isInitial = false) {
  if (!bookletReader || !bookletPages.length) return;

  currentPageIndex = clampPageIndex(currentPageIndex);
  const isSpread = shouldShowSpread();

  // 見開き表示の場合のインデックス算出
  // 表紙（0）は1枚。1ページ目以降は、奇数が左、偶数が右。
  let leftIndex = currentPageIndex;
  let rightIndex = -1;

  if (isSpread) {
    // 現在のインデックスが偶数の場合、それは右側のページなので、左側（奇数）を1つ前に調整
    if (currentPageIndex % 2 === 0) {
      leftIndex = currentPageIndex - 1;
      rightIndex = currentPageIndex;
    } else {
      leftIndex = currentPageIndex;
      rightIndex = currentPageIndex + 1 < bookletPages.length ? currentPageIndex + 1 : -1;
    }
  }

  // スロットへのページ割り当て
  const leftPage = bookletPages[leftIndex];
  const rightPage = rightIndex >= 0 ? bookletPages[rightIndex] : null;

  setPageSlot(leftPageSlot, leftPageImage, leftPageCaption, leftPage, leftIndex);
  setPageSlot(rightPageSlot, rightPageImage, rightPageCaption, rightPage, rightIndex);

  // 見開き時のリーダー幅クラス適用
  bookletReader.classList.toggle("single-page", !isSpread || !rightPage);

  // ボタンの有効／無効制御
  if (prevButton) prevButton.disabled = currentPageIndex === 0;
  if (nextButton) {
    nextButton.disabled = isSpread && rightIndex >= 0
      ? rightIndex >= bookletPages.length - 1
      : currentPageIndex >= bookletPages.length - 1;
  }

  // サムネイルのアクティブ状態の更新
  const thumbnails = document.querySelectorAll("#bookletThumbnails button");
  thumbnails.forEach((thumb, idx) => {
    const isActive = idx === leftIndex || (rightIndex >= 0 && idx === rightIndex);
    thumb.classList.toggle("active", isActive);

    if (isActive && !isInitial && thumb.scrollIntoView) {
      // スムーズにスクロールさせて可視範囲に入れる
      thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  });
}

function setPageSlot(slot, image, caption, page, index) {
  if (!slot || !image || !caption) return;

  if (!page) {
    slot.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
    caption.textContent = "";
    image.onclick = null;
    image.style.cursor = "default";
    return;
  }

  slot.hidden = false;

  // アニメーション用のクラス適用
  image.style.opacity = 0;
  setTimeout(() => {
    image.src = page.src;
    image.alt = page.alt || `冊子「冠着山」 ${index + 1}ページ`;
    caption.textContent = `P. ${index + 1} / ${bookletPages.length}`;
    image.style.opacity = 1;
    image.style.cursor = "zoom-in";

    // クリック時にライトボックスで拡大表示
    image.onclick = () => {
      openLightbox({
        src: page.src,
        alt: page.alt || `冊子「冠着山」 ${index + 1}ページ`
      }, "booklet", bookletPages);
    };
  }, 50);
}

function goToPage(index) {
  currentPageIndex = clampPageIndex(index);
  renderBooklet();
}

function movePage(direction) {
  const isSpread = shouldShowSpread();
  // 見開きのときは2ページずつ、そうでないときは1ページずつ移動
  let offset = direction;
  if (isSpread) {
    offset = direction * 2;
  }
  goToPage(currentPageIndex + offset);
}
