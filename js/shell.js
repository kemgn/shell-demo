(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});
  const { escapeHtml, icon } = ns.Utils;

  const navLinks = [
    { href: "#/app/dashboard", page: "dashboard", label: "Pano" },
    { href: "#/app/records", page: "records", label: "Kayıtlar" },
    { href: "#/app/workflows", page: "workflows", label: "İş akışları" },
    { href: "#/config", page: "config", label: "Yapılandırma" }
  ];

  function render(route) {
    const state = ns.State.get();
    const leftMode = getSideMode(state, "leftBar");
    const rightMode = getSideMode(state, "rightBar");
    const headerMode = getChromeMode(state, "header");
    const footerMode = getChromeMode(state, "footer");

    return `
      <div class="studio-shell">
        <div class="shell-toolbar" aria-label="Uygulama kabuğu görünürlük kontrolleri">
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
    classes.push(`is-layout-${state.frameLayout || "classic"}`);

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
        <strong>${isOpen ? "açık" : "kapalı"}</strong>
      </button>
    `;
  }

  function renderSideModePicker(area, currentMode, context) {
    return `
      <div class="side-mode-picker side-mode-picker-${context}" aria-label="${escapeHtml(area.label)} modu">
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
      <div class="side-mode-picker side-mode-picker-${context} chrome-mode-picker" aria-label="${escapeHtml(area.label)} modu">
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

    if (item.id === "divider") {
      return renderDivider(axis, settings, mode);
    }

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
    const href = getCompactHref(item.id, route, settings);

    if (item.id === "brand") {
      const brandIcon = `<img src="assets/optimate-hexagon.svg" alt="">`;
      const label = escapeHtml(item.label);

      if (href) {
        return `<a class="${className} brand-compact-icon" href="${href}" aria-label="${label}" title="${label}">${brandIcon}</a>`;
      }

      return `<button class="${className} brand-compact-icon" type="button" aria-label="${label}" title="${label}">${brandIcon}</button>`;
    }

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
    const badge = item.id === "notifications" ? `<span class="compact-badge">${escapeHtml(settings.count || "0")}</span>` : "";

    if (href) {
      return `<a class="${className}" href="${href}" aria-label="${escapeHtml(item.label)}" title="${escapeHtml(item.label)}">${escapeHtml(label)}${badge}</a>`;
    }

    return `<button class="${className}" type="button" aria-label="${escapeHtml(item.label)}" title="${escapeHtml(item.label)}">${escapeHtml(label)}${badge}</button>`;
  }

  function renderDivider(axis, settings, mode) {
    const orientation = getDividerOrientation(axis, settings);
    const ariaOrientation = orientation === "vertical" ? "vertical" : "horizontal";

    return `
      <span class="shell-divider shell-divider-${orientation} shell-divider-mode-${escapeHtml(mode)}" role="separator" aria-orientation="${ariaOrientation}"></span>
    `;
  }

  function getDividerOrientation(axis, settings) {
    if (settings.orientation === "vertical" || settings.orientation === "horizontal") {
      return settings.orientation;
    }

    return axis === "horizontal" ? "vertical" : "horizontal";
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
      ? { label: "Yapılandırma", title: "Uygulama kabuğu yapılandırması" }
      : ns.Content.getPageMeta(route.page);

    switch (item.id) {
      case "brand":
        return `
          <a class="shell-item brand-item brand-item-logo" href="#/app/dashboard" aria-label="Optimate Solutions ana sayfa">
            <img src="assets/logo-light.png" alt="${escapeHtml(settings.label || "Optimate Solutions")}">
          </a>
        `;
      case "workspace-switcher":
        return renderWorkspaceSwitcher(instance.id, settings);
      case "user-menu":
        return `
          <button class="shell-item user-menu" type="button">
            <span class="avatar">${escapeHtml(settings.initials || "KG")}</span>
            <span>${escapeHtml(settings.label || "Mimar")}</span>
          </button>
        `;
      case "breadcrumbs":
        return `
          <nav class="shell-item breadcrumbs" aria-label="Yol bilgisi">
            <span>${escapeHtml(settings.rootLabel || "Stüdyo")}</span>
            <span>${escapeHtml(meta.label)}</span>
          </nav>
        `;
      case "primary-nav":
        return `
          <nav class="shell-item primary-nav primary-nav-${areaId}" aria-label="Ana navigasyon">
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
            <span>Arama</span>
            <input type="search" placeholder="${escapeHtml(settings.placeholder || "Kayıt, akış, sayfa...")}" aria-label="Genel arama">
          </label>
        `;
      case "command-button":
        return `
          <a class="shell-item command-button" href="${escapeHtml(settings.href || "#/config")}">
            ${icon("CMD")}
            <span>${escapeHtml(settings.label || "Yapılandır")}</span>
          </a>
        `;
      case "quick-actions":
        return `
          <div class="shell-item quick-actions">
            <span class="mini-title">${escapeHtml(settings.title || "Hızlı işlemler")}</span>
            ${parseLines(settings.actionsText).map((action) => `<button type="button">${escapeHtml(action)}</button>`).join("")}
          </div>
        `;
      case "ai-assistant":
        return `
          <a class="shell-item ai-card" href="#/config">
            <strong>${escapeHtml(settings.title || "Yapay zeka yardımcısı")}</strong>
            <span>${escapeHtml(settings.subtitle || "Kabuk öğeleri öner")}</span>
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
            <span class="mini-title">${escapeHtml(settings.title || "Çalışma alanı")}</span>
            <strong>${escapeHtml(settings.status || "Yayında")}</strong>
            <small>${escapeHtml(settings.note || "Son yayın 14:32")}</small>
          </div>
        `;
      case "environment-chip":
        return `<span class="shell-item chip-item">${escapeHtml(settings.label || "Sandbox çıktısı")}</span>`;
      case "sync-status":
        return `<span class="shell-item sync-item"><i></i> ${escapeHtml(settings.label || "Ayarlar yerelde kayıtlı")}</span>`;
      case "version":
        return `<span class="shell-item version-item">${escapeHtml(settings.label || "v0.1 prototip")}</span>`;
      case "record-counter":
        return `
          <div class="shell-item counter-card">
            <span>${escapeHtml(settings.label || "Kayıtlar")}</span>
            <strong>${escapeHtml(settings.value || "18,432")}</strong>
            <small>${escapeHtml(settings.delta || "+12.4%")}</small>
          </div>
        `;
      case "inspector-summary":
        return `
          <div class="shell-item inspector-card">
            <span class="mini-title">${escapeHtml(settings.title || "İnceleyici")}</span>
            <strong>${escapeHtml(meta.title)}</strong>
            <small>${escapeHtml(settings.note || "4 bölge, 12 görünür blok")}</small>
          </div>
        `;
      case "activity-feed":
        return `
          <div class="shell-item activity-feed">
            <span class="mini-title">Aktivite</span>
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
    const title = settings.title || "Favoriler";
    const links = parseLinks(settings.linksText);

    if (settings.variant === "dropdown") {
      return `
        <details class="shell-item favorites-menu favorites-menu-dropdown">
          <summary>
            <span>${escapeHtml(title)}</span>
            <i aria-hidden="true"></i>
          </summary>
          <div class="favorites-dropdown-menu">
            ${links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
          </div>
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
      <details class="shell-item stacked-card favorites-menu favorites-menu-collapse" open>
        <summary>${escapeHtml(title)}</summary>
        ${links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
      </details>
    `;
  }

  function renderWorkspaceSwitcher(instanceId, settings) {
    const workspaces = parseWorkspaces(settings.workspacesText);
    const activeWorkspace = workspaces.find((workspace) => workspace.id === settings.activeWorkspaceId)
      || workspaces[0];
    const activeLabel = settings.label || activeWorkspace.label;
    const activeInitials = settings.initials || activeWorkspace.initials;

    return `
      <details class="shell-item workspace-switcher-menu">
        <summary>
          <span class="workspace-avatar">${escapeHtml(activeInitials)}</span>
          <span class="workspace-summary-text">
            <small>${escapeHtml(settings.eyebrow || "Çalışma alanı")}</small>
            <strong>${escapeHtml(activeLabel)}</strong>
          </span>
          <i aria-hidden="true"></i>
        </summary>
        <div class="workspace-menu-panel">
          <label class="workspace-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Ara" aria-label="Çalışma alanı ara" data-workspace-search>
          </label>
          <div class="workspace-option-list">
            ${workspaces.map((workspace) => renderWorkspaceOption(instanceId, workspace, activeWorkspace.id)).join("")}
            <span class="workspace-empty" hidden>Eşleşen çalışma alanı yok</span>
          </div>
        </div>
      </details>
    `;
  }

  function renderWorkspaceOption(instanceId, workspace, activeWorkspaceId) {
    const isActive = workspace.id === activeWorkspaceId;

    return `
      <button class="workspace-option ${isActive ? "is-active" : ""}" type="button" data-action="select-workspace" data-id="${instanceId}" data-workspace-id="${escapeHtml(workspace.id)}" data-label="${escapeHtml(workspace.label)}" data-initials="${escapeHtml(workspace.initials)}" data-search-key="${escapeHtml(`${workspace.initials} ${workspace.label}`.toLowerCase())}">
        <span class="workspace-avatar">${escapeHtml(workspace.initials)}</span>
        <strong>${escapeHtml(workspace.label)}</strong>
        ${isActive ? `<span class="workspace-check" aria-label="Seçili">✓</span>` : ""}
      </button>
    `;
  }

  function parseWorkspaces(value) {
    const workspaces = parseLines(value).map((line, index) => {
      const [id, initials, label] = line.split("|");
      const safeLabel = (label || initials || id || `Çalışma alanı ${index + 1}`).trim();

      return {
        id: (id || `workspace-${index + 1}`).trim(),
        initials: (initials || safeLabel.slice(0, 2)).trim().slice(0, 3).toUpperCase(),
        label: safeLabel
      };
    }).filter((workspace) => workspace.label);

    return workspaces.length ? workspaces : [
      { id: "pipipipipi", initials: "PW", label: "Pipipipipi’nin çalışma alanı" },
      { id: "untitled", initials: "UW", label: "Adsız çalışma alanı" }
    ];
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
      { label: "Müşteri panosu", href: "#/app/records" },
      { label: "Onay hattı", href: "#/app/workflows" }
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
