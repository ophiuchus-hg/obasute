// Scrollspy と スティッキーヘッダー

export function initScrollspy() {
  const sections = document.querySelectorAll(".section-content, .hero");
  const navLinks = document.querySelectorAll(".nav-link");
  const header = document.querySelector("#siteHeader");

  window.addEventListener("scroll", () => {
    let currentId = "";
    const scrollPosition = window.scrollY + 100; // ヘッダーの高さを考慮したオフセット

    // ヘッダーのスクロール影エフェクト
    if (header) {
      if (window.scrollY > 50) {
        header.style.boxShadow = "var(--shadow)";
        header.style.background = "rgba(250, 248, 245, 0.95)";
      } else {
        header.style.boxShadow = "none";
        header.style.background = "rgba(250, 248, 245, 0.85)";
      }
    }

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        // セクションのIDが hero の場合は、何もアクティブにしない（または最初のブックレット）
        if (section.id !== "top") {
          currentId = `#${section.id}`;
        }
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href === currentId;
      link.classList.toggle("active", isActive);

      // モバイル時にアクティブなタブを自動スクロールで表示位置に持ってくる
      if (isActive && window.innerWidth < 900) {
        link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });
  });

  // スムーズスクロールイベントの紐付け（横方向のズレを防ぐため、縦方向のみスクロール）
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const htmlStyles = window.getComputedStyle(document.documentElement);
        const scrollPaddingTop = parseInt(htmlStyles.scrollPaddingTop) || 0;
        const targetY = (window.scrollY || window.pageYOffset) + targetSection.getBoundingClientRect().top - scrollPaddingTop;

        window.scrollTo({
          top: targetY,
          behavior: "smooth"
        });
      }
    });
  });
}
