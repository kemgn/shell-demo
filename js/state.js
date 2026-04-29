(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});

  const STORAGE_KEY = "shell-demo:v1";

  const areas = [
    { id: "header", label: "Header", axis: "horizontal" },
    { id: "leftBar", label: "Left bar", axis: "vertical" },
    { id: "rightBar", label: "Right bar", axis: "vertical" },
    { id: "footer", label: "Footer", axis: "horizontal" }
  ];

  const sideModes = [
    { id: "visible", label: "Visible" },
    { id: "icon", label: "Icon" },
    { id: "hover", label: "Hover" },
    { id: "hidden", label: "Hidden" }
  ];

  const chromeModes = [
    { id: "visible", label: "Visible" },
    { id: "compact", label: "Compact" },
    { id: "hidden", label: "Hidden" }
  ];

  const sideAreaIds = new Set(["leftBar", "rightBar"]);
  const chromeAreaIds = new Set(["header", "footer"]);

  const slotsByArea = {
    header: ["left", "center", "right"],
    leftBar: ["top", "middle", "bottom"],
    rightBar: ["top", "middle", "bottom"],
    footer: ["left", "center", "right"]
  };

  const slotLabels = {
    left: "Left",
    center: "Center",
    right: "Right",
    top: "Top",
    middle: "Middle",
    bottom: "Bottom"
  };

  const defaultState = {
    version: 1,
    areas: {
      header: {
        isOpen: true,
        mode: "visible",
        slots: {
          left: [
            { id: "default-brand", itemId: "brand" },
            { id: "default-workspace-switcher", itemId: "workspace-switcher" }
          ],
          center: [
            { id: "default-breadcrumbs", itemId: "breadcrumbs" }
          ],
          right: [
            { id: "default-global-search", itemId: "global-search" },
            { id: "default-notifications", itemId: "notifications" },
            { id: "default-user-menu", itemId: "user-menu" }
          ]
        }
      },
      leftBar: {
        isOpen: true,
        mode: "visible",
        slots: {
          top: [
            { id: "default-primary-nav", itemId: "primary-nav" }
          ],
          middle: [
            { id: "default-workspace-status", itemId: "workspace-status" },
            { id: "default-favorites", itemId: "favorites" }
          ],
          bottom: [
            { id: "default-ai-assistant", itemId: "ai-assistant" }
          ]
        }
      },
      rightBar: {
        isOpen: true,
        mode: "visible",
        slots: {
          top: [
            { id: "default-inspector-summary", itemId: "inspector-summary" }
          ],
          middle: [
            { id: "default-quick-actions", itemId: "quick-actions" },
            { id: "default-record-counter", itemId: "record-counter" }
          ],
          bottom: [
            { id: "default-activity-feed", itemId: "activity-feed" }
          ]
        }
      },
      footer: {
        isOpen: true,
        mode: "visible",
        slots: {
          left: [
            { id: "default-environment-chip", itemId: "environment-chip" }
          ],
          center: [
            { id: "default-sync-status", itemId: "sync-status" }
          ],
          right: [
            { id: "default-version", itemId: "version" }
          ]
        }
      }
    }
  };

  let state = clone(defaultState);
  const listeners = new Set();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createInstance(itemId) {
    const stamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    return { id: `${itemId}-${stamp}-${random}`, itemId };
  }

  function normalize(candidate) {
    const next = clone(defaultState);
    const source = candidate && candidate.areas ? candidate : {};

    areas.forEach((area) => {
      const sourceArea = source.areas && source.areas[area.id] ? source.areas[area.id] : {};
      const sourceMode = sideModes.some((mode) => mode.id === sourceArea.mode)
        ? sourceArea.mode
        : sourceArea.isOpen === false
          ? "hidden"
          : "visible";
      const sourceChromeMode = chromeModes.some((mode) => mode.id === sourceArea.mode)
        ? sourceArea.mode
        : sourceArea.isOpen === false
          ? "hidden"
          : "visible";

      if (sideAreaIds.has(area.id)) {
        next.areas[area.id].mode = sourceMode;
        next.areas[area.id].isOpen = sourceMode !== "hidden";
      } else if (chromeAreaIds.has(area.id)) {
        next.areas[area.id].mode = sourceChromeMode;
        next.areas[area.id].isOpen = sourceChromeMode !== "hidden";
      } else {
        next.areas[area.id].isOpen = sourceArea.isOpen !== false;
      }

      slotsByArea[area.id].forEach((slot) => {
        const sourceItems = sourceArea.slots && Array.isArray(sourceArea.slots[slot])
          ? sourceArea.slots[slot]
          : next.areas[area.id].slots[slot];

        next.areas[area.id].slots[slot] = sourceItems
          .filter((item) => item && item.itemId)
          .map((item) => ({
            id: item.id || createInstance(item.itemId).id,
            itemId: item.itemId
          }));
      });
    });

    return next;
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      state = raw ? normalize(JSON.parse(raw)) : clone(defaultState);
    } catch (error) {
      state = clone(defaultState);
    }

    save();
    return state;
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // The demo still works in-memory if a browser blocks localStorage.
    }
  }

  function emit() {
    listeners.forEach((listener) => listener(state));
  }

  function commit(mutator) {
    mutator(state);
    save();
    emit();
  }

  function get() {
    return state;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function reset() {
    state = clone(defaultState);
    save();
    emit();
  }

  function toggleArea(areaId) {
    if (!state.areas[areaId]) {
      return;
    }

    commit((draft) => {
      if (sideAreaIds.has(areaId)) {
        const nextMode = draft.areas[areaId].mode === "hidden" ? "visible" : "hidden";
        draft.areas[areaId].mode = nextMode;
        draft.areas[areaId].isOpen = nextMode !== "hidden";
        return;
      }

      if (chromeAreaIds.has(areaId)) {
        const nextMode = draft.areas[areaId].mode === "hidden" ? "visible" : "hidden";
        draft.areas[areaId].mode = nextMode;
        draft.areas[areaId].isOpen = nextMode !== "hidden";
        return;
      }

      draft.areas[areaId].isOpen = !draft.areas[areaId].isOpen;
    });
  }

  function setSideMode(areaId, mode) {
    if (!sideAreaIds.has(areaId) || !sideModes.some((sideMode) => sideMode.id === mode)) {
      return;
    }

    commit((draft) => {
      draft.areas[areaId].mode = mode;
      draft.areas[areaId].isOpen = mode !== "hidden";
    });
  }

  function setChromeMode(areaId, mode) {
    if (!chromeAreaIds.has(areaId) || !chromeModes.some((chromeMode) => chromeMode.id === mode)) {
      return;
    }

    commit((draft) => {
      draft.areas[areaId].mode = mode;
      draft.areas[areaId].isOpen = mode !== "hidden";
    });
  }

  function addItem(areaId, slot, itemId) {
    if (!state.areas[areaId] || !state.areas[areaId].slots[slot] || !ns.Catalog.getItem(itemId)) {
      return;
    }

    commit((draft) => {
      draft.areas[areaId].slots[slot].push(createInstance(itemId));
    });
  }

  function removeItem(areaId, slot, instanceId) {
    if (!state.areas[areaId] || !state.areas[areaId].slots[slot]) {
      return;
    }

    commit((draft) => {
      draft.areas[areaId].slots[slot] = draft.areas[areaId].slots[slot]
        .filter((item) => item.id !== instanceId);
    });
  }

  function moveItem(areaId, slot, instanceId, direction) {
    if (!state.areas[areaId] || !state.areas[areaId].slots[slot]) {
      return;
    }

    commit((draft) => {
      const list = draft.areas[areaId].slots[slot];
      const currentIndex = list.findIndex((item) => item.id === instanceId);
      const offset = direction === "up" ? -1 : 1;
      const targetIndex = currentIndex + offset;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= list.length) {
        return;
      }

      const [item] = list.splice(currentIndex, 1);
      list.splice(targetIndex, 0, item);
    });
  }

  ns.State = {
    areas,
    sideModes,
    chromeModes,
    sideAreaIds,
    chromeAreaIds,
    slotsByArea,
    slotLabels,
    defaultState,
    load,
    get,
    subscribe,
    reset,
    toggleArea,
    setSideMode,
    setChromeMode,
    addItem,
    removeItem,
    moveItem
  };
})();
