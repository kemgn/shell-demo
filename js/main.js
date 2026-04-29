(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});

  document.addEventListener("DOMContentLoaded", () => {
    ns.State.load();
    ns.State.subscribe(() => ns.Router.render());
    bindInteractions();
    ns.Router.init();
  });

  function bindInteractions() {
    document.body.addEventListener("click", (event) => {
      const control = event.target.closest("[data-action]");

      if (!control) {
        return;
      }

      const action = control.dataset.action;

      if (action === "toggle-area") {
        ns.State.toggleArea(control.dataset.area);
        return;
      }

      if (action === "set-side-mode") {
        ns.State.setSideMode(control.dataset.area, control.dataset.mode);
        return;
      }

      if (action === "set-chrome-mode") {
        ns.State.setChromeMode(control.dataset.area, control.dataset.mode);
        return;
      }

      if (action === "set-frame-layout") {
        ns.State.setFrameLayout(control.dataset.layout);
        return;
      }

      if (action === "set-config-tab") {
        ns.Config.setActiveArea(control.dataset.area);
        ns.Router.render();
        return;
      }

      if (action === "edit-item") {
        ns.Config.setSelectedItem(control.dataset.id);
        ns.Router.render();
        return;
      }

      if (action === "clear-item-edit") {
        ns.Config.clearSelectedItem();
        ns.Router.render();
        return;
      }

      if (action === "save-item-settings") {
        const editor = control.closest("[data-item-editor]");
        const fields = editor ? editor.querySelectorAll("[data-setting-key]") : [];
        const settings = {};

        fields.forEach((field) => {
          settings[field.dataset.settingKey] = field.value;
        });

        ns.State.updateItemSettings(control.dataset.id, settings);
        return;
      }

      if (action === "set-item-setting") {
        ns.State.updateItemSettings(control.dataset.id, {
          [control.dataset.key]: control.dataset.value
        });
        return;
      }

      if (action === "select-workspace") {
        ns.State.updateItemSettings(control.dataset.id, {
          activeWorkspaceId: control.dataset.workspaceId,
          label: control.dataset.label,
          initials: control.dataset.initials
        });
        return;
      }

      if (action === "reset-config") {
        ns.Config.clearSelectedItem();
        ns.State.reset();
        return;
      }

      if (action === "add-item") {
        const slotEditor = control.closest(".slot-editor");
        const select = slotEditor ? slotEditor.querySelector("[data-add-select]") : null;

        if (select && select.value) {
          ns.State.addItem(control.dataset.area, control.dataset.slot, select.value);
        }

        return;
      }

      if (action === "remove-item") {
        ns.Config.clearSelectedItem();
        ns.State.removeItem(control.dataset.area, control.dataset.slot, control.dataset.id);
        return;
      }

      if (action === "move-item") {
        ns.State.moveItem(control.dataset.area, control.dataset.slot, control.dataset.id, control.dataset.direction);
      }
    });

    document.body.addEventListener("input", (event) => {
      const search = event.target.closest("[data-workspace-search]");

      if (!search) {
        return;
      }

      filterWorkspaceOptions(search);
    });
  }

  function filterWorkspaceOptions(search) {
    const panel = search.closest(".workspace-menu-panel");
    const query = search.value.trim().toLowerCase();
    const options = panel ? Array.from(panel.querySelectorAll(".workspace-option")) : [];
    let visibleCount = 0;

    options.forEach((option) => {
      const isVisible = !query || option.dataset.searchKey.includes(query);
      option.hidden = !isVisible;
      visibleCount += isVisible ? 1 : 0;
    });

    const empty = panel ? panel.querySelector(".workspace-empty") : null;

    if (empty) {
      empty.hidden = visibleCount > 0;
    }
  }
})();
