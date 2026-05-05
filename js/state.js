(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});

  const STORAGE_KEY = "shell-demo:v5";
  const CUSTOM_LAYOUTS_KEY = "shell-demo:custom-layouts:v1";

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
  const removedItemIds = new Set([
    "workspace-status",
    "environment-chip",
    "sync-status",
    "version",
    "record-counter",
    "mini-metric",
    "inspector-summary",
    "activity-feed",
    "ai-assistant",
    "quick-actions"
  ]);

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
    version: 5,
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
            {
              id: "default-header-action",
              itemId: "button",
              settings: { label: "Ayarlar", icon: "settings", href: "#/config", variant: "icon", appearance: "ghost" }
            },
            { id: "default-user-menu", itemId: "user-menu" }
          ]
        }
      },
      leftBar: {
        isOpen: true,
        mode: "visible",
          slots: {
            top: [
              { id: "default-left-search", itemId: "global-search" },
              { id: "default-primary-nav", itemId: "primary-nav" }
            ],
          middle: [
            { id: "default-tree-menu", itemId: "tree-menu" }
          ],
          bottom: []
        }
      },
      rightBar: {
        isOpen: false,
        mode: "hidden",
        slots: {
          top: [],
          middle: [],
          bottom: []
        }
      },
      footer: {
        isOpen: false,
        mode: "hidden",
        slots: {
          left: [],
          center: [],
          right: []
        }
      }
    }
  };

  const savedLayoutPresets = [];

  let state = clone(defaultState);
  let customSavedLayoutPresets = [];
  let activeSavedLayoutId = "default-layout";
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

  function createSavedLayoutId() {
    const stamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 7);
    return `custom-layout-${stamp}-${random}`;
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

  function isItemAllowedInArea(areaId, itemId) {
    if (removedItemIds.has(itemId)) {
      return false;
    }

    if (itemId === "tenant-chip" || itemId === "tab-menu") {
      return false;
    }

    if (itemId === "tree-menu") {
      return sideAreaIds.has(areaId);
    }

    if (itemId === "breadcrumbs") {
      return !sideAreaIds.has(areaId);
    }

    return true;
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
          .filter((item) => item && item.itemId && isItemAllowedInArea(area.id, item.itemId))
          .map((item) => ({
            id: item.id || createInstance(item.itemId).id,
            itemId: item.itemId,
            settings: normalizeItemSettings(item.itemId, item.settings)
          }));
      });
    });

    placeLeftSearchAfterWorkspace(next);
    updateDefaultHeaderAction(next);

    return next;
  }

  function updateDefaultHeaderAction(next) {
    const action = next.areas.header.slots.right.find((item) => item.id === "default-header-action" && item.itemId === "button");

    if (!action) {
      return;
    }

    const settings = action.settings || {};
    const isLegacyDefault = settings.label === "Yeni kayıt"
      && settings.icon === "+"
      && settings.variant === "text"
      && settings.href === "#/config";

    if (!isLegacyDefault) {
      return;
    }

    action.settings = { label: "Ayarlar", icon: "settings", href: "#/config", variant: "icon", appearance: "ghost" };
  }

  function placeLeftSearchAfterWorkspace(next) {
    const topItems = next.areas.leftBar.slots.top;
    const workspaceIndex = topItems.findIndex((item) => item.itemId === "workspace-switcher");

    if (workspaceIndex < 0) {
      return;
    }

    const existingSearch = topItems.find((item) => item.itemId === "global-search") || {
      id: "auto-left-workspace-search",
      itemId: "global-search",
      settings: ns.Catalog.getDefaultSettings("global-search")
    };
    const orderedItems = topItems.filter((item) => item.itemId !== "global-search");
    const nextWorkspaceIndex = orderedItems.findIndex((item) => item.itemId === "workspace-switcher");

    orderedItems.splice(nextWorkspaceIndex + 1, 0, existingSearch);
    next.areas.leftBar.slots.top = orderedItems;
  }

  function normalizeSavedLayout(layout, index) {
    if (!layout || !layout.state) {
      return null;
    }

    const id = String(layout.id || createSavedLayoutId()).trim();
    const label = String(layout.label || `Kaydedilen layout ${index + 1}`).trim();

    if (!id || !label) {
      return null;
    }

    return {
      id,
      label,
      description: String(layout.description || "Kaydedilen özel layout."),
      state: normalize(layout.state)
    };
  }

  function loadCustomLayouts() {
    try {
      const raw = window.localStorage.getItem(CUSTOM_LAYOUTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];

      customSavedLayoutPresets = Array.isArray(parsed)
        ? parsed.map(normalizeSavedLayout).filter(Boolean)
        : [];
    } catch (error) {
      customSavedLayoutPresets = [];
    }
  }

  function saveCustomLayouts() {
    try {
      window.localStorage.setItem(CUSTOM_LAYOUTS_KEY, JSON.stringify(customSavedLayoutPresets));
    } catch (error) {
      // Tarayıcı localStorage'ı engellerse kayıtlı layout'lar sadece bellekte kalır.
    }
  }

  function load() {
    try {
      loadCustomLayouts();
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
    if (!isCustomSavedLayout(activeSavedLayoutId)) {
      activeSavedLayoutId = "default-layout";
    }
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

  function getActiveSavedLayoutId() {
    return activeSavedLayoutId;
  }

  function getSavedLayouts() {
    return [
      ...savedLayoutPresets,
      ...customSavedLayoutPresets
    ].sort((left, right) => left.label.localeCompare(right.label, "tr", { sensitivity: "base" }));
  }

  function isCustomSavedLayout(layoutId) {
    return customSavedLayoutPresets.some((layout) => layout.id === layoutId);
  }

  function reset() {
    state = clone(defaultState);
    activeSavedLayoutId = "default-layout";
    save();
    emit();
  }

  function applyPreset(presetState, layoutId = "default-layout") {
    state = normalize(presetState);
    activeSavedLayoutId = layoutId;
    save();
    emit();
  }

  function applySavedLayout(layoutId) {
    const preset = getSavedLayouts().find((layout) => layout.id === layoutId);

    if (!preset) {
      return;
    }

    applyPreset(preset.state, layoutId);
  }

  function saveCurrentLayout(label, layoutId = "") {
    const normalizedLabel = String(label || "").trim();
    const targetLayoutId = String(layoutId || "").trim()
      || (isCustomSavedLayout(activeSavedLayoutId) ? activeSavedLayoutId : "");
    const existingIndex = customSavedLayoutPresets.findIndex((layout) => layout.id === targetLayoutId);
    const nextLabel = normalizedLabel
      || (existingIndex >= 0 ? customSavedLayoutPresets[existingIndex].label : `Layout ${customSavedLayoutPresets.length + 1}`);
    const nextLayout = {
      id: existingIndex >= 0 ? customSavedLayoutPresets[existingIndex].id : createSavedLayoutId(),
      label: nextLabel,
      description: "Kullanıcı tarafından kaydedilen layout.",
      state: normalize(state)
    };

    if (existingIndex >= 0) {
      customSavedLayoutPresets[existingIndex] = nextLayout;
    } else {
      customSavedLayoutPresets.push(nextLayout);
    }

    activeSavedLayoutId = nextLayout.id;
    saveCustomLayouts();
    save();
    emit();
  }

  function deleteSavedLayout(layoutId) {
    const nextLayouts = customSavedLayoutPresets.filter((layout) => layout.id !== layoutId);

    if (nextLayouts.length === customSavedLayoutPresets.length) {
      return;
    }

    customSavedLayoutPresets = nextLayouts;

    if (activeSavedLayoutId === layoutId) {
      activeSavedLayoutId = "default-layout";
    }

    saveCustomLayouts();
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
    if (!state.areas[areaId] || !state.areas[areaId].slots[slot] || !ns.Catalog.getItem(itemId) || !isItemAllowedInArea(areaId, itemId)) {
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
    savedLayoutPresets,
    getSavedLayouts,
    load,
    get,
    getActiveSavedLayoutId,
    isCustomSavedLayout,
    subscribe,
    reset,
    applyPreset,
    applySavedLayout,
    saveCurrentLayout,
    deleteSavedLayout,
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
