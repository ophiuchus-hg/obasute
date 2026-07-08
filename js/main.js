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

// 伝説のテキスト描画
function renderLegend() {
  const legendBody = document.querySelector("#legendBody");
  if (!legendBody) return;
  legendBody.textContent = legendData;
}

document.addEventListener("DOMContentLoaded", () => {
  // 0. テーマ切り替えの初期化
  initTheme();

  // 1. ヒーロー画像の初期化
  initHero();

  // 2. 姨捨伝説の描画
  renderLegend();

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
