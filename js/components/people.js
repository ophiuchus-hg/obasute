// 人々とリンクの描画

import { peopleData, linksData } from "../data/people.js";

export function renderPeopleAndLinks() {
  const peopleContainer = document.querySelector("#peopleItems");
  const linksContainer = document.querySelector("#linksItems");

  if (peopleContainer) {
    peopleContainer.replaceChildren(
      ...peopleData.map((item) => {
        const li = document.createElement("li");
        li.className = "related-link-item";

        const container = item.url ? document.createElement("a") : document.createElement("div");
        if (item.url) {
          container.href = item.url;
          container.target = "_blank";
          container.rel = "noopener noreferrer";
        } else {
          container.className = "related-link-static";
        }

        const title = document.createElement("strong");
        title.textContent = item.title;
        container.append(title);

        if (item.img) {
          const img = document.createElement("img");
          img.src = item.img;
          img.alt = `${item.title}`;
          img.className = "related-link-img";
          container.append(img);
        } else if (item.imgs && item.imgs.length >= 2) {
          if (item.title.includes("ずくなし農園")) {
            const logoContainer = document.createElement("div");
            logoContainer.className = "zukunashi-logo-container";

            const sara2Img = document.createElement("img");
            sara2Img.src = item.imgs[1];
            sara2Img.alt = "さらしなの里";
            sara2Img.className = "sara2-img";

            const sara1Img = document.createElement("img");
            sara1Img.src = item.imgs[0];
            sara1Img.alt = "Zukunashi Farm";
            sara1Img.className = "sara1-img";

            logoContainer.append(sara2Img, sara1Img);
            container.append(logoContainer);
          } else if (item.title.includes("金井農園")) {
            const logoContainer = document.createElement("div");
            logoContainer.className = "kanai-logo-container";

            const flowerImg = document.createElement("img");
            flowerImg.src = item.imgs[0];
            flowerImg.alt = "リンゴの花";
            flowerImg.className = "kanai-flower-img";

            const logoImg = document.createElement("img");
            logoImg.src = item.imgs[1];
            logoImg.alt = "金井農園";
            logoImg.className = "kanai-logo-img";

            logoContainer.append(flowerImg, logoImg);
            container.append(logoContainer);
          } else {
            const img1 = document.createElement("img");
            img1.src = item.imgs[0];
            img1.alt = `${item.title}`;
            img1.className = "related-link-img";
            container.append(img1);
          }
        }

        if (item.description) {
          const desc = document.createElement("span");
          desc.textContent = item.description;
          container.append(desc);
        }

        if (item.imgs && item.imgs.length >= 2 && !item.title.includes("ずくなし農園") && !item.title.includes("金井農園")) {
          for (let i = 1; i < item.imgs.length; i++) {
            const img = document.createElement("img");
            img.src = item.imgs[i];
            img.alt = `${item.title} ${i + 1}`;
            img.className = "related-link-img";
            img.style.marginTop = "12px";
            container.append(img);
          }
        }
        li.append(container);
        return li;
      })
    );
  }

  if (linksContainer) {
    linksContainer.replaceChildren(
      ...linksData.map((item) => {
        const li = document.createElement("li");
        li.className = "related-link-item";

        const container = document.createElement("a");
        container.href = item.url;
        container.target = "_blank";
        container.rel = "noopener noreferrer";

        const title = document.createElement("strong");
        title.textContent = item.title;

        const desc = document.createElement("span");
        desc.textContent = item.description;

        container.append(title, desc);
        li.append(container);
        return li;
      })
    );
  }
}
