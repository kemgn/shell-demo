(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});
  const { escapeHtml, icon } = ns.Utils;

  const navLinks = [
    { href: "#/app/dashboard", page: "dashboard", label: "Dashboard" },
    { href: "#/app/records", page: "records", label: "Records" },
    { href: "#/app/workflows", page: "workflows", label: "Workflows" },
    { href: "#/config", page: "config", label: "Config" }
  ];

  function render(route) {
    const state = ns.State.get();
    const leftMode = getSideMode(state, "leftBar");
    const rightMode = getSideMode(state, "rightBar");
    const headerMode = getChromeMode(state, "header");
    const footerMode = getChromeMode(state, "footer");

    return `
      <div class="studio-shell">
        <div class="shell-toolbar" aria-label="Shell visibility controls">
          ${ns.State.areas.map((area) => renderToolbarControl(area, state)).join("")}
        </div>
        <div class="app-frame ${frameClasses(state)}">
          ${headerMode !== "hidden" ? renderHeader(state, route) : ""}
          <div class="app-body">
            ${leftMode !== "hidden" ? renderSide("leftBar", state, route) : ""}
            <main class="content-host" id="content" tabindex="-1">
              ${ns.Content.render(route)}
            </main>
            ${rightMode !== "hidden" ? renderSide("rightBar", state, route) : ""}
          </div>
          ${footerMode !== "hidden" ? renderFooter(state, route) : ""}
        </div>
      </div>
    `;
  }

  function frameClasses(state) {
    const classes = ns.State.areas
      .filter((area) => !ns.State.sideAreaIds.has(area.id) && !ns.State.chromeAreaIds.has(area.id) && !state.areas[area.id].isOpen)
      .map((area) => `is-${area.id}-closed`);

    classes.push(`is-leftBar-${getSideMode(state, "leftBar")}`);
    classes.push(`is-rightBar-${getSideMode(state, "rightBar")}`);
    classes.push(`is-header-${getChromeMode(state, "header")}`);
    classes.push(`is-footer-${getChromeMode(state, "footer")}`);

    return classes.join(" ");
  }

  function getSideMode(state, areaId) {
    return state.areas[areaId].mode || (state.areas[areaId].isOpen ? "visible" : "hidden");
  }

  function getChromeMode(state, areaId) {
    return state.areas[areaId].mode || (state.areas[areaId].isOpen ? "visible" : "hidden");
  }

  function renderToolbarControl(area, state) {
    if (ns.State.sideAreaIds.has(area.id)) {
      return renderSideModePicker(area, getSideMode(state, area.id), "toolbar");
    }

    if (ns.State.chromeAreaIds.has(area.id)) {
      return renderChromeModePicker(area, getChromeMode(state, area.id), "toolbar");
    }

    return renderAreaToggle(area, state.areas[area.id].isOpen);
  }

  function renderAreaToggle(area, isOpen) {
    return `
      <button class="toolbar-pill ${isOpen ? "is-active" : ""}" type="button" data-action="toggle-area" data-area="${area.id}">
        <span>${escapeHtml(area.label)}</span>
        <strong>${isOpen ? "on" : "off"}</strong>
      </button>
    `;
  }

  function renderSideModePicker(area, currentMode, context) {
    return `
      <div class="side-mode-picker side-mode-picker-${context}" aria-label="${escapeHtml(area.label)} mode">
        <span>${escapeHtml(area.label)}</span>
        <div>
          ${ns.State.sideModes.map((mode) => `
            <button class="${mode.id === currentMode ? "is-active" : ""}" type="button" data-action="set-side-mode" data-area="${area.id}" data-mode="${mode.id}" title="${escapeHtml(mode.label)}">
              ${escapeHtml(mode.label.slice(0, 1))}
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderChromeModePicker(area, currentMode, context) {
    return `
      <div class="side-mode-picker side-mode-picker-${context} chrome-mode-picker" aria-label="${escapeHtml(area.label)} mode">
        <span>${escapeHtml(area.label)}</span>
        <div>
          ${ns.State.chromeModes.map((mode) => `
            <button class="${mode.id === currentMode ? "is-active" : ""}" type="button" data-action="set-chrome-mode" data-area="${area.id}" data-mode="${mode.id}" title="${escapeHtml(mode.label)}">
              ${escapeHtml(mode.label.slice(0, 1))}
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderHeader(state, route) {
    const mode = getChromeMode(state, "header");

    return `
      <header class="chrome-zone chrome-header chrome-zone-mode-${mode}" data-mode="${mode}">
        ${renderSlot("header", "left", state, route, mode)}
        ${renderSlot("header", "center", state, route, mode)}
        ${renderSlot("header", "right", state, route, mode)}
      </header>
    `;
  }

  function renderFooter(state, route) {
    const mode = getChromeMode(state, "footer");

    return `
      <footer class="chrome-zone chrome-footer chrome-zone-mode-${mode}" data-mode="${mode}">
        ${renderSlot("footer", "left", state, route, mode)}
        ${renderSlot("footer", "center", state, route, mode)}
        ${renderSlot("footer", "right", state, route, mode)}
      </footer>
    `;
  }

  function renderSide(areaId, state, route) {
    const side = areaId === "leftBar" ? "left" : "right";
    const mode = getSideMode(state, areaId);

    return `
      <aside class="chrome-side chrome-side-${side} chrome-side-mode-${mode}" data-mode="${mode}">
        ${renderSlot(areaId, "top", state, route)}
        ${renderSlot(areaId, "middle", state, route)}
        ${renderSlot(areaId, "bottom", state, route)}
      </aside>
    `;
  }

  function renderSlot(areaId, slot, state, route, areaMode) {
    const items = state.areas[areaId].slots[slot];
    const axis = ns.State.areas.find((area) => area.id === areaId).axis;
    const mode = areaMode || state.areas[areaId].mode || "visible";

    return `
      <div class="shell-slot shell-slot-${slot} shell-slot-${axis}" data-area="${areaId}" data-slot="${slot}">
        ${items.length ? items.map((instance) => renderSlotInstance(instance, areaId, axis, mode, route)).join("") : `
          <span class="empty-slot">${escapeHtml(ns.State.slotLabels[slot])}</span>
        `}
      </div>
    `;
  }

  function renderSlotInstance(instance, areaId, axis, mode, route) {
    const item = ns.Catalog.getItem(instance.itemId);
    const settings = ns.Catalog.mergeSettings(instance.itemId, instance.settings);

    if (axis === "horizontal" && mode === "compact") {
      return renderCompactItem(item, settings, route, "compact-item");
    }

    if (axis !== "vertical") {
      return renderShellItem(instance, areaId, route);
    }

    return `
      <div class="rail-item" title="${escapeHtml(item.label)}">
        ${renderCompactItem(item, settings, route, "rail-icon")}
        <div class="rail-content">
          ${renderShellItem(instance, areaId, route)}
        </div>
      </div>
    `;
  }

  function renderCompactItem(item, settings, route, className) {
    const labelSource = settings.compactLabel
      || settings.initials
      || settings.count
      || settings.title
      || settings.label
      || item.label;
    const label = labelSource
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    const displayLabel = item.id === "brand" ? (settings.compactLabel || "O") : label;
    const href = getCompactHref(item.id, route, settings);
    const badge = item.id === "notifications" ? `<span class="compact-badge">${escapeHtml(settings.count || "0")}</span>` : "";

    if (href) {
      return `<a class="${className}" href="${href}" aria-label="${escapeHtml(item.label)}" title="${escapeHtml(item.label)}">${escapeHtml(displayLabel)}${badge}</a>`;
    }

    return `<button class="${className}" type="button" aria-label="${escapeHtml(item.label)}" title="${escapeHtml(item.label)}">${escapeHtml(displayLabel)}${badge}</button>`;
  }

  function getCompactHref(itemId, route, settings) {
    const hrefs = {
      brand: "#/app/dashboard",
      breadcrumbs: "#/app/dashboard",
      "primary-nav": "#/app/dashboard",
      favorites: "#/app/records",
      "command-button": "#/config",
      "quick-actions": "#/app/records",
      "ai-assistant": "#/config",
      "inspector-summary": "#/config",
      "activity-feed": "#/app/workflows"
    };

    if (itemId === "command-button" && settings.href) {
      return settings.href;
    }

    if (itemId === "global-search") {
      return route.name === "config" ? "#/config" : `#/app/${route.page || "dashboard"}`;
    }

    return hrefs[itemId] || "";
  }

  function renderShellItem(instance, areaId, route) {
    const item = ns.Catalog.getItem(instance.itemId);
    const settings = ns.Catalog.mergeSettings(instance.itemId, instance.settings);
    const meta = route.name === "config"
      ? { label: "Config", title: "Shell configuration" }
      : ns.Content.getPageMeta(route.page);

    switch (item.id) {
      case "brand":
        return `
          <a class="shell-item brand-item brand-item-logo" href="#/app/dashboard" aria-label="Optimate Solutions home">
            <img src="assets/logo-light.png" alt="${escapeHtml(settings.label || "Optimate Solutions")}">
          </a>
        `;
      case "workspace-switcher":
        return `
          <button class="shell-item workspace-switcher" type="button">
            <span>${escapeHtml(settings.eyebrow || "Client")}</span>
            <strong>${escapeHtml(settings.label || "Atlas Retail")}</strong>
          </button>
        `;
      case "user-menu":
        return `
          <button class="shell-item user-menu" type="button">
            <span class="avatar">${escapeHtml(settings.initials || "KG")}</span>
            <span>${escapeHtml(settings.label || "Mimar")}</span>
          </button>
        `;
      case "breadcrumbs":
        return `
          <nav class="shell-item breadcrumbs" aria-label="Breadcrumb">
            <span>${escapeHtml(settings.rootLabel || "Studio")}</span>
            <span>${escapeHtml(meta.label)}</span>
          </nav>
        `;
      case "primary-nav":
        return `
          <nav class="shell-item primary-nav primary-nav-${areaId}" aria-label="Primary">
            ${navLinks.map((link) => `
              <a class="${isActive(link, route) ? "is-active" : ""}" href="${link.href}">
                ${icon(link.label.slice(0, 2))}
                <span>${escapeHtml(link.label)}</span>
              </a>
            `).join("")}
          </nav>
        `;
      case "favorites":
        return renderFavorites(settings);
      case "global-search":
        return `
          <label class="shell-item search-box">
            <span>Search</span>
            <input type="search" placeholder="${escapeHtml(settings.placeholder || "Record, flow, page...")}" aria-label="Global search">
          </label>
        `;
      case "command-button":
        return `
          <a class="shell-item command-button" href="${escapeHtml(settings.href || "#/config")}">
            ${icon("CMD")}
            <span>${escapeHtml(settings.label || "Configure")}</span>
          </a>
        `;
      case "quick-actions":
        return `
          <div class="shell-item quick-actions">
            <span class="mini-title">${escapeHtml(settings.title || "Quick actions")}</span>
            ${parseLines(settings.actionsText).map((action) => `<button type="button">${escapeHtml(action)}</button>`).join("")}
          </div>
        `;
      case "ai-assistant":
        return `
          <a class="shell-item ai-card" href="#/config">
            <strong>${escapeHtml(settings.title || "AI Builder")}</strong>
            <span>${escapeHtml(settings.subtitle || "Suggest shell items")}</span>
          </a>
        `;
      case "notifications":
        return `
          <button class="shell-item notification-button" type="button">
            ${icon("N")}
            <span>${escapeHtml(settings.count || "0")}</span>
          </button>
        `;
      case "workspace-status":
        return `
          <div class="shell-item status-card">
            <span class="mini-title">${escapeHtml(settings.title || "Workspace")}</span>
            <strong>${escapeHtml(settings.status || "Published")}</strong>
            <small>${escapeHtml(settings.note || "Last deploy 14:32")}</small>
          </div>
        `;
      case "environment-chip":
        return `<span class="shell-item chip-item">${escapeHtml(settings.label || "Sandbox output")}</span>`;
      case "sync-status":
        return `<span class="shell-item sync-item"><i></i> ${escapeHtml(settings.label || "Config saved locally")}</span>`;
      case "version":
        return `<span class="shell-item version-item">${escapeHtml(settings.label || "v0.1 prototype")}</span>`;
      case "record-counter":
        return `
          <div class="shell-item counter-card">
            <span>${escapeHtml(settings.label || "Records")}</span>
            <strong>${escapeHtml(settings.value || "18,432")}</strong>
            <small>${escapeHtml(settings.delta || "+12.4%")}</small>
          </div>
        `;
      case "inspector-summary":
        return `
          <div class="shell-item inspector-card">
            <span class="mini-title">${escapeHtml(settings.title || "Inspector")}</span>
            <strong>${escapeHtml(meta.title)}</strong>
            <small>${escapeHtml(settings.note || "4 regions, 12 visible blocks")}</small>
          </div>
        `;
      case "activity-feed":
        return `
          <div class="shell-item activity-feed">
            <span class="mini-title">Activity</span>
            ${parseLines(settings.entriesText).map((entry) => `<p>${escapeHtml(entry)}</p>`).join("")}
          </div>
        `;
      default:
        return `
          <div class="shell-item generic-item">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.description)}</span>
          </div>
        `;
    }
  }

  function renderFavorites(settings) {
    const title = settings.title || "Favorites";
    const links = parseLinks(settings.linksText);

    if (settings.variant === "dropdown") {
      return `
        <details class="shell-item stacked-card favorites-menu">
          <summary>${escapeHtml(title)}</summary>
          ${links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
        </details>
      `;
    }

    if (settings.variant === "list") {
      return `
        <div class="shell-item stacked-card">
          <span class="mini-title">${escapeHtml(title)}</span>
          ${links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
        </div>
      `;
    }

    return `
      <details class="shell-item stacked-card favorites-menu" open>
        <summary>${escapeHtml(title)}</summary>
        ${links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
      </details>
    `;
  }

  function parseLines(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function parseLinks(value) {
    const links = parseLines(value).map((line) => {
      const [label, href] = line.split("|");
      return {
        label: (label || "").trim(),
        href: (href || "#").trim()
      };
    }).filter((link) => link.label);

    return links.length ? links : [
      { label: "Customer board", href: "#/app/records" },
      { label: "Approval lane", href: "#/app/workflows" }
    ];
  }

  function isActive(link, route) {
    if (link.page === "config") {
      return route.name === "config";
    }

    return route.page === link.page;
  }

  ns.Shell = {
    render,
    renderSideModePicker,
    renderChromeModePicker
  };
})();
