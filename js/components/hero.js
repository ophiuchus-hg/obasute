// ヒーロー画像のKen Burns効果・パララックス・モバイルメニュー制御

export function initHero() {
  // ヒーロー画像のKen Burns効果の開始
  const heroImage = document.querySelector("#heroImage");
  if (heroImage) {
    heroImage.classList.add("kenburns-active");
  }

  // ヒーローのスクロールパララックス効果
  const heroCopy = document.querySelector(".hero-copy");

  // rAF スロットリングでパフォーマンス改善
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
          if (heroImage) {
            heroImage.style.transform = `scale(1.05) translateY(${scrolled * 0.12}px)`;
          }
          if (heroCopy) {
            heroCopy.style.transform = `translateY(${scrolled * 0.18}px)`;
            heroCopy.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

export function initMobileMenu() {
  // モバイルメニューの開閉制御
  const menuTrigger = document.querySelector("#menuTrigger");
  const siteNav = document.querySelector("#siteNav");
  const siteHeader = document.querySelector("#siteHeader");

  if (menuTrigger && siteNav && siteHeader) {
    menuTrigger.addEventListener("click", () => {
      const isExpanded = menuTrigger.getAttribute("aria-expanded") === "true";
      menuTrigger.setAttribute("aria-expanded", !isExpanded);
      menuTrigger.classList.toggle("active");
      siteNav.classList.toggle("open");
      siteHeader.classList.toggle("menu-open");
    });

    // リンクをクリックした際に自動で閉じる
    const navLinks = siteNav.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        menuTrigger.setAttribute("aria-expanded", "false");
        menuTrigger.classList.remove("active");
        siteNav.classList.remove("open");
        siteHeader.classList.remove("menu-open");
      });
    });
  }
}
