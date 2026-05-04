(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});
  const { escapeHtml, svgIcon } = ns.Utils;

  const pages = {
    dashboard: {
      label: "Pano",
      eyebrow: "Çıktı ekranı",
      title: "Operasyon tablosu",
      summary: "Dummy KPI kartları, çıktı uygulamasının no-code platformdan geldiğini hissettiren merkezi ekran."
    },
    records: {
      label: "Kayıtlar",
      eyebrow: "Üretilmiş veri uygulaması",
      title: "Kayıt tablosu",
      summary: "Tablo, durum rozeti ve hızlı aksiyonlarla üretilmiş iş uygulaması simülasyonu."
    },
    workflows: {
      label: "İş akışları",
      eyebrow: "Otomasyon çıktısı",
      title: "Akış tablosu",
      summary: "Akış adımları, otomasyon sağlığı ve tetikleme kayıtları için dummy görünüm."
    }
  };

  function getPageMeta(pageId) {
    return pages[pageId] || pages.dashboard;
  }

  function render(route) {
    if (route.name === "config") {
      return ns.Config.render();
    }

    if (route.page === "records") {
      return renderAppPage("records");
    }

    if (route.page === "workflows") {
      return renderAppPage("workflows");
    }

    return renderAppPage("dashboard");
  }

  function renderAppPage(pageId) {
    return `
      <div class="app-screen page-enter">
        <section class="app-data-board" aria-label="Demo veri tablosu">
          ${renderViewTabs(pageId)}
          ${renderDataToolbar()}
          ${renderDemoTable(pageId)}
        </section>
      </div>
    `;
  }

  function renderViewTabs(pageId) {
    const activeView = pageId === "records"
      ? "approval"
      : pageId === "workflows"
        ? "field"
        : "operations";
    const tabs = [
      ["operations", "Operasyon", "42"],
      ["approval", "Onay kuyruğu", "8"],
      ["field", "Saha servis", "16"],
      ["finance", "Finans", "6"]
    ];

    return `
      <nav class="data-view-tabs" aria-label="Tablo görünümleri">
        ${tabs.map(([id, label, count]) => `
          <button class="data-view-tab ${id === activeView ? "is-active" : ""}" type="button">
            ${svgIcon(id === "operations" ? "table" : id === "approval" ? "file-text" : id === "field" ? "activity" : "chart")}
            <span>${escapeHtml(label)}</span>
            <small>${escapeHtml(count)}</small>
          </button>
        `).join("")}
      </nav>
    `;
  }

  function renderDataToolbar() {
    return `
      <div class="data-toolbar" aria-label="Tablo araçları">
        <div class="data-toolbar-left">
          ${renderToolbarButton("Satır ekle", "plus", true)}
          ${renderToolbarButton("Gizle", "eye-off")}
          ${renderToolbarButton("Filtre", "filter")}
          <label class="data-table-search">
            ${svgIcon("search")}
            <input type="search" placeholder="Kayıt ara" aria-label="Kayıt ara">
          </label>
          <span class="data-load-state">${svgIcon("sync")} Yüklendi 30 / 39 satır</span>
        </div>
        <div class="data-toolbar-right">
          ${renderIconButton("Kolonlar", "columns")}
          ${renderIconButton("İndir", "download")}
          ${renderIconButton("Dışa aktar", "upload")}
          ${renderIconButton("Otomasyon", "activity")}
          ${renderIconButton("Ayarlar", "settings")}
          ${renderIconButton("Bilgi", "info")}
        </div>
      </div>
    `;
  }

  function renderToolbarButton(label, iconName, isPrimary = false) {
    return `
      <button class="data-toolbar-button ${isPrimary ? "is-primary" : ""}" type="button">
        ${svgIcon(iconName)}
        <span>${escapeHtml(label)}</span>
      </button>
    `;
  }

  function renderIconButton(label, iconName) {
    return `
      <button class="data-icon-button" type="button" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
        ${svgIcon(iconName)}
      </button>
    `;
  }

  function renderDemoTable(pageId) {
    const rows = getDemoRows(pageId);

    return `
      <div class="data-table-shell">
        <table class="demo-data-table">
          <thead>
            <tr>
              <th class="select-column"><span></span></th>
              <th>${svgIcon("table")} Kayıt ID</th>
              <th>Durum</th>
              <th>Sahip</th>
              <th>Aşama</th>
              <th>Öncelik</th>
              <th>${svgIcon("star")} Puan</th>
              <th>İlerleme</th>
              <th>Güncelleme</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, index) => renderDemoRow(row, index)).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function getDemoRows(pageId) {
    const prefix = pageId === "records" ? "REC" : pageId === "workflows" ? "FLOW" : "OPS";
    return [
      [`${prefix}-2401`, "Yayında", "Elif", "Müşteri kabul", "Yüksek", 5, 82, "2 dk önce"],
      [`${prefix}-2402`, "İncelemede", "Kemal", "Veri kontrol", "Orta", 3, 46, "8 dk önce"],
      [`${prefix}-2403`, "Bekliyor", "Derya", "Onay hattı", "Yüksek", 4, 64, "12 dk önce"],
      [`${prefix}-2404`, "Taslak", "Mert", "Form tasarımı", "Düşük", 2, 25, "18 dk önce"],
      [`${prefix}-2405`, "Yayında", "Selin", "Saha servis", "Orta", 5, 91, "25 dk önce"],
      [`${prefix}-2406`, "Yayında", "Arda", "Finans kontrol", "Yüksek", 4, 72, "31 dk önce"],
      [`${prefix}-2407`, "Bekliyor", "Elif", "Rol eşleme", "Orta", 1, 18, "44 dk önce"],
      [`${prefix}-2408`, "İncelemede", "Kemal", "Bildirim", "Düşük", 3, 39, "1 sa önce"],
      [`${prefix}-2409`, "Yayında", "Derya", "Katalog", "Yüksek", 5, 88, "1 sa önce"],
      [`${prefix}-2410`, "Taslak", "Mert", "Aksiyon seti", "Orta", 2, 33, "2 sa önce"],
      [`${prefix}-2411`, "Bekliyor", "Selin", "Rapor", "Düşük", 4, 58, "2 sa önce"],
      [`${prefix}-2412`, "Yayında", "Arda", "Senkron", "Yüksek", 5, 96, "3 sa önce"]
    ];
  }

  function renderDemoRow(row, index) {
    const [id, status, owner, stage, priority, rating, score, updated] = row;

    return `
      <tr>
        <td class="select-column"><span class="row-check" aria-hidden="true"></span></td>
        <td class="id-cell"><strong>${escapeHtml(id)}</strong><small>#${String(index + 1).padStart(2, "0")}</small></td>
        <td>${renderStatus(status)}</td>
        <td><span class="owner-chip">${escapeHtml(owner.slice(0, 2))}</span> ${escapeHtml(owner)}</td>
        <td><span class="stage-pill">${escapeHtml(stage)}</span></td>
        <td>${renderPriority(priority)}</td>
        <td>${renderStars(rating)}</td>
        <td>${renderScore(score)}</td>
        <td class="updated-cell">${escapeHtml(updated)}</td>
      </tr>
    `;
  }

  function renderStatus(status) {
    const statusClass = {
      "Yayında": "live",
      "İncelemede": "review",
      "Bekliyor": "waiting",
      "Taslak": "draft"
    }[status] || "draft";

    return `<span class="data-status data-status-${statusClass}">${escapeHtml(status)}</span>`;
  }

  function renderPriority(priority) {
    const priorityClass = priority === "Yüksek" ? "high" : priority === "Orta" ? "medium" : "low";
    return `<span class="priority-chip priority-${priorityClass}">${escapeHtml(priority)}</span>`;
  }

  function renderStars(value) {
    return `
      <span class="rating-stars" aria-label="${value} yıldız">
        ${Array.from({ length: 5 }, (_, index) => `<i class="${index < value ? "is-filled" : ""}">★</i>`).join("")}
      </span>
    `;
  }

  function renderScore(score) {
    return `
      <span class="score-cell">
        <strong>${score}/100</strong>
        <span><i style="width: ${score}%"></i></span>
      </span>
    `;
  }

  ns.Content = {
    pages,
    getPageMeta,
    render
  };
})();
