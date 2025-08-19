export default function initTabsIndicator() {
  const menu = document.querySelector(".v-tabs_menu");

  if (!menu) return;

  // Create and inject the indicator
  const indicator = document.createElement("div");
  indicator.className = "tab-indicator";
  menu.appendChild(indicator);

  function updateIndicator() {
    const activeTab = menu.querySelector(".v-tabs_link.w--current");
    if (!activeTab) return;

    const tabRect = activeTab.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    // Position the indicator relative to menu
    const left = tabRect.left - menuRect.left;
    const top = tabRect.top - menuRect.top;

    indicator.style.width = `${tabRect.width}px`;
    indicator.style.left = `${left}px`;
    indicator.style.top = `${top + tabRect.height * 0.025}px`;
    indicator.style.height = `${tabRect.height * 0.95}px`;
  }

  // Initial load
  updateIndicator();

  // Tab click tracking
  const tabs = menu.querySelectorAll(".v-tabs_link");
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => setTimeout(updateIndicator, 50))
  );

  // Resize observer for responsiveness
  window.addEventListener("resize", updateIndicator);
}
