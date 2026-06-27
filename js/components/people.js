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

        const desc = document.createElement("span");
        desc.textContent = item.description;

        container.append(title, desc);
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
