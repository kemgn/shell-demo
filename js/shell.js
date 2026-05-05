(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});
  const { escapeHtml, icon, svgIcon, safeHref } = ns.Utils;
  let toolbarOpen = false;

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
    const isHeaderRail = headerMode === "left-rail";

    return `
      <div class="studio-shell">
        ${renderShellToolbar(state)}
        <div class="app-frame ${frameClasses(state)}">
          ${headerMode !== "hidden" && !isHeaderRail ? renderHeader(state, route) : ""}
          <div class="app-body">
            ${isHeaderRail ? renderHeaderRail(state, route) : ""}
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

  function renderShellToolbar(state) {
    return `
      <div class="shell-toolbar-drawer ${toolbarOpen ? "is-open" : ""}">
        <button class="shell-toolbar-trigger" type="button" data-action="toggle-shell-toolbar" aria-expanded="${toolbarOpen ? "true" : "false"}" aria-label="Bar ayarlarını ${toolbarOpen ? "kapat" : "aç"}">
          <span class="toolbar-trigger-icon toolbar-trigger-icon-closed">${svgIcon("chevrons-left")}</span>
          <span class="toolbar-trigger-icon toolbar-trigger-icon-open">${svgIcon("chevrons-right")}</span>
          <span class="toolbar-trigger-label">Bar ayarları</span>
        </button>
        <div class="shell-toolbar" aria-label="Uygulama kabuğu görünürlük kontrolleri">
          ${renderSavedLayoutPicker()}
          ${ns.State.areas.map((area) => renderToolbarControl(area, state)).join("")}
          ${renderToolbarConfigLink()}
        </div>
      </div>
    `;
  }

  function renderSavedLayoutPicker() {
    const layouts = ns.State.getSavedLayouts ? ns.State.getSavedLayouts() : (ns.State.savedLayoutPresets || []);
    const activeLayoutId = ns.State.getActiveSavedLayoutId ? ns.State.getActiveSavedLayoutId() : "default-layout";
    const activeLayout = layouts.find((layout) => layout.id === activeLayoutId);
    const isCustomLayout = ns.State.isCustomSavedLayout ? ns.State.isCustomSavedLayout(activeLayoutId) : false;
    const activeCustomLabel = isCustomLayout && activeLayout ? activeLayout.label : "";

    return `
      <div class="saved-layout-picker">
        <span>Kayıtlı layout</span>
        <div class="saved-layout-control">
          <select data-saved-layout-select aria-label="Kayıtlı layout düzeni seç">
            <option value="default-layout" ${activeLayoutId === "default-layout" ? "selected" : ""}>Default Layout</option>
            ${layouts.map((layout) => `
              <option value="${escapeHtml(layout.id)}" ${activeLayoutId === layout.id ? "selected" : ""}>${escapeHtml(layout.label)}</option>
            `).join("")}
          </select>
          <button class="saved-layout-reset-button" type="button" data-action="reset-config" aria-label="Layout ayarlarını sıfırla" title="Sıfırla">
            ${svgIcon("trash")}
            <span>Sıfırla</span>
          </button>
        </div>
        <div class="saved-layout-manage">
          <input type="text" value="${escapeHtml(activeCustomLabel)}" placeholder="Layout adı" aria-label="Kaydedilecek layout adı" data-saved-layout-name>
          <button class="saved-layout-save-button" type="button" data-action="save-current-layout" data-layout-id="${escapeHtml(isCustomLayout ? activeLayoutId : "")}">
            ${svgIcon("download")}
            <span>Kaydet</span>
          </button>
          <button class="saved-layout-delete-button" type="button" data-action="delete-saved-layout" data-layout-id="${escapeHtml(activeLayoutId)}" ${isCustomLayout ? "" : "disabled"}>
            ${svgIcon("trash")}
            <span>Sil</span>
          </button>
        </div>
      </div>
    `;
  }

  function renderToolbarConfigLink() {
    return `
      <a class="toolbar-config-link" href="#/config" aria-label="Layout ayar ekranına git" title="Layout ayar ekranı">
        ${svgIcon("settings")}
        <span>Config ekranı</span>
      </a>
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
        ${svgIcon(isOpen ? "eye" : "eye-off")}
        <span>${escapeHtml(area.label)}</span>
        <strong>${isOpen ? "açık" : "kapalı"}</strong>
      </button>
    `;
  }

  function renderModeIcon(modeId, areaId) {
    const icons = {
      visible: "eye",
      icon: areaId === "rightBar" ? "panel-right" : "panel-left",
      hover: "mouse",
      compact: areaId === "footer" ? "panel-bottom" : "panel-top",
      "left-rail": "panel-left",
      hidden: "eye-off"
    };

    return svgIcon(icons[modeId] || "eye");
  }

  function renderSideModePicker(area, currentMode, context) {
    return `
      <div class="side-mode-picker side-mode-picker-${context}" aria-label="${escapeHtml(area.label)} modu">
        <span>${escapeHtml(area.label)}</span>
        <div>
          ${ns.State.sideModes.map((mode) => `
            <button class="${mode.id === currentMode ? "is-active" : ""}" type="button" data-action="set-side-mode" data-area="${area.id}" data-mode="${mode.id}" title="${escapeHtml(mode.label)}" aria-label="${escapeHtml(`${area.label}: ${mode.label}`)}">
              ${renderModeIcon(mode.id, area.id)}
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
          ${ns.State.getChromeModes(area.id).map((mode) => `
            <button class="${mode.id === currentMode ? "is-active" : ""}" type="button" data-action="set-chrome-mode" data-area="${area.id}" data-mode="${mode.id}" title="${escapeHtml(mode.label)}" aria-label="${escapeHtml(`${area.label}: ${mode.label}`)}">
              ${renderModeIcon(mode.id, area.id)}
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
    const emptyClass = items.length ? "" : " is-empty";

    return `
      <div class="shell-slot shell-slot-${slot} shell-slot-${axis}${emptyClass}" data-area="${areaId}" data-slot="${slot}">
        ${items.map((instance) => renderSlotInstance(instance, areaId, axis, mode, route)).join("")}
      </div>
    `;
  }

  function renderSlotInstance(instance, areaId, axis, mode, route) {
    const item = ns.Catalog.getItem(instance.itemId);
    const settings = ns.Catalog.mergeSettings(instance.itemId, instance.settings);

    if (item.id === "divider") {
      return renderDivider(axis, settings, mode);
    }

    if ((axis === "horizontal" && mode === "compact" && item.id === "breadcrumbs") || (axis === "vertical" && item.id === "breadcrumbs")) {
      return "";
    }

    if (axis === "horizontal" && mode === "compact") {
      return renderCompactItem(item, settings, route, "compact-item", instance.id);
    }

    if (axis !== "vertical") {
      return renderShellItem(instance, areaId, route);
    }

    return `
      <div class="rail-item rail-item-${escapeHtml(item.id)}" title="${escapeHtml(item.label)}">
        ${item.id === "primary-nav"
          ? renderPrimaryNavRail(route)
          : renderCompactItem(item, settings, route, "rail-icon", instance.id)}
        <div class="rail-content">
          ${renderShellItem(instance, areaId, route)}
        </div>
      </div>
    `;
  }

  function renderCompactItem(item, settings, route, className, instanceId) {
    const href = getCompactHref(item.id, route, settings);

    if (item.id === "brand") {
      const brandIcon = `<img src="assets/optimate-hexagon.svg" alt="">`;
      const label = escapeHtml(item.label);

      if (href) {
        return `<a class="${className} brand-compact-icon" href="${escapeHtml(href)}" aria-label="${label}" title="${label}">${brandIcon}</a>`;
      }

      return `<button class="${className} brand-compact-icon" type="button" aria-label="${label}" title="${label}">${brandIcon}</button>`;
    }

    if (item.id === "tree-menu") {
      const entries = parseTreeItems(settings.itemsText);
      const activeEntry = getActiveTreeEntry(entries, route) || entries[0];
      const label = escapeHtml(settings.title || item.label);
      const roots = getTreeRootEntries(entries, activeEntry);

      return `
        <nav class="${className} tree-root-rail" aria-label="${label}" title="${label}">
          ${roots.map(({ entry, isActive }) => `
            <a class="${isActive ? "is-active" : ""}" href="${escapeHtml(safeHref(entry.href, "#/app/dashboard"))}" aria-label="${escapeHtml(entry.label)}" title="${escapeHtml(entry.label)}">
              ${icon(entry.icon)}
            </a>
          `).join("")}
        </nav>
      `;
    }

    if (item.id === "workspace-switcher") {
      return renderCompactWorkspaceSwitcher(instanceId, settings, className);
    }

    if (item.id === "user-menu") {
      return renderCompactUserMenu(settings, className);
    }

    const spec = getCompactSpec(item, settings, route);
    const classes = `${className} compact-item-${escapeHtml(item.id)} ${spec.isActive ? "is-active" : ""}`.trim();
    const content = spec.iconName
      ? svgIcon(spec.iconName)
      : spec.markText
        ? icon(spec.markText)
      : `<span class="compact-text">${escapeHtml(spec.text)}</span>`;
    const badge = spec.badge ? `<span class="compact-badge">${escapeHtml(spec.badge)}</span>` : "";

    const compactHref = Object.prototype.hasOwnProperty.call(spec, "href") ? spec.href : href;

    if (compactHref) {
      return `<a class="${classes}" href="${escapeHtml(compactHref)}" aria-label="${escapeHtml(spec.label)}" title="${escapeHtml(spec.label)}">${content}${badge}</a>`;
    }

    return `<button class="${classes}" type="button" aria-label="${escapeHtml(spec.label)}" title="${escapeHtml(spec.label)}">${content}${badge}</button>`;
  }

  function renderCompactWorkspaceSwitcher(instanceId, settings, className) {
    const workspaces = parseWorkspaces(settings.workspacesText);
    const activeWorkspace = workspaces.find((workspace) => workspace.id === settings.activeWorkspaceId)
      || workspaces[0];
    const initials = activeWorkspace ? activeWorkspace.initials : "BS";
    const label = activeWorkspace ? activeWorkspace.label : "Sayfa seçici";

    if (!instanceId) {
      return `<button class="${className} compact-item-workspace-switcher workspace-compact-icon" type="button" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}"><span class="compact-text">${escapeHtml(initials)}</span></button>`;
    }

    return `
      <details class="${className} compact-item-workspace-switcher workspace-compact-menu">
        <summary aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
          <span class="compact-text">${escapeHtml(initials)}</span>
        </summary>
        <div class="workspace-menu-panel compact-workspace-panel">
          <label class="workspace-search">
            ${svgIcon("search")}
            <input type="search" placeholder="Ara" aria-label="Sayfa ara" data-workspace-search>
          </label>
          <div class="workspace-option-list">
            ${workspaces.map((workspace) => renderWorkspaceOption(instanceId, workspace, activeWorkspace.id)).join("")}
            <span class="workspace-empty" hidden>Eşleşen sayfa yok</span>
          </div>
        </div>
      </details>
    `;
  }

  function renderCompactUserMenu(settings, className) {
    const label = settings.label || "Mimar";

    return `
      <details class="${className} compact-item-user-menu account-compact-menu">
        <summary aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
          <span class="compact-text account-icon-text">${svgIcon("user")}</span>
        </summary>
        ${renderAccountPanel(settings, "compact-account-panel")}
      </details>
    `;
  }

  function getCompactSpec(item, settings, route) {
    const routeMeta = route.name === "config"
      ? { label: "Yapılandırma", title: "Uygulama kabuğu yapılandırması" }
      : ns.Content.getPageMeta(route.page);
    const activeNav = navLinks.find((link) => isActive(link, route)) || navLinks[0];

    const specs = {
      "global-search": { iconName: "search", label: "Genel arama", href: "" },
      "user-menu": { iconName: "user", label: settings.label || item.label },
      breadcrumbs: { iconName: "breadcrumb", label: routeMeta.label, href: route.name === "config" ? "#/config" : `#/app/${route.page || "dashboard"}` },
      "primary-nav": { text: activeNav.label.slice(0, 2), label: activeNav.label, href: activeNav.href, isActive: true },
      favorites: { iconName: "star", label: settings.title || item.label, href: getFirstLinkHref(settings.linksText, "#/app/records") },
      "page-tabs": { iconName: "table", label: item.label, href: getFirstPageTabHref(settings.tabsText, "#/app/dashboard") },
      button: getActionButtonCompactSpec(item, settings),
      "icon-button": getActionButtonCompactSpec(item, settings, "+"),
      "icon-text-button": getActionButtonCompactSpec(item, settings),
      "command-button": { iconName: "command", label: settings.label || item.label, href: safeHref(settings.href, "#/config") },
      "command-palette": { iconName: "command", label: settings.label || item.label, href: safeHref(settings.href, "#/config") },
      notifications: { iconName: "bell", label: item.label, badge: settings.count || "0" },
      "workspace-status": { iconName: "status", label: settings.status || item.label },
      "environment-chip": { text: compactEnvironment(settings.label), label: settings.label || item.label },
      "sync-status": { iconName: "sync", label: settings.label || item.label },
      version: { text: compactVersion(settings.label), label: settings.label || item.label },
      "record-counter": { text: compactMetric(settings.value), label: settings.label || item.label },
      "mini-metric": { text: settings.value || compactText(settings.label || item.label), label: settings.label || item.label },
      "inspector-summary": { iconName: "file-text", label: settings.title || item.label, href: "#/config" },
      "activity-feed": { iconName: "activity", label: item.label, href: "#/app/workflows" }
    };

    return {
      text: compactText(settings.compactLabel || settings.icon || settings.initials || settings.count || settings.title || settings.label || item.label),
      label: item.label,
      ...specs[item.id]
    };
  }

  function getActionButtonCompactSpec(item, settings, fallbackText) {
    const iconName = String(settings.icon || "").trim().toLowerCase();
    const base = {
      label: settings.label || item.label,
      href: safeHref(settings.href, "#/config")
    };

    if (iconName === "settings" || iconName === "gear" || iconName === "cog") {
      return {
        ...base,
        text: "",
        iconName: "settings"
      };
    }

    if (iconName === "+" || iconName === "plus" || iconName === "add") {
      return {
        ...base,
        text: "",
        iconName: "plus"
      };
    }

    if (iconName === "?" || iconName === "help" || iconName === "info") {
      return {
        ...base,
        text: "",
        iconName: "info"
      };
    }

    return {
      ...base,
      markText: settings.icon || fallbackText || compactText(settings.label || item.label)
    };
  }

  function compactText(value) {
    return String(value || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "•";
  }

  function compactMetric(value) {
    const text = String(value || "").trim();
    return text.replace(/,(\d{3})$/, "k").slice(0, 5) || "0";
  }

  function compactVersion(value) {
    const text = String(value || "").trim();
    return text.replace(/^version\s*/i, "").slice(0, 5) || "v";
  }

  function compactEnvironment(value) {
    const text = String(value || "").trim().toLocaleLowerCase("tr-TR");

    if (text.includes("sandbox")) {
      return "SBX";
    }

    if (text.includes("canlı") || text.includes("prod")) {
      return "PRD";
    }

    return compactText(value);
  }

  function getFirstLinkHref(value, fallback) {
    const [firstLink] = parseLinks(value);
    return safeHref(firstLink && firstLink.href, fallback);
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
      "tree-menu": "#/app/dashboard",
      favorites: "#/app/records",
      button: "#/config",
      "icon-button": "#/config",
      "icon-text-button": "#/config",
      "command-button": "#/config",
      "command-palette": "#/config",
      "mini-metric": "#/app/workflows",
      "inspector-summary": "#/config",
      "activity-feed": "#/app/workflows"
    };

    if (["button", "icon-button", "icon-text-button", "command-button", "command-palette"].includes(itemId) && settings.href) {
      return safeHref(settings.href, hrefs[itemId]);
    }

    if (itemId === "global-search") {
      return route.name === "config" ? "#/config" : `#/app/${route.page || "dashboard"}`;
    }

    return safeHref(hrefs[itemId] || "", "");
  }

  function renderHeaderRail(state, route) {
    return `
      <aside class="chrome-header-rail" aria-label="Üst bar sol kompakt modu" data-mode="left-rail">
        ${renderSlot("header", "left", state, route, "compact")}
        ${renderSlot("header", "center", state, route, "compact")}
        ${renderSlot("header", "right", state, route, "compact")}
      </aside>
    `;
  }

  function renderActionButton(settings, presetVariant) {
    const href = escapeHtml(safeHref(settings.href, "#/config"));
    const labelText = settings.label || "Aksiyon";
    const label = escapeHtml(labelText);
    const rawIcon = settings.icon || labelText.slice(0, 2);
    const variant = normalizeButtonVariant(presetVariant || settings.variant || "text");
    const appearance = normalizeButtonAppearance(settings.appearance || "primary");
    const style = normalizeButtonStyle(settings.style || "filled");
    const classes = `shell-item shell-button shell-button-${variant.className} shell-button-${appearance} shell-button-style-${style}`;

    if (variant.id === "icon") {
      return `
        <a class="${classes}" href="${href}" aria-label="${label}" title="${label}">
          ${renderActionButtonIcon(rawIcon)}
        </a>
      `;
    }

    if (variant.id === "iconText") {
      return `
        <a class="${classes}" href="${href}">
          ${renderActionButtonIcon(rawIcon)}
          <span>${label}</span>
        </a>
      `;
    }

    return `
      <a class="${classes}" href="${href}">
        <span>${label}</span>
      </a>
    `;
  }

  function renderActionButtonIcon(rawIcon) {
    const iconName = String(rawIcon || "").trim().toLowerCase();

    if (iconName === "settings" || iconName === "gear" || iconName === "cog") {
      return svgIcon("settings");
    }

    return icon(rawIcon);
  }

  function normalizeButtonVariant(value) {
    if (value === "icon" || value === "icon-button") {
      return { id: "icon", className: "icon" };
    }

    if (value === "iconText" || value === "icon-text" || value === "icon-text-button") {
      return { id: "iconText", className: "icon-text" };
    }

    return { id: "text", className: "text" };
  }

  function normalizeButtonAppearance(value) {
    return ["primary", "secondary", "danger", "ghost"].includes(value) ? value : "primary";
  }

  function normalizeButtonStyle(value) {
    return ["filled", "outlined", "text"].includes(value) ? value : "filled";
  }

  function renderShellItem(instance, areaId, route) {
    const item = ns.Catalog.getItem(instance.itemId);
    const settings = ns.Catalog.mergeSettings(instance.itemId, instance.settings);
    const meta = route.name === "config"
      ? { label: "Yapılandırma", title: "Uygulama kabuğu yapılandırması" }
      : ns.Content.getPageMeta(route.page);

    switch (item.id) {
      case "brand":
        if (settings.compact === true || settings.compact === "true") {
          return `
            <a class="shell-item brand-item brand-item-logo brand-item-logo-compact" href="#/app/dashboard" aria-label="Optimate Solutions ana sayfa">
              <img src="assets/optimate-hexagon.svg" alt="${escapeHtml(settings.label || "Optimate Solutions")}">
            </a>
          `;
        }

        return `
          <a class="shell-item brand-item brand-item-logo" href="#/app/dashboard" aria-label="Optimate Solutions ana sayfa">
            <img src="assets/logo-light.png" alt="${escapeHtml(settings.label || "Optimate Solutions")}">
          </a>
        `;
      case "workspace-switcher":
        return renderWorkspaceSwitcher(instance.id, settings);
      case "page-tabs":
        return renderPageTabs(settings, route);
      case "user-menu":
        return renderUserMenu(settings);
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
      case "tree-menu":
        return renderTreeMenu(settings, route);
      case "favorites":
        return renderFavorites(settings);
      case "global-search":
        return `
          <label class="shell-item search-box">
            ${svgIcon("search")}
            <input type="search" placeholder="${escapeHtml(settings.placeholder || "Kayıt, akış, sayfa...")}" aria-label="Genel arama">
          </label>
        `;
      case "button":
        return renderActionButton(settings);
      case "icon-button":
        return renderActionButton({ ...settings, variant: "icon" });
      case "icon-text-button":
        return renderActionButton({ ...settings, variant: "iconText" });
      case "command-button":
        return `
          <a class="shell-item command-button" href="${escapeHtml(safeHref(settings.href, "#/config"))}">
            ${icon("CMD")}
            <span>${escapeHtml(settings.label || "Yapılandır")}</span>
          </a>
        `;
      case "command-palette":
        return renderCommandPalette(settings);
      case "notifications":
        return `
          <button class="shell-item notification-button" type="button" aria-label="${escapeHtml(`${settings.count || "0"} bildirim`)}" title="Bildirimler">
            <span class="notification-icon">${svgIcon("bell")}</span>
            <span class="notification-count">${escapeHtml(settings.count || "0")}</span>
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
      case "mini-metric":
        return renderMiniMetric(settings);
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

  function renderUserMenu(settings) {
    const label = settings.label || "Mimar";
    const isAvatarOnly = settings.variant === "avatar";

    return `
      <details class="shell-item user-menu user-menu-popover ${isAvatarOnly ? "user-menu-avatar" : ""}">
        <summary aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
          <span class="avatar account-avatar">${svgIcon("user")}</span>
          ${isAvatarOnly ? "" : `<span>${escapeHtml(label)}</span>`}
        </summary>
        ${renderAccountPanel(settings)}
      </details>
    `;
  }

  function renderAccountPanel(settings, extraClass = "") {
    const label = settings.label || "Mimar";

    return `
      <div class="account-menu-panel ${extraClass}">
        <div class="account-menu-head">
          <span class="avatar account-avatar">${svgIcon("user")}</span>
          <div>
            <strong>${escapeHtml(label)}</strong>
            <small>Platform mimarı</small>
          </div>
        </div>
        <a href="#/config">${svgIcon("user")} Profil</a>
        <a href="#/config">${svgIcon("settings")} Hesap ayarları</a>
        <a href="#/config">${svgIcon("info")} Yardım ve destek</a>
        <button type="button">${svgIcon("chevrons-right")} Oturumu kapat</button>
      </div>
    `;
  }

  function renderPrimaryNavRail(route) {
    return `
      <nav class="primary-nav-rail" aria-label="Ana navigasyon kompakt">
        ${navLinks.map((link) => `
          <a class="rail-icon primary-nav-rail-link ${isActive(link, route) ? "is-active" : ""}" href="${link.href}" aria-label="${escapeHtml(link.label)}" title="${escapeHtml(link.label)}">
            ${icon(link.label.slice(0, 2))}
          </a>
        `).join("")}
      </nav>
    `;
  }

  function renderTreeMenu(settings, route) {
    const title = settings.title || "Tree menü";
    const variant = settings.variant === "compact" ? "compact" : "nested";
    const entries = parseTreeItems(settings.itemsText);
    const activeEntry = getActiveTreeEntry(entries, route);

    return `
      <nav class="shell-item tree-menu tree-menu-${variant}" aria-label="${escapeHtml(title)}">
        <span class="mini-title">${escapeHtml(title)}</span>
        <div class="tree-menu-list">
          ${entries.map((entry) => `
            <a class="${entry === activeEntry ? "is-active" : ""}" href="${escapeHtml(entry.href)}" style="--tree-level: ${entry.level}">
              ${icon(entry.icon)}
              <span>${escapeHtml(entry.label)}</span>
            </a>
          `).join("")}
        </div>
      </nav>
    `;
  }

  function getActiveTreeEntry(entries, route) {
    return entries.reduce((activeEntry, entry) => {
      if (!isHrefActive(entry.href, route)) {
        return activeEntry;
      }

      if (!activeEntry || entry.level >= activeEntry.level) {
        return entry;
      }

      return activeEntry;
    }, null);
  }

  function getTreeRootEntries(entries, activeEntry) {
    const roots = [];
    let currentRoot = null;

    entries.forEach((entry) => {
      if (entry.level === 0 || !currentRoot) {
        currentRoot = { entry, isActive: false };
        roots.push(currentRoot);
      }

      if (entry === activeEntry && currentRoot) {
        currentRoot.isActive = true;
      }
    });

    return roots.length ? roots : [{ entry: activeEntry || entries[0], isActive: true }].filter((root) => root.entry);
  }

  function renderCommandPalette(settings) {
    const label = settings.label || "Komut paleti";
    const variant = settings.variant === "compact" ? "compact" : "inline";

    return `
      <a class="shell-item command-palette command-palette-${variant}" href="${escapeHtml(safeHref(settings.href, "#/config"))}">
        ${icon(settings.icon || "⌘")}
        ${variant === "compact" ? "" : `<span>${escapeHtml(label)}</span>`}
        <kbd>${escapeHtml(settings.shortcut || "Ctrl K")}</kbd>
      </a>
    `;
  }

  function renderMiniMetric(settings) {
    const variant = settings.variant === "stacked" ? "stacked" : "inline";

    return `
      <div class="shell-item mini-metric mini-metric-${variant}">
        <span>${escapeHtml(settings.label || "Aktif akış")}</span>
        <strong>${escapeHtml(settings.value || "42")}</strong>
        <small>${escapeHtml(settings.note || "6 bekleyen")}</small>
        <em>${escapeHtml(settings.trend || "+8%")}</em>
      </div>
    `;
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
            ${links.map(renderFavoriteLink).join("")}
          </div>
        </details>
      `;
    }

    if (settings.variant === "list") {
      return `
        <div class="shell-item stacked-card">
          <span class="mini-title">${escapeHtml(title)}</span>
          ${links.map(renderFavoriteLink).join("")}
        </div>
      `;
    }

    return `
      <nav class="shell-item favorites-menu favorites-menu-list" aria-label="${escapeHtml(title)}">
        <span class="mini-title">${escapeHtml(title)}</span>
        <div class="favorites-link-list">
          ${links.map(renderFavoriteTreeLink).join("")}
        </div>
      </nav>
    `;
  }

  function renderFavoriteLink(link) {
    return `<a href="${escapeHtml(safeHref(link.href, "#"))}">${escapeHtml(link.label)}</a>`;
  }

  function renderFavoriteTreeLink(link) {
    return `
      <a href="#">
        ${icon(link.label.slice(0, 2))}
        <span>${escapeHtml(link.label)}</span>
      </a>
    `;
  }

  function renderWorkspaceSwitcher(instanceId, settings) {
    const workspaces = parseWorkspaces(settings.workspacesText);
    const activeWorkspace = workspaces.find((workspace) => workspace.id === settings.activeWorkspaceId)
      || workspaces[0];
    const eyebrow = settings.eyebrow || "";
    const activeLabel = activeWorkspace.label;
    const activeInitials = activeWorkspace.initials;

    return `
      <details class="shell-item workspace-switcher-menu">
        <summary>
          <span class="workspace-avatar">${escapeHtml(activeInitials)}</span>
          <span class="workspace-summary-text">
            ${eyebrow ? `<small>${escapeHtml(eyebrow)}</small>` : ""}
            <strong>${escapeHtml(activeLabel)}</strong>
          </span>
          <i aria-hidden="true"></i>
        </summary>
        <div class="workspace-menu-panel">
          <label class="workspace-search">
            ${svgIcon("search")}
            <input type="search" placeholder="Ara" aria-label="Sayfa ara" data-workspace-search>
          </label>
          <div class="workspace-option-list">
            ${workspaces.map((workspace) => renderWorkspaceOption(instanceId, workspace, activeWorkspace.id)).join("")}
            <span class="workspace-empty" hidden>Eşleşen sayfa yok</span>
          </div>
        </div>
      </details>
    `;
  }

  function renderWorkspaceOption(instanceId, workspace, activeWorkspaceId) {
    const isActive = workspace.id === activeWorkspaceId;

    return `
      <button class="workspace-option ${isActive ? "is-active" : ""}" type="button" data-action="select-workspace" data-id="${instanceId}" data-workspace-id="${escapeHtml(workspace.id)}" data-search-key="${escapeHtml(`${workspace.initials} ${workspace.label}`.toLowerCase())}">
        <span class="workspace-avatar">${escapeHtml(workspace.initials)}</span>
        <strong>${escapeHtml(workspace.label)}</strong>
        ${isActive ? `<span class="workspace-check" aria-label="Seçili">✓</span>` : ""}
      </button>
    `;
  }

  function renderPageTabs(settings, route) {
    const tabs = parsePageTabs(settings.tabsText);
    const activeTab = tabs.find((tab) => isHrefActive(tab.href, route)) || tabs[0];
    const variant = settings.variant === "contained" ? "contained" : "underline";

    return `
      <nav class="shell-item page-tabs page-tabs-${variant}" aria-label="Sekmeli sayfa seçici">
        ${tabs.map((tab) => `
          <a class="page-tab ${tab === activeTab ? "is-active" : ""}" href="${escapeHtml(tab.href)}">
            ${renderPageTabIcon(tab.icon, tab.label)}
            <span>${escapeHtml(tab.label)}</span>
            ${tab.badge ? `<small>${escapeHtml(tab.badge)}</small>` : ""}
          </a>
        `).join("")}
      </nav>
    `;
  }

  function renderPageTabIcon(iconText, label) {
    const value = String(iconText || "").trim();
    const knownIcons = ["table", "file-text", "activity", "chart", "settings", "user", "search", "bell", "star", "filter", "columns", "info"];

    if (knownIcons.includes(value)) {
      return svgIcon(value);
    }

    return icon((value || label.slice(0, 2)).slice(0, 3).toUpperCase());
  }

  function parseWorkspaces(value) {
    const workspaces = parseLines(value).map((line, index) => {
      const [id, initials, label] = line.split("|");
      const safeLabel = (label || initials || id || `Sayfa ${index + 1}`).trim();

      return {
        id: (id || `workspace-${index + 1}`).trim(),
        initials: (initials || safeLabel.slice(0, 2)).trim().slice(0, 3).toUpperCase(),
        label: safeLabel
      };
    }).filter((workspace) => workspace.label);

    return workspaces.length ? workspaces : [
      { id: "benim-sayfam", initials: "BS", label: "Benim Sayfam" },
      { id: "arge", initials: "AR", label: "AR-GE" },
      { id: "danismanlik", initials: "DN", label: "Danışmanlık" },
      { id: "pentest", initials: "PT", label: "Pentest" },
      { id: "egitimler", initials: "EG", label: "Eğitimler" }
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
        href: safeHref(href, "#")
      };
    }).filter((link) => link.label);

    return links.length ? links : [
      { label: "Müşteri panosu", href: "#" },
      { label: "Onay hattı", href: "#" }
    ];
  }

  function parsePageTabs(value) {
    const tabs = parseLines(value).map((line, index) => {
      const [label, href, iconText, badge] = line.split("|");
      const safeLabel = (label || `Tab ${index + 1}`).trim();

      return {
        label: safeLabel,
        href: safeHref(href, "#"),
        icon: (iconText || safeLabel.slice(0, 2)).trim(),
        badge: (badge || "").trim()
      };
    }).filter((tab) => tab.label);

    return tabs.length ? tabs : [
      { label: "Pano", href: "#/app/dashboard", icon: "table", badge: "42" },
      { label: "Kayıtlar", href: "#/app/records", icon: "file-text", badge: "8" },
      { label: "İş akışları", href: "#/app/workflows", icon: "activity", badge: "16" }
    ];
  }

  function getFirstPageTabHref(value, fallback) {
    const firstTab = parsePageTabs(value)[0];
    return firstTab ? firstTab.href : fallback;
  }

  function parseTreeItems(value) {
    const entries = parseLines(value).map((line, index) => {
      const [levelText, label, href, iconText] = line.split("|");
      const parsedLevel = Number.parseInt(levelText, 10);
      const safeLabel = (label || `Öğe ${index + 1}`).trim();

      return {
        level: Number.isFinite(parsedLevel) && parsedLevel > 0 ? Math.min(parsedLevel, 4) : 0,
        label: safeLabel,
        href: safeHref(href, "#"),
        icon: (iconText || safeLabel.slice(0, 2)).trim().slice(0, 3).toUpperCase()
      };
    }).filter((entry) => entry.label);

    return entries.length ? entries : [
      { level: 0, label: "Yönetim", href: "#/app/dashboard", icon: "YN" },
      { level: 1, label: "Kullanıcılar", href: "#/app/records", icon: "KU" },
      { level: 1, label: "Roller", href: "#/app/workflows", icon: "RO" }
    ];
  }

  function isHrefActive(href, route) {
    const value = safeHref(href, "#");

    if (value === "#/config") {
      return route.name === "config";
    }

    if (value.startsWith("#/app/")) {
      return route.name === "app" && route.page === value.replace("#/app/", "");
    }

    return false;
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
    renderChromeModePicker,
    isToolbarOpen: () => toolbarOpen,
    setToolbarOpen: (isOpen) => {
      toolbarOpen = Boolean(isOpen);
    }
  };
})();
