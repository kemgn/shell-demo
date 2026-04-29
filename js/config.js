(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});
  const { escapeHtml } = ns.Utils;

  function render() {
    const state = ns.State.get();

    return `
      <div class="config-page page-enter">
        <section class="config-layout">
          <div class="region-editor-stack">
            ${ns.State.areas.map((area) => renderAreaEditor(area, state)).join("")}
          </div>
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
        </section>
      </div>
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

    return `
      <div class="config-item-row">
        <div>
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.category)}</small>
        </div>
        <div class="item-row-actions">
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

  ns.Config = {
    render
  };
})();
