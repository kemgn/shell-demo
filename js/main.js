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

      if (action === "reset-config") {
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
        ns.State.removeItem(control.dataset.area, control.dataset.slot, control.dataset.id);
        return;
      }

      if (action === "move-item") {
        ns.State.moveItem(control.dataset.area, control.dataset.slot, control.dataset.id, control.dataset.direction);
      }
    });
  }
})();
