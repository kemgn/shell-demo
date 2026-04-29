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
  }
})();
