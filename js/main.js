// ==========================================
// エントリーポイント
// 各モジュールを import し、DOMContentLoaded で初期化を実行
// ==========================================

import { legendData } from "./data/legend.js";
import { renderGallery } from "./components/gallery.js";
import { renderTraining } from "./components/training.js";
import { renderPeopleAndLinks } from "./components/people.js";
import { initBooklet } from "./components/booklet.js";
import { initScrollspy } from "./components/scrollspy.js";
import { initHero, initMobileMenu } from "./components/hero.js";
import { initRevealAnimations } from "./components/reveal.js";
import { initTheme } from "./components/theme.js";
import { openLightbox } from "./components/lightbox.js";

// 伝説のテキスト描画
function renderLegend() {
  const legendBody = document.querySelector("#legendBody");
  if (!legendBody) return;
  
  legendBody.innerHTML = "";
  
  const lines = legendData.split("\n");
  lines.forEach((line) => {
    if (line.trim() === "") {
      const p = document.createElement("p");
      p.style.minHeight = "1em";
      legendBody.appendChild(p);
      return;
    }
    
    const p = document.createElement("p");
    p.textContent = line;
    legendBody.appendChild(p);
    
    // お触れの立て札シーン
    if (line.includes("［六十になったとしよりは山に捨てること］")) {
      const imgContainer = document.createElement("div");
      imgContainer.className = "legend-image-container";
      
      const img = document.createElement("img");
      img.src = "assets/legend_ofure.jpg";
      img.alt = "お触れの立て札を見る村人たち";
      img.className = "legend-image";
      img.style.cursor = "pointer";
      img.addEventListener("click", () => {
        openLightbox({ src: "assets/legend_ofure.jpg", alt: "お触れの立て札を見る村人たち" }, "legend");
      });
      imgContainer.appendChild(img);
      
      const caption = document.createElement("div");
      caption.className = "legend-image-caption";
      caption.textContent = "お触れの立て札を見る村人たち";
      imgContainer.appendChild(caption);
      
      legendBody.appendChild(imgContainer);
    }
    
    // 母親を背負って山を登るシーン
    if (line.includes("多平はたみぉおぶって、ただ黙々と山道登ってった。")) {
      const imgContainer = document.createElement("div");
      imgContainer.className = "legend-image-container";
      
      const img = document.createElement("img");
      img.src = "assets/legend_mountain.jpg";
      img.alt = "母親を背負って山を登る多平";
      img.className = "legend-image";
      img.style.cursor = "pointer";
      img.addEventListener("click", () => {
        openLightbox({ src: "assets/legend_mountain.jpg", alt: "母親を背負って山を登る多平" }, "legend");
      });
      imgContainer.appendChild(img);
      
      const caption = document.createElement("div");
      caption.className = "legend-image-caption";
      caption.textContent = "母親を背負って山を登る多平";
      imgContainer.appendChild(caption);
      
      legendBody.appendChild(imgContainer);
    }
  });
}

// 語り部写真ギャラリーの初期化
function initKataribeGallery() {
  const mainImg = document.querySelector("#kataribeMainImg");
  const subImg1 = document.querySelector("#kataribeSubImg1");
  const subImg2 = document.querySelector("#kataribeSubImg2");
  
  if (mainImg) {
    mainImg.addEventListener("click", () => {
      openLightbox({ src: "kataribe.jpg", alt: "更級かたりべの会の皆様" }, "kataribe");
    });
  }
  if (subImg1) {
    subImg1.addEventListener("click", () => {
      openLightbox({ src: "kataribe1.jpg", alt: "語り部と演奏の様子" }, "kataribe");
    });
  }
  if (subImg2) {
    subImg2.addEventListener("click", () => {
      openLightbox({ src: "kataribe2.jpg", alt: "語り部の姨捨伝説イラスト" }, "kataribe");
    });
  }
}

// 謡曲写真ギャラリーの初期化
function initNohGallery() {
  const posterImg = document.querySelector("#nohPosterImg");
  const moonImg = document.querySelector("#nohMoonImg");
  const himebotaruImg = document.querySelector("#nohHimebotaruImg");
  
  if (posterImg) {
    posterImg.addEventListener("click", () => {
      openLightbox({ src: "assets/noh_poster.jpg", alt: "謡曲「姨捨」イメージ（秋乃月とシテ）" }, "noh");
    });
  }
  if (moonImg) {
    moonImg.addEventListener("click", () => {
      openLightbox({ src: "assets/noh_moon.jpg", alt: "更級の満月と歴史的建造物（煙突と赤レンガ）" }, "noh");
    });
  }
  if (himebotaruImg) {
    himebotaruImg.addEventListener("click", () => {
      openLightbox({ src: "assets/noh_himebotaru.png", alt: "冠着山の姫ボタル（発光）" }, "noh");
    });
  }
}


document.addEventListener("DOMContentLoaded", () => {
  // 0. テーマ切り替えの初期化
  initTheme();

  // 1. ヒーロー画像の初期化
  initHero();

  // 2. 姨捨伝説の描画
  renderLegend();

  // 2.5 語り部写真ギャラリーの初期化
  initKataribeGallery();

  // 2.7 謡曲写真ギャラリーの初期化
  initNohGallery();

  // 3. 里宮ギャラリーの描画
  renderGallery("shrine", "#shrineGallery");

  // 4. 修験道の描画
  renderTraining();
  renderGallery("training", "#trainingGallery", "college");

  // 5. 冠着大学ギャラリーの描画
  renderGallery("college", "#collegeGallery", "college");

  // 6. 人々の描画
  renderPeopleAndLinks();

  // 7. ブックレットリーダーのセットアップ
  initBooklet();

  // 8. スティッキーヘッダー & Scrollspyのセットアップ
  initScrollspy();

  // 9. モバイルメニューの初期化
  initMobileMenu();

  // 10. スクロール演出の初期化
  initRevealAnimations();
});


