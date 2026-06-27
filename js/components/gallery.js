// ギャラリーの共通描画

import { galleries } from "../data/galleries.js";
import { openLightbox } from "./lightbox.js";

/**
 * ギャラリーを描画する
 * @param {string} galleryKey - galleries オブジェクトのキー
 * @param {string} containerSelector - 描画先のCSSセレクタ
 * @param {string} [extraClass=""] - 追加CSSクラス
 */
export function renderGallery(galleryKey, containerSelector, extraClass = "") {
  const container = document.querySelector(containerSelector);
  const sections = galleries[galleryKey] || [];
  if (!container || !sections.length) return;

  container.replaceChildren(
    ...sections.map((section) => {
      const article = document.createElement("article");
      article.className = "keyword-block";
      if (extraClass) article.classList.add(`${extraClass}-block`);
      if (section.layout === "document") article.classList.add("document-block");

      const header = document.createElement("div");
      header.className = "keyword-block-header";

      const title = document.createElement("h4");
      title.textContent = section.keyword;

      const note = document.createElement("p");
      note.textContent = section.note;

      const detail = document.createElement("p");
      detail.className = "keyword-detail";
      detail.textContent = section.detail || "";
      detail.hidden = !section.detail;

      header.append(title, note, detail);

      const photos = document.createElement("div");
      photos.className = `keyword-photos count-${section.photos.length}`;
      if (extraClass === "college") photos.classList.add("college-photos");

      photos.append(
        ...section.photos.map((photo) => {
          const figure = document.createElement("figure");
          const button = document.createElement("button");
          button.type = "button";
          button.className = "gallery-image-button";
          button.setAttribute("aria-label", `${photo.alt}を拡大表示`);

          const img = document.createElement("img");
          img.src = photo.src;
          img.alt = photo.alt;
          img.loading = "lazy";

          button.append(img);
          button.addEventListener("click", () => openLightbox(photo, galleryKey));
          figure.append(button);
          return figure;
        })
      );

      article.append(header, photos);
      return article;
    })
  );
}
