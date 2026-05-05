(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});

  const categories = [
    { id: "identity", label: "Kimlik", note: "Her müşteriye marka, sayfa ve kullanıcı bağlamı kazandırır." },
    { id: "navigation", label: "Navigasyon", note: "Müşteri portalına ana menü, tree ve favori akışları ekler." },
    { id: "layout", label: "Düzen", note: "Shell alanlarını ayırır ve uygulama hiyerarşisini netleştirir." },
    { id: "actions", label: "İşlemler", note: "No-code çıktıya komut, arama, bildirim ve yardımcı aksiyonları taşır." }
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
      category: "navigation",
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
      id: "notifications",
      label: "Bildirimler",
      category: "actions",
      description: "Uyarılar, görevler ve onay bekleyen işler."
    }
  ];

  const itemMap = items.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});

  const defaultSettings = {
    brand: { label: "Optimate Solutions", compactLabel: "O", compact: false },
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
      linksText: "Müşteri panosu|#\nOnay hattı|#"
    },
    "global-search": { placeholder: "Bul..." },
    button: { label: "Kaydet", icon: "", href: "#/config", variant: "text", style: "text", appearance: "ghost" },
    "icon-button": { label: "Yardım", icon: "?", href: "#/config", variant: "icon", style: "outlined", appearance: "secondary" },
    "icon-text-button": { label: "Yeni kayıt", icon: "+", href: "#/config", variant: "iconText", style: "filled", appearance: "primary" },
    "command-button": { label: "Yapılandır", href: "#/config" },
    "command-palette": { label: "Komut paleti", shortcut: "Ctrl K", icon: "⌘", href: "#/config", variant: "inline" },
    notifications: { count: "7" },
    divider: { orientation: "auto" }
  };

  const settingSchemas = {
    brand: [
      { key: "compact", label: "Compact", type: "boolean" },
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
      { key: "style", label: "Stil", type: "select", options: ["filled", "outlined", "text"] },
      { key: "appearance", label: "Ton", type: "select", options: ["primary", "secondary", "danger", "ghost"] },
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
    notifications: [
      { key: "count", label: "Sayı", type: "text" }
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
