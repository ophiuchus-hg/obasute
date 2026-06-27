// 修験道体験のテキスト・インライン写真描画

import { trainingData } from "../data/training.js";
import { openLightbox } from "./lightbox.js";

export function renderTraining() {
  const container = document.querySelector("#trainingBody");
  if (!container) return;

  const pendingPhotos = [...trainingData.inlinePhotos];
  const fragments = trainingData.body.split(/\n{2,}/);

  fragments.forEach((fragment) => {
    // タイトルの判定
    if (fragment.startsWith("冠着山の") || fragment.startsWith("冠着神社に合祀") || fragment.startsWith("蘇った冠着山")) {
      const title = document.createElement("h3");
      title.textContent = fragment;
      container.append(title);
      return;
    }

    const paragraph = document.createElement("p");
    paragraph.textContent = fragment;
    container.append(paragraph);

    // インライン写真のマッチング
    const matchedPhotoIndex = pendingPhotos.findIndex((photo) => fragment.includes(photo.after));
    if (matchedPhotoIndex >= 0) {
      const [photo] = pendingPhotos.splice(matchedPhotoIndex, 1);
      container.append(createInlinePhotoElement(photo));
    }
  });

  // 残りの写真を末尾に追加
  pendingPhotos.forEach((photo) => container.append(createInlinePhotoElement(photo)));
}

function createInlinePhotoElement(photo) {
  const figure = document.createElement("figure");
  figure.className = "topic-inline-photo";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "topic-photo-button";
  button.setAttribute("aria-label", `${photo.alt}を拡大表示`);

  const img = document.createElement("img");
  img.src = photo.src;
  img.alt = photo.alt;
  img.loading = "lazy";

  button.append(img);
  button.addEventListener("click", () => openLightbox(photo, "training"));
  figure.append(button);
  return figure;
}
