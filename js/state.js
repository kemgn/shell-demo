(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});

  const STORAGE_KEY = "shell-demo:v4";

  const areas = [
    { id: "header", label: "Üst bar", axis: "horizontal" },
    { id: "leftBar", label: "Sol bar", axis: "vertical" },
    { id: "rightBar", label: "Sağ bar", axis: "vertical" },
    { id: "footer", label: "Alt bar", axis: "horizontal" }
  ];

  const sideModes = [
    { id: "visible", label: "Görünür" },
    { id: "icon", label: "İkon" },
    { id: "hover", label: "Üzerine gelince" },
    { id: "hidden", label: "Gizli" }
  ];

  const chromeModes = [
    { id: "visible", label: "Görünür" },
    { id: "compact", label: "Kompakt" },
    { id: "hidden", label: "Gizli" }
  ];

  const headerChromeModes = [
    { id: "visible", label: "Görünür" },
    { id: "compact", label: "Kompakt" },
    { id: "left-rail", label: "Sol kompakt" },
    { id: "hidden", label: "Gizli" }
  ];

  const frameLayouts = [
    {
      id: "classic",
      label: "Klasik",
      description: "Üst ve alt bar tam genişlikte, yan barlar içerik satırında."
    },
    {
      id: "center",
      label: "Merkez kolon",
      description: "Yan barlar tam yükseklikte, üst ve alt bar sadece içerik kolonunda."
    }
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
    left: "Sol",
    center: "Orta",
    right: "Sağ",
    top: "Üst",
    middle: "Orta",
    bottom: "Alt"
  };

  const defaultState = {
    version: 4,
    frameLayout: "classic",
    areas: {
      header: {
        isOpen: true,
        mode: "visible",
        slots: {
          left: [
            { id: "default-brand", itemId: "brand" }
          ],
          center: [
            { id: "default-workspace-switcher", itemId: "workspace-switcher" }
          ],
          right: [
            { id: "default-header-action", itemId: "button" },
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
          middle: [],
          bottom: []
        }
      },
      rightBar: {
        isOpen: false,
        mode: "hidden",
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
        isOpen: false,
        mode: "hidden",
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
    return {
      id: `${itemId}-${stamp}-${random}`,
      itemId,
      settings: ns.Catalog.getDefaultSettings(itemId)
    };
  }

  function getChromeModes(areaId) {
    return areaId === "header" ? headerChromeModes : chromeModes;
  }

  function normalizeItemSettings(itemId, settings) {
    const merged = ns.Catalog.mergeSettings(itemId, settings);

    if (itemId !== "workspace-switcher") {
      return merged;
    }

    const legacyText = [
      merged.activeWorkspaceId,
      merged.eyebrow,
      merged.label,
      merged.workspacesText
    ].join(" ").toLocaleLowerCase("tr-TR");

    if (legacyText.includes("pipipipipi") || legacyText.includes("çalışma alanı")) {
      return ns.Catalog.getDefaultSettings(itemId);
    }

    return merged;
  }

  function normalize(candidate) {
    const next = clone(defaultState);
    const source = candidate && candidate.areas ? candidate : {};
    const sourceFrameLayout = frameLayouts.some((layout) => layout.id === source.frameLayout)
      ? source.frameLayout
      : defaultState.frameLayout;

    next.frameLayout = sourceFrameLayout;

    areas.forEach((area) => {
      const sourceArea = source.areas && source.areas[area.id] ? source.areas[area.id] : {};
      const sourceMode = sideModes.some((mode) => mode.id === sourceArea.mode)
        ? sourceArea.mode
        : sourceArea.isOpen === false
          ? "hidden"
          : "visible";
      const sourceChromeMode = getChromeModes(area.id).some((mode) => mode.id === sourceArea.mode)
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
            itemId: item.itemId,
            settings: normalizeItemSettings(item.itemId, item.settings)
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
      // Tarayıcı localStorage'ı engellerse demo bellekte çalışmaya devam eder.
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
    if (!chromeAreaIds.has(areaId) || !getChromeModes(areaId).some((chromeMode) => chromeMode.id === mode)) {
      return;
    }

    commit((draft) => {
      draft.areas[areaId].mode = mode;
      draft.areas[areaId].isOpen = mode !== "hidden";
    });
  }

  function setFrameLayout(layoutId) {
    if (!frameLayouts.some((layout) => layout.id === layoutId)) {
      return;
    }

    commit((draft) => {
      draft.frameLayout = layoutId;
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

  function findItem(instanceId) {
    for (const area of areas) {
      for (const slot of slotsByArea[area.id]) {
        const instance = state.areas[area.id].slots[slot]
          .find((item) => item.id === instanceId);

        if (instance) {
          return { area, slot, instance };
        }
      }
    }

    return null;
  }

  function updateItemSettings(instanceId, settings) {
    const target = findItem(instanceId);

    if (!target) {
      return;
    }

    commit((draft) => {
      const instance = draft.areas[target.area.id].slots[target.slot]
        .find((item) => item.id === instanceId);

      if (!instance) {
        return;
      }

      instance.settings = ns.Catalog.mergeSettings(instance.itemId, {
        ...instance.settings,
        ...settings
      });
    });
  }

  ns.State = {
    areas,
    sideModes,
    chromeModes,
    headerChromeModes,
    frameLayouts,
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
    getChromeModes,
    setFrameLayout,
    addItem,
    removeItem,
    moveItem,
    findItem,
    updateItemSettings
  };
})();
