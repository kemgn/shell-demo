(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});

  const categories = [
    { id: "identity", label: "Identity", note: "Marka, tenant ve workspace hissi." },
    { id: "navigation", label: "Navigation", note: "Sayfa linkleri, breadcrumb ve kısayollar." },
    { id: "actions", label: "Actions", note: "Komutlar, hızlı işlemler ve yardımcılar." },
    { id: "status", label: "Status", note: "Sistem, ortam ve işlem durumu." },
    { id: "insight", label: "Insight", note: "Aktivite, sayaç ve bağlamsal özetler." }
  ];

  const items = [
    {
      id: "brand",
      label: "Brand mark",
      category: "identity",
      description: "Uygulama adı ve mimari platform işareti."
    },
    {
      id: "workspace-switcher",
      label: "Workspace switcher",
      category: "identity",
      description: "Müşteri, tenant veya uygulama alanı seçimi."
    },
    {
      id: "user-menu",
      label: "User menu",
      category: "identity",
      description: "Profil, rol ve hesap menüsü."
    },
    {
      id: "breadcrumbs",
      label: "Breadcrumbs",
      category: "navigation",
      description: "Aktif ekranın hiyerarşik yolunu gösterir."
    },
    {
      id: "primary-nav",
      label: "Primary navigation",
      category: "navigation",
      description: "Dashboard, kayıtlar, akışlar ve config linkleri."
    },
    {
      id: "favorites",
      label: "Favorites",
      category: "navigation",
      description: "Sık kullanılan ekranların kısa listesi."
    },
    {
      id: "global-search",
      label: "Global search",
      category: "actions",
      description: "Kayıt, akış ve ekran arama alanı."
    },
    {
      id: "command-button",
      label: "Command button",
      category: "actions",
      description: "Mimar moduna veya ana aksiyona hızlı geçiş."
    },
    {
      id: "quick-actions",
      label: "Quick actions",
      category: "actions",
      description: "Yeni kayıt, export ve akış tetikleme komutları."
    },
    {
      id: "ai-assistant",
      label: "AI assistant",
      category: "actions",
      description: "No-code öneri ve yardım çağrısı."
    },
    {
      id: "notifications",
      label: "Notifications",
      category: "status",
      description: "Uyarılar, görevler ve onay bekleyen işler."
    },
    {
      id: "workspace-status",
      label: "Workspace status",
      category: "status",
      description: "Yayın durumu ve son deployment bilgisi."
    },
    {
      id: "environment-chip",
      label: "Environment chip",
      category: "status",
      description: "Sandbox, staging veya production etiketi."
    },
    {
      id: "sync-status",
      label: "Sync status",
      category: "status",
      description: "Kayıt, config ve şema senkronizasyon durumu."
    },
    {
      id: "version",
      label: "Version",
      category: "status",
      description: "Demo sürümü ve çıktı bilgisi."
    },
    {
      id: "record-counter",
      label: "Record counter",
      category: "insight",
      description: "Canlı kayıt sayısı ve değişim bilgisi."
    },
    {
      id: "inspector-summary",
      label: "Inspector summary",
      category: "insight",
      description: "Seçili ekranın bileşen ve kural özeti."
    },
    {
      id: "activity-feed",
      label: "Activity feed",
      category: "insight",
      description: "Son kullanıcı ve mimar aktiviteleri."
    }
  ];

  const itemMap = items.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});

  const defaultSettings = {
    brand: { label: "Optimate Solutions", compactLabel: "O" },
    "workspace-switcher": { label: "Atlas Retail", eyebrow: "Client" },
    "user-menu": { label: "Mimar", initials: "KG" },
    breadcrumbs: { rootLabel: "Studio" },
    "primary-nav": { variant: "vertical" },
    favorites: {
      variant: "collapse",
      title: "Favorites",
      linksText: "Customer board|#/app/records\nApproval lane|#/app/workflows"
    },
    "global-search": { placeholder: "Record, flow, page..." },
    "command-button": { label: "Configure", href: "#/config" },
    "quick-actions": {
      title: "Quick actions",
      actionsText: "New record\nExport view\nRun flow"
    },
    "ai-assistant": { title: "AI Builder", subtitle: "Suggest shell items" },
    notifications: { count: "7" },
    "workspace-status": { title: "Workspace", status: "Published", note: "Last deploy 14:32" },
    "environment-chip": { label: "Sandbox output" },
    "sync-status": { label: "Config saved locally" },
    version: { label: "v0.1 prototype" },
    "record-counter": { label: "Records", value: "18,432", delta: "+12.4%" },
    "inspector-summary": { title: "Inspector", note: "4 regions, 12 visible blocks" },
    "activity-feed": { entriesText: "Elif changed table rules.\nKerem published v12." }
  };

  const settingSchemas = {
    brand: [
      { key: "label", label: "Logo alt", type: "text" },
      { key: "compactLabel", label: "Compact text", type: "text" }
    ],
    "workspace-switcher": [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "label", label: "Workspace label", type: "text" }
    ],
    "user-menu": [
      { key: "initials", label: "Initials", type: "text" },
      { key: "label", label: "User label", type: "text" }
    ],
    breadcrumbs: [
      { key: "rootLabel", label: "Root label", type: "text" }
    ],
    "primary-nav": [
      { key: "variant", label: "Variant", type: "select", options: ["vertical", "compact"] }
    ],
    favorites: [
      { key: "variant", label: "Variant", type: "select", options: ["collapse", "dropdown", "list"] },
      { key: "title", label: "Title", type: "text" },
      { key: "linksText", label: "Links", type: "textarea", hint: "One per line: Label|#/app/records" }
    ],
    "global-search": [
      { key: "placeholder", label: "Placeholder", type: "text" }
    ],
    "command-button": [
      { key: "label", label: "Button label", type: "text" },
      { key: "href", label: "Href", type: "text" }
    ],
    "quick-actions": [
      { key: "title", label: "Title", type: "text" },
      { key: "actionsText", label: "Actions", type: "textarea", hint: "One action per line" }
    ],
    "ai-assistant": [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" }
    ],
    notifications: [
      { key: "count", label: "Count", type: "text" }
    ],
    "workspace-status": [
      { key: "title", label: "Title", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "note", label: "Note", type: "text" }
    ],
    "environment-chip": [
      { key: "label", label: "Label", type: "text" }
    ],
    "sync-status": [
      { key: "label", label: "Label", type: "text" }
    ],
    version: [
      { key: "label", label: "Version label", type: "text" }
    ],
    "record-counter": [
      { key: "label", label: "Label", type: "text" },
      { key: "value", label: "Value", type: "text" },
      { key: "delta", label: "Delta", type: "text" }
    ],
    "inspector-summary": [
      { key: "title", label: "Title", type: "text" },
      { key: "note", label: "Note", type: "text" }
    ],
    "activity-feed": [
      { key: "entriesText", label: "Entries", type: "textarea", hint: "One entry per line" }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getItem(itemId) {
    return itemMap[itemId] || {
      id: itemId,
      label: ns.Utils.compactLabel(itemId),
      category: "actions",
      description: "Tanımı bulunamayan demo elemanı."
    };
  }

  function getItemsByCategory(categoryId) {
    return items.filter((item) => item.category === categoryId);
  }

  function getDefaultSettings(itemId) {
    return clone(defaultSettings[itemId] || {});
  }

  function mergeSettings(itemId, settings) {
    return {
      ...getDefaultSettings(itemId),
      ...(settings || {})
    };
  }

  function getSettingSchema(itemId) {
    return settingSchemas[itemId] || [
      { key: "label", label: "Label", type: "text" }
    ];
  }

  ns.Catalog = {
    categories,
    items,
    getItem,
    getItemsByCategory,
    getDefaultSettings,
    mergeSettings,
    getSettingSchema
  };
})();
