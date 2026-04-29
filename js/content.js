(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});
  const { escapeHtml, icon } = ns.Utils;

  const pages = {
    dashboard: {
      label: "Pano",
      eyebrow: "Çıktı ekranı",
      title: "Müşteri operasyon panosu",
      summary: "Dummy KPI kartları, çıktı uygulamasının no-code platformdan geldiğini hissettiren merkezi ekran."
    },
    records: {
      label: "Kayıtlar",
      eyebrow: "Üretilmiş veri uygulaması",
      title: "Müşteri kayıtları",
      summary: "Tablo, durum rozeti ve hızlı aksiyonlarla üretilmiş iş uygulaması simülasyonu."
    },
    workflows: {
      label: "İş akışları",
      eyebrow: "Otomasyon çıktısı",
      title: "İş akışı izleme",
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
      return renderAppPage("records", {
        cta: "Yeni kayıt",
        stats: [
          ["Kayıt", "18.4K", "Senkron"],
          ["Görünüm", "6", "Üretildi"],
          ["Değişiklik", "14", "Bugün"]
        ],
        rows: [
          ["ACME saha servisi", "Yayında", "12 modül"],
          ["Northwind operasyon", "Taslak", "8 modül"],
          ["Contoso finans", "İncelemede", "15 modül"],
          ["Fabrikam masaüstü", "Yayında", "6 modül"]
        ],
        sideTitle: "Seçili kayıt",
        sideLines: ["Müşteri veri uygulaması", "4 görünür bölüm", "No-code üretildi"]
      });
    }

    if (route.page === "workflows") {
      return renderAppPage("workflows", {
        cta: "Akışı çalıştır",
        stats: [
          ["Çalışma", "324", "Bu hafta"],
          ["Başarısız", "3", "İnceleme gerekli"],
          ["Ort. süre", "1.8 dk", "Sağlıklı"]
        ],
        rows: [
          ["Tetikleyici", "Tamamlandı", "Webhook alındı"],
          ["Doğrulama", "Tamamlandı", "Şema kuralları kontrol edildi"],
          ["Yönlendirme", "Aktif", "Finans kanalı"],
          ["Yayın", "Bekliyor", "Onay gerekli"]
        ],
        sideTitle: "Akış bağlamı",
        sideLines: ["4 otomasyon adımı", "2 koşullu dal", "Son çalışma 14:32"]
      });
    }

    return renderAppPage("dashboard", {
      cta: "Uygulama kabuğunu yapılandır",
      stats: [
        ["Uygulama", "42", "Yayında"],
        ["Sağlık", "97%", "Kararlı"],
        ["Görev", "8", "Açık"]
      ],
      rows: [
        ["Müşteri kokpiti", "Yayında", "2 dk önce güncellendi"],
        ["Onay kuyruğu", "İncelemede", "3 bekleyen görev"],
        ["Saha servisi", "Taslak", "Yayına hazır"],
        ["Finans masası", "Yayında", "Kurallar senkron"]
      ],
      sideTitle: "Uygulama özeti",
      sideLines: ["4 kabuk bölgesi", "12 görünür blok", "Ayarlar yerelde kayıtlı"]
    });
  }

  function renderAppPage(pageId, options) {
    const meta = getPageMeta(pageId);

    return `
      <div class="app-screen page-enter">
        <section class="app-topline">
          <div>
            <span class="app-kicker">${escapeHtml(meta.eyebrow)}</span>
            <h1>${escapeHtml(meta.title)}</h1>
            <p>${escapeHtml(meta.summary)}</p>
          </div>
          <a class="app-action" href="${options.cta === "Uygulama kabuğunu yapılandır" ? "#/config" : "#/app/" + pageId}">
            ${icon(options.cta.slice(0, 3))}
            ${escapeHtml(options.cta)}
          </a>
        </section>

        <section class="app-summary-strip">
          ${options.stats.map((stat) => renderAppStat(stat[0], stat[1], stat[2])).join("")}
        </section>

        <section class="app-workbench">
          <article class="app-panel app-panel-main">
            <div class="app-panel-head">
              <span>Çalışma alanı</span>
              <strong>${escapeHtml(meta.label)}</strong>
            </div>
            <div class="app-list">
              ${options.rows.map((row) => renderAppRow(row[0], row[1], row[2])).join("")}
            </div>
          </article>
          <aside class="app-panel app-panel-side">
            <div class="app-panel-head">
              <span>İnceleyici</span>
              <strong>${escapeHtml(options.sideTitle)}</strong>
            </div>
            <div class="app-note-stack">
              ${options.sideLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
            </div>
          </aside>
        </section>
      </div>
    `;
  }

  function renderAppStat(label, value, note) {
    return `
      <article class="app-stat">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(note)}</small>
      </article>
    `;
  }

  function renderAppRow(title, status, detail) {
    return `
      <article class="app-list-row">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(detail)}</small>
        </div>
        <span>${escapeHtml(status)}</span>
      </article>
    `;
  }

  ns.Content = {
    pages,
    getPageMeta,
    render
  };
})();
