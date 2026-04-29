(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});
  const { escapeHtml, icon } = ns.Utils;

  const pages = {
    dashboard: {
      label: "Dashboard",
      eyebrow: "Output screen",
      title: "Customer operations cockpit",
      summary: "Dummy KPI kartları, çıktı uygulamasının no-code platformdan geldiğini hissettiren merkezi ekran."
    },
    records: {
      label: "Records",
      eyebrow: "Generated data app",
      title: "Customer records",
      summary: "Tablo, durum rozeti ve hızlı aksiyonlarla üretilmiş iş uygulaması simülasyonu."
    },
    workflows: {
      label: "Workflows",
      eyebrow: "Automation output",
      title: "Workflow monitor",
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
        cta: "New record",
        stats: [
          ["Records", "18.4K", "Synced"],
          ["Views", "6", "Generated"],
          ["Changes", "14", "Today"]
        ],
        rows: [
          ["ACME Field Service", "Live", "12 modules"],
          ["Northwind Ops", "Draft", "8 modules"],
          ["Contoso Finance", "Review", "15 modules"],
          ["Fabrikam Desk", "Live", "6 modules"]
        ],
        sideTitle: "Selected record",
        sideLines: ["Customer data app", "4 visible sections", "No-code generated"]
      });
    }

    if (route.page === "workflows") {
      return renderAppPage("workflows", {
        cta: "Run flow",
        stats: [
          ["Runs", "324", "This week"],
          ["Failed", "3", "Needs review"],
          ["Avg time", "1.8m", "Healthy"]
        ],
        rows: [
          ["Trigger", "Complete", "Webhook received"],
          ["Validate", "Complete", "Schema rules checked"],
          ["Route", "Active", "Finance lane"],
          ["Publish", "Waiting", "Approval required"]
        ],
        sideTitle: "Flow context",
        sideLines: ["4 automation steps", "2 conditional branches", "Last run 14:32"]
      });
    }

    return renderAppPage("dashboard", {
      cta: "Configure shell",
      stats: [
        ["Apps", "42", "Live"],
        ["Health", "97%", "Stable"],
        ["Tasks", "8", "Open"]
      ],
      rows: [
        ["Customer cockpit", "Live", "Updated 2m ago"],
        ["Approval queue", "Review", "3 pending tasks"],
        ["Field service", "Draft", "Ready to publish"],
        ["Finance desk", "Live", "Rules synced"]
      ],
      sideTitle: "App snapshot",
      sideLines: ["4 shell regions", "12 visible blocks", "Config saved locally"]
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
          <a class="app-action" href="${options.cta === "Configure shell" ? "#/config" : "#/app/" + pageId}">
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
              <span>Workspace</span>
              <strong>${escapeHtml(meta.label)}</strong>
            </div>
            <div class="app-list">
              ${options.rows.map((row) => renderAppRow(row[0], row[1], row[2])).join("")}
            </div>
          </article>
          <aside class="app-panel app-panel-side">
            <div class="app-panel-head">
              <span>Inspector</span>
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
