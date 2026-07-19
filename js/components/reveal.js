// セクション・子要素のスクロール演出ロジック（IntersectionObserver ベース）

/**
 * 要素がビューポート内にあるかどうかを判定する
 */
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/**
 * セクションとその子要素をアニメーションなしで即座に表示状態にする
 */
function revealImmediately(section) {
  section.classList.add("reveal");
  section.classList.remove("reveal-from-left", "reveal-from-right", "reveal-init");

  section.querySelectorAll(".reveal-child, .reveal-title, .reveal-card, .reveal-photo").forEach((child) => {
    child.classList.add("visible");
  });
}

export function initRevealAnimations() {
  const revealSections = document.querySelectorAll(".section-content");

  // JSが有効な場合にのみ初期非表示化クラスを適用
  revealSections.forEach((section) => {
    // 見出し（h2）に演出クラスを適用
    const heading = section.querySelector("h2");
    if (heading) heading.classList.add("reveal-title");

    // リード文に演出クラスを適用
    const lead = section.querySelector(".section-lead");
    if (lead) lead.classList.add("reveal-child");

    // カード系要素に演出クラスを適用
    section.querySelectorAll(".keyword-block, .related-link-item, .links-box").forEach((card) => {
      card.classList.add("reveal-card");
    });

    // 写真系要素に演出クラスを適用
    section.querySelectorAll(".topic-inline-photo").forEach((photo) => {
      photo.classList.add("reveal-photo");
    });

    // ★ リロード対策: ビューポート内のセクションは即座に表示（アニメーションなし）
    if (isInViewport(section)) {
      revealImmediately(section);
    } else {
      section.classList.add("reveal-init");
    }
  });

  // セクション全体のスライドイン（IntersectionObserver）
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal");
        entry.target.classList.remove("reveal-from-left", "reveal-from-right", "reveal-init");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: "0px 0px -50px 0px"
  });

  revealSections.forEach((section) => {
    // 既に表示済みのセクションはobserve不要
    if (!section.classList.contains("reveal")) {
      sectionObserver.observe(section);
    }
  });

  // 子要素の時差つきフェードイン（IntersectionObserver）
  const childObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 同じセクション内の要素を収集し、インデックスに応じたディレイを付与
        const section = entry.target.closest(".section-content");
        if (section) {
          const siblings = Array.from(section.querySelectorAll(".reveal-child:not(.visible), .reveal-title:not(.visible), .reveal-card:not(.visible), .reveal-photo:not(.visible)"));
          const idx = siblings.indexOf(entry.target);
          const delay = Math.max(0, idx) * 120; // 120ms間隔で順番に表示
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);
        } else {
          entry.target.classList.add("visible");
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: "0px 0px -30px 0px"
  });

  // 既に表示済みの子要素はobserve不要
  document.querySelectorAll(".reveal-child, .reveal-title, .reveal-card, .reveal-photo").forEach((el) => {
    if (!el.classList.contains("visible")) {
      childObserver.observe(el);
    }
  });

  // セクション内コンテンツのパララックス効果（スクロール速度差）
  // rAF スロットリングでパフォーマンス改善
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        document.querySelectorAll(".section-container").forEach((container) => {
          const rect = container.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          // 要素が画面内にある場合のみ処理
          if (rect.top < viewportHeight && rect.bottom > 0) {
            const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
            const offset = (progress - 0.5) * 20; // -10px 〜 +10px の微妙な移動
            const heading = container.querySelector("h2");
            if (heading) {
              heading.style.transform = `translateY(${offset * -0.5}px)`;
            }
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
