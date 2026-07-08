// ブックレットリーダーのコントロール

import { openLightbox } from "./lightbox.js";

// モジュールスコープの状態
let bookletPages = [];
let currentPageIndex = 0;
let lastDirection = "next";

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

  // サムネイルの描画（右開きのため、逆順にして右から左へ並べる）
  if (thumbnailContainer) {
    const thumbs = bookletPages.map((page, index) => {
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

      // 左右矢印キーでのサムネイル選択移動（右開きに追従）
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          if (index < bookletPages.length - 1) {
            goToPage(index + 1); // 左に進む＝次のページへ
            focusThumbnail(index + 1);
          }
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          if (index > 0) {
            goToPage(index - 1); // 右に戻る＝前のページへ
            focusThumbnail(index - 1);
          }
        }
      });
      return btn;
    });
    // 配列を逆順にして、P.1 が右端、P.36 が左端になるように挿入
    thumbnailContainer.replaceChildren(...thumbs.reverse());
  }

  prevButton?.addEventListener("click", () => movePage(-1));
  nextButton?.addEventListener("click", () => movePage(1));

  // キーボード操作のリスナー（フォーカスが領域内にあるか、またはホバー時のみ動作）
  document.addEventListener("keydown", (event) => {
    const bookletArea = document.querySelector("#bookletInline");
    if (!bookletArea) return;

    const hasFocus = bookletArea.contains(document.activeElement);
    const isHovered = bookletArea.matches(":hover");
    if (!isHovered && !hasFocus) return;

    // フォーカスがサムネイルにある時はサムネイル個別のリスナーに任せる
    if (document.activeElement && document.activeElement.closest("#bookletThumbnails")) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      movePage(1); // 左矢印で進む（右開き）
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      movePage(-1); // 右矢印で戻る（右開き）
    }
  });

  // リサイズイベントのリスナーを追加
  window.addEventListener("resize", () => {
    renderBooklet();
  });

  // スワイプ操作のセットアップ
  setupSwipeGestures();

  renderBooklet(true);
}

function setupSwipeGestures() {
  const spreadArea = document.querySelector(".booklet-spread");
  if (!spreadArea) return;

  let touchStartX = 0;
  let touchStartY = 0;

  spreadArea.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  spreadArea.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // 縦スクロールを優先するため、横方向の移動量が縦方向の2.0倍以上大きく、かつ70px以上の場合のみスワイプと判定
    if (Math.abs(diffX) > Math.abs(diffY) * 2 && Math.abs(diffX) > 70) {
      if (diffX > 0) {
        movePage(-1); // 右スワイプで前へ
      } else {
        movePage(1); // 左スワイプで次へ
      }
    }
  }, { passive: true });
}

function shouldShowSpread() {
  // 1024px以上の画面幅で見開き表示を許可
  return window.innerWidth >= 1024;
}

function clampPageIndex(index) {
  return Math.min(Math.max(index, 0), Math.max(bookletPages.length - 1, 0));
}

function renderBooklet(isInitial = false) {
  if (!bookletReader || !bookletPages.length) return;

  currentPageIndex = clampPageIndex(currentPageIndex);
  const isSpread = shouldShowSpread();

  // 見開き表示の場合のインデックス算出
  // 表紙（0）は1枚。1ページ目以降は右開き：右が若いページ、左が次のページ
  let leftIndex = -1;
  let rightIndex = currentPageIndex;

  if (isSpread) {
    if (currentPageIndex % 2 === 0) {
      // 偶数ページ（左側）
      leftIndex = currentPageIndex;
      rightIndex = currentPageIndex - 1;
    } else {
      // 奇数ページ（右側）
      leftIndex = currentPageIndex + 1 < bookletPages.length ? currentPageIndex + 1 : -1;
      rightIndex = currentPageIndex;
    }
  } else {
    // 1ページ表示の時は左スロットに現在のページを割り当て、右スロットは非表示にする
    leftIndex = currentPageIndex;
    rightIndex = -1;
  }

  // スロットへのページ割り当て
  const leftPage = leftIndex >= 0 ? bookletPages[leftIndex] : null;
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
    // HTML上は逆順（P.36が左、P.1が右）に並んでいるため、DOMのインデックス（idx）を元のページインデックス（0〜）に換算します
    const pageIndex = bookletPages.length - 1 - idx;
    const isActive = pageIndex === leftIndex || (rightIndex >= 0 && pageIndex === rightIndex);
    thumb.classList.toggle("active", isActive);

    if (isActive && thumbnailContainer) {
      // 縦スクロールを誘発する標準の scrollIntoView の使用を避け、横スクロールのみを制御する
      const containerWidth = thumbnailContainer.clientWidth;
      const thumbLeft = thumb.offsetLeft;
      const thumbWidth = thumb.clientWidth;
      const targetScrollLeft = thumbLeft - (containerWidth / 2) + (thumbWidth / 2);

      thumbnailContainer.scrollTo({
        left: targetScrollLeft,
        behavior: isInitial ? "auto" : "smooth"
      });
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

  // トランジションを一旦無効にしてスライド初期位置に設定
  image.style.transition = "none";
  image.style.opacity = 0;
  // 右開きなので、進むときは左から（-24px）、戻るときは右から（24px）スライドイン
  image.style.transform = lastDirection === "next" ? "translateX(-24px)" : "translateX(24px)";

  setTimeout(() => {
    image.src = page.src;
    image.alt = page.alt || `冊子「冠着山」 ${index + 1}ページ`;
    caption.textContent = `P. ${index + 1} / ${bookletPages.length}`;
    
    // トランジションを有効にして元に戻す（スライドイン）
    image.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease";
    image.style.opacity = 1;
    image.style.transform = "translateX(0)";
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
  if (index !== currentPageIndex) {
    lastDirection = index > currentPageIndex ? "next" : "prev";
  }
  currentPageIndex = clampPageIndex(index);
  renderBooklet();
}

function movePage(direction) {
  const isSpread = shouldShowSpread();
  lastDirection = direction > 0 ? "next" : "prev";
  // 見開きのときは2ページずつ、そうでないときは1ページずつ移動
  let offset = direction;
  if (isSpread) {
    offset = direction * 2;
  }
  goToPage(currentPageIndex + offset);
}

function focusThumbnail(index) {
  const thumbnails = document.querySelectorAll("#bookletThumbnails button");
  const targetIdx = bookletPages.length - 1 - index; // 逆順になっているため換算
  if (thumbnails[targetIdx]) {
    thumbnails[targetIdx].focus();
  }
}
