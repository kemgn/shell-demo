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

  ns.Catalog = {
    categories,
    items,
    getItem,
    getItemsByCategory
  };
})();
