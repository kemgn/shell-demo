(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});
  const { escapeHtml } = ns.Utils;
  let activeAreaId = "header";
  let selectedInstanceId = "";

  function render() {
    const state = ns.State.get();
    const activeArea = getActiveArea();

    return `
      <div class="config-page page-enter">
        <section class="config-layout">
          <div class="config-editor-panel">
            <nav class="config-tabs" aria-label="Shell regions">
              ${ns.State.areas.map((area) => renderAreaTab(area, state)).join("")}
            </nav>
            <div class="config-tab-body">
              ${renderAreaEditor(activeArea, state)}
            </div>
          </div>
          ${renderSidePanel(state)}
        </section>
      </div>
    `;
  }

  function getActiveArea() {
    return ns.State.areas.find((area) => area.id === activeAreaId) || ns.State.areas[0];
  }

  function setActiveArea(areaId) {
    if (!ns.State.areas.some((area) => area.id === areaId)) {
      return;
    }

    activeAreaId = areaId;
    selectedInstanceId = "";
  }

  function renderAreaTab(area, state) {
    const areaState = state.areas[area.id];
    const itemCount = ns.State.slotsByArea[area.id]
      .reduce((total, slot) => total + areaState.slots[slot].length, 0);
    const isActive = area.id === getActiveArea().id;

    return `
      <button class="config-tab ${isActive ? "is-active" : ""}" type="button" data-action="set-config-tab" data-area="${area.id}">
        <span>${escapeHtml(area.label)}</span>
        <small>${itemCount}</small>
      </button>
    `;
  }

  function renderAreaEditor(area, state) {
    const areaState = state.areas[area.id];
    const slots = ns.State.slotsByArea[area.id];

    return `
      <article class="region-editor">
        <header class="region-editor-head">
          <div>
            <span class="region-axis">${area.axis}</span>
            <h2>${escapeHtml(area.label)}</h2>
          </div>
          ${ns.State.sideAreaIds.has(area.id)
            ? ns.Shell.renderSideModePicker(area, areaState.mode || "visible", "config")
            : ns.State.chromeAreaIds.has(area.id)
              ? ns.Shell.renderChromeModePicker(area, areaState.mode || "visible", "config")
            : `<button class="ghost-button" type="button" data-action="toggle-area" data-area="${area.id}">
                ${areaState.isOpen ? "Collapse" : "Expand"}
              </button>`}
        </header>
        <div class="slot-editor-grid slot-editor-grid-${area.axis}">
          ${slots.map((slot) => renderSlotEditor(area, slot, areaState.slots[slot])).join("")}
        </div>
      </article>
    `;
  }

  function renderSlotEditor(area, slot, items) {
    return `
      <section class="slot-editor">
        <div class="slot-editor-title">
          <span>${escapeHtml(ns.State.slotLabels[slot])}</span>
          <small>${items.length} item</small>
        </div>
        <div class="config-item-list">
          ${items.length ? items.map((instance, index) => renderConfigItem(area.id, slot, instance, index, items.length)).join("") : `
            <div class="empty-config-slot">Bu slot boş. Catalog'dan bir item ekle.</div>
          `}
        </div>
        <div class="add-row">
          <select data-add-select aria-label="${escapeHtml(area.label)} ${escapeHtml(slot)} item seçimi">
            ${renderCatalogOptions()}
          </select>
          <button class="add-button" type="button" data-action="add-item" data-area="${area.id}" data-slot="${slot}">Add</button>
        </div>
      </section>
    `;
  }

  function renderConfigItem(areaId, slot, instance, index, count) {
    const item = ns.Catalog.getItem(instance.itemId);
    const settings = ns.Catalog.mergeSettings(instance.itemId, instance.settings);
    const isSelected = selectedInstanceId === instance.id;

    return `
      <div class="config-item-row ${isSelected ? "is-selected" : ""}">
        <div>
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.category)}${settings.variant ? ` / ${escapeHtml(settings.variant)}` : ""}</small>
        </div>
        <div class="item-row-actions">
          <button class="customize-button" type="button" data-action="edit-item" data-id="${instance.id}">Customize</button>
          <button type="button" data-action="move-item" data-area="${areaId}" data-slot="${slot}" data-id="${instance.id}" data-direction="up" ${index === 0 ? "disabled" : ""}>Up</button>
          <button type="button" data-action="move-item" data-area="${areaId}" data-slot="${slot}" data-id="${instance.id}" data-direction="down" ${index === count - 1 ? "disabled" : ""}>Down</button>
          <button type="button" data-action="remove-item" data-area="${areaId}" data-slot="${slot}" data-id="${instance.id}">Remove</button>
        </div>
      </div>
    `;
  }

  function renderCatalogOptions() {
    return ns.Catalog.categories.map((category) => {
      const items = ns.Catalog.getItemsByCategory(category.id);

      return `
        <optgroup label="${escapeHtml(category.label)}">
          ${items.map((item) => `<option value="${item.id}">${escapeHtml(item.label)}</option>`).join("")}
        </optgroup>
      `;
    }).join("");
  }

  function setSelectedItem(instanceId) {
    selectedInstanceId = ns.State.findItem(instanceId) ? instanceId : "";
  }

  function clearSelectedItem() {
    selectedInstanceId = "";
  }

  function renderSidePanel(state) {
    const selected = selectedInstanceId ? ns.State.findItem(selectedInstanceId) : null;

    if (selected) {
      return renderElementEditor(selected);
    }

    return `
      <aside class="catalog-panel">
        <div class="catalog-panel-head">
          <div>
            <span>Available items</span>
            <strong>${ns.Catalog.items.length} blocks</strong>
          </div>
          <button class="mini-danger-button" type="button" data-action="reset-config">Reset</button>
        </div>
        ${ns.Catalog.categories.map(renderCatalogCategory).join("")}
      </aside>
    `;
  }

  function renderElementEditor(selected) {
    const item = ns.Catalog.getItem(selected.instance.itemId);
    const settings = ns.Catalog.mergeSettings(selected.instance.itemId, selected.instance.settings);
    const schema = ns.Catalog.getSettingSchema(selected.instance.itemId);

    if (item.id === "favorites") {
      return renderFavoritesEditor(selected, item, settings);
    }

    return `
      <aside class="element-editor-panel">
        <div class="element-editor-head">
          <div>
            <span>Element settings</span>
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(selected.area.label)} / ${escapeHtml(ns.State.slotLabels[selected.slot])}</small>
          </div>
          <button class="ghost-button" type="button" data-action="clear-item-edit">Catalog</button>
        </div>
        <div class="element-editor-body" data-item-editor data-id="${selected.instance.id}">
          ${schema.map((field) => renderSettingField(field, settings[field.key] || "")).join("")}
          <button class="save-settings-button" type="button" data-action="save-item-settings" data-id="${selected.instance.id}">Apply settings</button>
        </div>
      </aside>
    `;
  }

  function renderFavoritesEditor(selected, item, settings) {
    return `
      <aside class="element-editor-panel favorites-editor-panel">
        <div class="element-editor-head">
          <div>
            <span>Favorites appearance</span>
            <strong>Favorites boyle gozuksun</strong>
            <small>${escapeHtml(selected.area.label)} / ${escapeHtml(ns.State.slotLabels[selected.slot])}</small>
          </div>
          <button class="ghost-button" type="button" data-action="clear-item-edit">Catalog</button>
        </div>

        <section class="appearance-section">
          <span class="setting-section-title">Gorunum tipi</span>
          <div class="appearance-card-grid">
            ${renderAppearanceCard(selected.instance.id, settings.variant, "collapse", "Collapse", "Baslik acilir/kapanir, linkler altinda siralanir.")}
            ${renderAppearanceCard(selected.instance.id, settings.variant, "dropdown", "Dropdown", "Baslik menudur; linkler dropdown davranisi gibi acilir.")}
            ${renderAppearanceCard(selected.instance.id, settings.variant, "list", "List", "Baslik ve linkler her zaman acik sade liste olur.")}
          </div>
        </section>

        <div class="element-editor-body" data-item-editor data-id="${selected.instance.id}">
          ${renderSettingField({ key: "title", label: "Title", type: "text" }, settings.title || "")}
          ${renderSettingField({ key: "linksText", label: "Links", type: "textarea", hint: "One per line: Label|#/app/records" }, settings.linksText || "")}
          <button class="save-settings-button" type="button" data-action="save-item-settings" data-id="${selected.instance.id}">Apply text and links</button>
        </div>

        <section class="favorites-preview">
          <span class="setting-section-title">Preview</span>
          ${renderFavoritesPreview(settings)}
        </section>
      </aside>
    `;
  }

  function renderAppearanceCard(instanceId, currentVariant, variant, title, description) {
    return `
      <button class="appearance-card ${currentVariant === variant ? "is-active" : ""}" type="button" data-action="set-item-setting" data-id="${instanceId}" data-key="variant" data-value="${variant}">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(description)}</span>
      </button>
    `;
  }

  function renderFavoritesPreview(settings) {
    const links = parseLinks(settings.linksText);
    const title = settings.title || "Favorites";

    if (settings.variant === "list") {
      return `
        <div class="favorites-preview-card">
          <span>${escapeHtml(title)}</span>
          ${links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
        </div>
      `;
    }

    return `
      <details class="favorites-preview-card" ${settings.variant === "collapse" ? "open" : ""}>
        <summary>${escapeHtml(title)}</summary>
        ${links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
      </details>
    `;
  }

  function renderSettingField(field, value) {
    const hint = field.hint ? `<small>${escapeHtml(field.hint)}</small>` : "";

    if (field.type === "select") {
      return `
        <label class="setting-field">
          <span>${escapeHtml(field.label)}</span>
          <select data-setting-key="${escapeHtml(field.key)}">
            ${(field.options || []).map((option) => `
              <option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>
            `).join("")}
          </select>
          ${hint}
        </label>
      `;
    }

    if (field.type === "textarea") {
      return `
        <label class="setting-field">
          <span>${escapeHtml(field.label)}</span>
          <textarea rows="5" data-setting-key="${escapeHtml(field.key)}">${escapeHtml(value)}</textarea>
          ${hint}
        </label>
      `;
    }

    return `
      <label class="setting-field">
        <span>${escapeHtml(field.label)}</span>
        <input type="text" value="${escapeHtml(value)}" data-setting-key="${escapeHtml(field.key)}">
        ${hint}
      </label>
    `;
  }

  function renderCatalogCategory(category) {
    const items = ns.Catalog.getItemsByCategory(category.id);

    return `
      <section class="catalog-group">
        <h3>${escapeHtml(category.label)}</h3>
        <p>${escapeHtml(category.note)}</p>
        ${items.map((item) => `
          <article class="catalog-card">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.description)}</span>
          </article>
        `).join("")}
      </section>
    `;
  }

  function parseLinks(value) {
    const links = String(value || "")
      .split(/\r?\n/)
      .map((line) => {
        const [label, href] = line.split("|");
        return {
          label: (label || "").trim(),
          href: (href || "#").trim()
        };
      })
      .filter((link) => link.label);

    return links.length ? links : [
      { label: "Customer board", href: "#/app/records" },
      { label: "Approval lane", href: "#/app/workflows" }
    ];
  }

  ns.Config = {
    render,
    setActiveArea,
    setSelectedItem,
    clearSelectedItem
  };
})();
