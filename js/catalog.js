(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});

  const categories = [
    { id: "identity", label: "Kimlik", note: "Marka, müşteri ve çalışma alanı hissi." },
    { id: "navigation", label: "Navigasyon", note: "Sayfa linkleri, yol bilgisi ve kısayollar." },
    { id: "layout", label: "Düzen", note: "Alanları ayıran çizgiler ve görsel nefesler." },
    { id: "actions", label: "İşlemler", note: "Komutlar, hızlı işlemler ve yardımcılar." },
    { id: "status", label: "Durum", note: "Sistem, ortam ve işlem durumu." },
    { id: "insight", label: "İçgörü", note: "Aktivite, sayaç ve bağlamsal özetler." }
  ];

  const items = [
    {
      id: "brand",
      label: "Marka logosu",
      category: "identity",
      description: "Uygulama adı ve mimari platform işareti."
    },
    {
      id: "workspace-switcher",
      label: "Sayfa seçici",
      category: "identity",
      description: "Sayfa, hizmet veya uygulama alanı seçimi."
    },
    {
      id: "user-menu",
      label: "Kullanıcı menüsü",
      category: "identity",
      description: "Profil, rol ve hesap menüsü."
    },
    {
      id: "breadcrumbs",
      label: "Yol bilgisi",
      category: "navigation",
      description: "Aktif ekranın hiyerarşik yolunu gösterir."
    },
    {
      id: "primary-nav",
      label: "Ana navigasyon",
      category: "navigation",
      description: "Pano, kayıtlar, akışlar ve yapılandırma linkleri."
    },
    {
      id: "tree-menu",
      label: "Tree menü",
      category: "navigation",
      description: "İç içe sayfa ve modül ağacını gösterir."
    },
    {
      id: "favorites",
      label: "Favoriler",
      category: "navigation",
      description: "Sık kullanılan ekranların kısa listesi."
    },
    {
      id: "divider",
      label: "Ayırıcı",
      category: "layout",
      description: "Header, footer veya yan bar içinde dikey/yatay çizgi."
    },
    {
      id: "global-search",
      label: "Genel arama",
      category: "actions",
      description: "Kayıt, akış ve ekran arama alanı."
    },
    {
      id: "button",
      label: "Button",
      category: "actions",
      description: "Text, icon ve icon+text varyasyonları olan aksiyon ailesi."
    },
    {
      id: "command-button",
      label: "Komut butonu",
      category: "actions",
      description: "Mimar moduna veya ana aksiyona hızlı geçiş."
    },
    {
      id: "command-palette",
      label: "Komut paleti",
      category: "actions",
      description: "Klavye kısayolu ve hızlı komut paleti tetikleyicisi."
    },
    {
      id: "quick-actions",
      label: "Hızlı işlemler",
      category: "actions",
      description: "Yeni kayıt, dışa aktarma ve akış tetikleme komutları."
    },
    {
      id: "ai-assistant",
      label: "Yapay zeka yardımcısı",
      category: "actions",
      description: "No-code öneri ve yardım çağrısı."
    },
    {
      id: "notifications",
      label: "Bildirimler",
      category: "status",
      description: "Uyarılar, görevler ve onay bekleyen işler."
    },
    {
      id: "workspace-status",
      label: "Çalışma alanı durumu",
      category: "status",
      description: "Yayın durumu ve son deployment bilgisi."
    },
    {
      id: "environment-chip",
      label: "Ortam etiketi",
      category: "status",
      description: "Sandbox, test veya canlı ortam etiketi."
    },
    {
      id: "sync-status",
      label: "Senkron durumu",
      category: "status",
      description: "Kayıt, yapılandırma ve şema senkronizasyon durumu."
    },
    {
      id: "version",
      label: "Sürüm",
      category: "status",
      description: "Demo sürümü ve çıktı bilgisi."
    },
    {
      id: "record-counter",
      label: "Kayıt sayacı",
      category: "insight",
      description: "Canlı kayıt sayısı ve değişim bilgisi."
    },
    {
      id: "mini-metric",
      label: "Mini metric",
      category: "insight",
      description: "Tek satırda küçük KPI veya trend göstergesi."
    },
    {
      id: "inspector-summary",
      label: "İnceleyici özeti",
      category: "insight",
      description: "Seçili ekranın bileşen ve kural özeti."
    },
    {
      id: "activity-feed",
      label: "Aktivite akışı",
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
    "workspace-switcher": {
      eyebrow: "",
      activeWorkspaceId: "benim-sayfam",
      workspacesText: "benim-sayfam|BS|Benim Sayfam\narge|AR|AR-GE\ndanismanlik|DN|Danışmanlık\npentest|PT|Pentest\negitimler|EG|Eğitimler"
    },
    "user-menu": { label: "Mimar", initials: "KG", variant: "full" },
    breadcrumbs: { rootLabel: "Stüdyo" },
    "primary-nav": { variant: "vertical" },
    "tree-menu": {
      title: "Modül ağacı",
      icon: "TR",
      variant: "nested",
      itemsText: "0|Yönetim|#/app/dashboard|YN\n1|Kullanıcılar|#/app/records|KU\n1|Roller|#/app/workflows|RO\n0|Operasyon|#/app/records|OP\n1|Kayıt akışı|#/app/records|KA\n2|Onay hattı|#/app/workflows|OH\n0|Yapılandırma|#/config|YA"
    },
    favorites: {
      variant: "collapse",
      title: "Favoriler",
      linksText: "Müşteri panosu|#/app/records\nOnay hattı|#/app/workflows"
    },
    "global-search": { placeholder: "Kayıt, akış, sayfa..." },
    button: { label: "Yeni kayıt", icon: "+", href: "#/config", variant: "text", appearance: "primary" },
    "icon-button": { label: "Ekle", icon: "+", href: "#/config", variant: "icon", appearance: "primary" },
    "icon-text-button": { label: "Yeni kayıt", icon: "+", href: "#/config", variant: "iconText", appearance: "primary" },
    "command-button": { label: "Yapılandır", href: "#/config" },
    "command-palette": { label: "Komut paleti", shortcut: "Ctrl K", icon: "⌘", href: "#/config", variant: "inline" },
    "quick-actions": {
      title: "Hızlı işlemler",
      actionsText: "Yeni kayıt\nGörünümü dışa aktar\nAkışı çalıştır"
    },
    "ai-assistant": { title: "Yapay zeka yardımcısı", subtitle: "Kabuk öğeleri öner" },
    notifications: { count: "7" },
    "workspace-status": { title: "Çalışma alanı", status: "Yayında", note: "Son yayın 14:32" },
    "environment-chip": { label: "Sandbox çıktısı" },
    "sync-status": { label: "Ayarlar yerelde kayıtlı" },
    version: { label: "v0.1 prototip" },
    "record-counter": { label: "Kayıtlar", value: "18,432", delta: "+12.4%" },
    "mini-metric": { label: "Aktif akış", value: "42", note: "6 bekleyen", trend: "+8%", variant: "inline" },
    "inspector-summary": { title: "İnceleyici", note: "4 bölge, 12 görünür blok" },
    "activity-feed": { entriesText: "Elif tablo kurallarını değiştirdi.\nKerem v12 sürümünü yayınladı." },
    divider: { orientation: "auto" }
  };

  const settingSchemas = {
    brand: [
      { key: "label", label: "Logo alt", type: "text" },
      { key: "compactLabel", label: "Kompakt metin", type: "text" }
    ],
    "workspace-switcher": [
      { key: "eyebrow", label: "Üst etiket", type: "text" },
      { key: "workspacesText", label: "Sayfalar", type: "textarea", hint: "Her satır: id|baş harf|ad" }
    ],
    "user-menu": [
      { key: "variant", label: "Görünüm", type: "select", options: ["full", "avatar"] },
      { key: "initials", label: "Baş harfler", type: "text" },
      { key: "label", label: "Kullanıcı etiketi", type: "text" }
    ],
    breadcrumbs: [
      { key: "rootLabel", label: "Kök etiket", type: "text" }
    ],
    "primary-nav": [
      { key: "variant", label: "Görünüm", type: "select", options: ["vertical", "compact"] }
    ],
    "tree-menu": [
      { key: "variant", label: "Görünüm", type: "select", options: ["nested", "compact"] },
      { key: "title", label: "Başlık", type: "text" },
      { key: "icon", label: "Kompakt ikon", type: "text" },
      { key: "itemsText", label: "Ağaç öğeleri", type: "textarea", hint: "Her satır: level|etiket|href|ikon" }
    ],
    favorites: [
      { key: "variant", label: "Görünüm", type: "select", options: ["collapse", "dropdown", "list"] },
      { key: "title", label: "Başlık", type: "text" },
      { key: "linksText", label: "Linkler", type: "textarea", hint: "Her satır: Etiket|#/app/records" }
    ],
    divider: [
      { key: "orientation", label: "Yön", type: "select", options: ["auto", "vertical", "horizontal"], hint: "Otomatik: yatay alanlarda dikey, yan barlarda yatay çizgi." }
    ],
    "global-search": [
      { key: "placeholder", label: "Yer tutucu", type: "text" }
    ],
    button: [
      { key: "variant", label: "Varyasyon", type: "select", options: ["text", "icon", "iconText"] },
      { key: "appearance", label: "Görünüm", type: "select", options: ["primary", "secondary", "danger", "ghost"] },
      { key: "label", label: "Buton etiketi", type: "text" },
      { key: "icon", label: "İkon", type: "text", hint: "Tek karakter veya kısa metin." },
      { key: "href", label: "Bağlantı", type: "text" }
    ],
    "icon-button": [
      { key: "label", label: "Erişilebilir etiket", type: "text" },
      { key: "icon", label: "İkon", type: "text", hint: "Tek karakter veya kısa metin." },
      { key: "href", label: "Bağlantı", type: "text" }
    ],
    "icon-text-button": [
      { key: "label", label: "Buton etiketi", type: "text" },
      { key: "icon", label: "İkon", type: "text", hint: "Tek karakter veya kısa metin." },
      { key: "href", label: "Bağlantı", type: "text" }
    ],
    "command-button": [
      { key: "label", label: "Buton etiketi", type: "text" },
      { key: "href", label: "Bağlantı", type: "text" }
    ],
    "command-palette": [
      { key: "variant", label: "Görünüm", type: "select", options: ["inline", "compact"] },
      { key: "label", label: "Etiket", type: "text" },
      { key: "shortcut", label: "Kısayol", type: "text" },
      { key: "icon", label: "İkon", type: "text" },
      { key: "href", label: "Bağlantı", type: "text" }
    ],
    "quick-actions": [
      { key: "title", label: "Başlık", type: "text" },
      { key: "actionsText", label: "İşlemler", type: "textarea", hint: "Her satıra bir işlem" }
    ],
    "ai-assistant": [
      { key: "title", label: "Başlık", type: "text" },
      { key: "subtitle", label: "Alt başlık", type: "text" }
    ],
    notifications: [
      { key: "count", label: "Sayı", type: "text" }
    ],
    "workspace-status": [
      { key: "title", label: "Başlık", type: "text" },
      { key: "status", label: "Durum", type: "text" },
      { key: "note", label: "Not", type: "text" }
    ],
    "environment-chip": [
      { key: "label", label: "Etiket", type: "text" }
    ],
    "sync-status": [
      { key: "label", label: "Etiket", type: "text" }
    ],
    version: [
      { key: "label", label: "Sürüm etiketi", type: "text" }
    ],
    "record-counter": [
      { key: "label", label: "Etiket", type: "text" },
      { key: "value", label: "Değer", type: "text" },
      { key: "delta", label: "Değişim", type: "text" }
    ],
    "mini-metric": [
      { key: "variant", label: "Görünüm", type: "select", options: ["inline", "stacked"] },
      { key: "label", label: "Etiket", type: "text" },
      { key: "value", label: "Değer", type: "text" },
      { key: "note", label: "Not", type: "text" },
      { key: "trend", label: "Trend", type: "text" }
    ],
    "inspector-summary": [
      { key: "title", label: "Başlık", type: "text" },
      { key: "note", label: "Not", type: "text" }
    ],
    "activity-feed": [
      { key: "entriesText", label: "Kayıtlar", type: "textarea", hint: "Her satıra bir kayıt" }
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
      { key: "label", label: "Etiket", type: "text" }
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
