(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});

  function init() {
    window.addEventListener("hashchange", render);

    if (!window.location.hash) {
      window.location.hash = "#/app/dashboard";
      return;
    }

    render();
  }

  function getRoute() {
    const hash = window.location.hash || "#/app/dashboard";
    const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);

    if (parts[0] === "config") {
      return { name: "config" };
    }

    if (parts[0] === "app") {
      const page = ns.Content.pages[parts[1]] ? parts[1] : "dashboard";
      return { name: "app", page };
    }

    return { name: "app", page: "dashboard" };
  }

  function render() {
    const root = document.getElementById("app");
    const route = getRoute();

    root.innerHTML = ns.Shell.render(route);
    document.body.dataset.route = route.name === "config" ? "config" : route.page;
  }

  ns.Router = {
    init,
    render,
    getRoute
  };
})();
