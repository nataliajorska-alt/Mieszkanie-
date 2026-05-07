import { catalog } from "./furniture.js";
import { shops } from "./search.js";
import { styles } from "./styles.js";

export class UI {
  constructor(app) {
    this.app = app;
    this.$ = (id) => document.getElementById(id);
    this._buildCatalog();
    this._buildShops();
    this._buildStyles();
    this._wireRoom();
    this._wireSelection();
    this._wireToolbar();
    this._wireSearchDialog();
    this._wireResponsive();
    this._wireScene();
    this._wireRefImage();
  }

  _buildStyles() {
    const root = this.$("style-picker");
    const desc = this.$("style-desc");
    root.innerHTML = "";
    for (const s of styles) {
      const el = document.createElement("button");
      el.className = "style-chip";
      el.dataset.styleId = s.id;
      el.title = s.desc;
      const swatches = ["walls", "sofa", "darkWood", "accent"]
        .map((k) => `<span class="swatch" style="background:${k === "walls" ? s.walls : s.palette[k]}"></span>`)
        .join("");
      el.innerHTML = `
        <span class="icon">${s.icon}</span>
        <span class="label">${s.name}</span>
        <span class="swatches">${swatches}</span>
      `;
      el.addEventListener("click", () => {
        this.app.scene.applyStyle(s);
        this._activateStyleChip(s.id);
        desc.textContent = s.desc;
        this._refreshShopsForStyle(s);
        this._toast(`Styl: ${s.name}`);
      });
      root.appendChild(el);
    }
    // default highlight + shop links for the "current" style
    this._activateStyleChip(styles[0].id);
    this._refreshShopsForStyle(styles[0]);
  }

  _activateStyleChip(id) {
    const root = this.$("style-picker");
    root.querySelectorAll(".style-chip").forEach((el) => {
      el.classList.toggle("active", el.dataset.styleId === id);
    });
  }

  _refreshShopsForStyle(style) {
    const root = this.$("quick-shops");
    if (!root) return;
    root.innerHTML = "";
    for (const s of shops) {
      const a = document.createElement("a");
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.href = s.url(style.shop);
      a.innerHTML = `<span class="shop-dot" style="background:${s.color}"></span>${s.label}`;
      root.appendChild(a);
    }
  }

  _buildCatalog() {
    const container = this.$("catalog");
    container.innerHTML = "";
    const filter = this.$("catalog-filter");
    const render = () => {
      const q = (filter.value || "").trim().toLowerCase();
      container.innerHTML = "";
      const items = catalog.filter((c) =>
        !q || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) ||
        (c.search || "").toLowerCase().includes(q)
      );
      // group by category
      const groups = {};
      for (const it of items) (groups[it.category] ||= []).push(it);
      for (const cat of Object.keys(groups)) {
        const head = document.createElement("div");
        head.className = "cat-cat";
        head.style.gridColumn = "1 / -1";
        head.textContent = cat;
        container.appendChild(head);
        for (const it of groups[cat]) {
          const el = document.createElement("button");
          el.className = "cat-item";
          el.title = `${it.name} — ${it.size.w}×${it.size.d}×${it.size.h} m`;
          el.innerHTML = `
            <div class="cat-thumb">${it.icon || "📦"}</div>
            <div class="cat-name">${it.name}</div>
            <div class="cat-meta">${it.size.w} × ${it.size.d} m</div>
          `;
          el.addEventListener("click", () => {
            this.app.scene.addFromCatalog(it.id);
            this._toast(`Dodano: ${it.name}`);
          });
          container.appendChild(el);
        }
      }
    };
    filter.addEventListener("input", render);
    render();
  }

  _buildShops() {
    // initial fill — will be re-filled when a style is selected
    const root = this.$("quick-shops");
    root.innerHTML = "";
    for (const s of shops) {
      const a = document.createElement("a");
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.href = s.url("salon meble");
      a.innerHTML = `<span class="shop-dot" style="background:${s.color}"></span>${s.label}`;
      root.appendChild(a);
    }
  }

  _wireRoom() {
    const apply = () => {
      this.app.scene.room.setConfig({
        width: parseFloat(this.$("room-width").value) || 3.6,
        length: parseFloat(this.$("room-length").value) || 5.2,
        height: parseFloat(this.$("room-height").value) || 2.6,
        wallColor: this.$("wall-color").value,
        floorStyle: this.$("floor-style").value,
      });
      this.app.scene.resetCamera();
    };
    ["room-width", "room-length", "room-height", "wall-color", "floor-style"].forEach((id) => {
      this.$(id).addEventListener("change", apply);
    });
  }

  _wireSelection() {
    const panel = this.$("selection-panel");

    const update = (obj) => {
      if (!obj) {
        panel.hidden = true;
        return;
      }
      panel.hidden = false;
      this.$("sel-name").textContent = obj.userData.name;
      const s = obj.userData.size;
      this.$("sel-dims").textContent = `${s.w.toFixed(2)} × ${s.d.toFixed(2)} × ${s.h.toFixed(2)} m`;
      this.$("sel-x").value = obj.position.x.toFixed(2);
      this.$("sel-z").value = obj.position.z.toFixed(2);
      this.$("sel-rot").value = Math.round((obj.rotation.y * 180 / Math.PI) % 360);
      this.$("sel-w").value = s.w.toFixed(2);
      this.$("sel-d").value = s.d.toFixed(2);
      this.$("sel-h").value = s.h.toFixed(2);
      this.$("sel-color").value = obj.userData.color || "#cccccc";
    };

    this.app.scene.on("select", update);
    this.app.scene.on("transform", update);

    const num = (id) => parseFloat(this.$(id).value);
    this.$("sel-x").addEventListener("change", () => this.app.scene.applySelectionEdit({ x: num("sel-x") }));
    this.$("sel-z").addEventListener("change", () => this.app.scene.applySelectionEdit({ z: num("sel-z") }));
    this.$("sel-rot").addEventListener("change", () =>
      this.app.scene.applySelectionEdit({ rotation: (num("sel-rot") || 0) * Math.PI / 180 }));
    this.$("sel-w").addEventListener("change", () => this.app.scene.applySelectionEdit({ w: num("sel-w") }));
    this.$("sel-d").addEventListener("change", () => this.app.scene.applySelectionEdit({ d: num("sel-d") }));
    this.$("sel-h").addEventListener("change", () => this.app.scene.applySelectionEdit({ h: num("sel-h") }));
    this.$("sel-color").addEventListener("change", () =>
      this.app.scene.applySelectionEdit({ color: this.$("sel-color").value }));

    this.$("btn-deselect").addEventListener("click", () => this.app.scene.deselect());
    this.$("btn-delete").addEventListener("click", () => this.app.scene.removeSelected());
    this.$("btn-duplicate").addEventListener("click", () => this.app.scene.duplicateSelected());
    this.$("btn-search").addEventListener("click", () => this._openSearchDialog());
  }

  _wireToolbar() {
    this.$("btn-view-3d").addEventListener("click", () => this._setView("3d"));
    this.$("btn-view-top").addEventListener("click", () => this._setView("top"));
    this.$("btn-save").addEventListener("click", () => {
      this.app.save();
      this._toast("Zapisano układ ✓");
    });
    this.$("btn-load").addEventListener("click", () => {
      const ok = this.app.load();
      this._toast(ok ? "Wczytano zapis" : "Brak zapisanego układu");
    });
    this.$("btn-reset").addEventListener("click", () => {
      if (confirm("Wczytać domyślny układ salonu (jak na zdjęciach)? Bieżąca aranżacja zostanie zastąpiona.")) {
        this.app.loadDefault();
        this._toast("Wczytano domyślny układ");
      }
    });
    this.$("btn-screenshot").addEventListener("click", () => {
      const dataUrl = this.app.scene.renderer.domElement.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `mieszkanie-${Date.now()}.png`;
      a.click();
    });
  }

  _setView(mode) {
    this.app.scene.setMode(mode);
    this.$("btn-view-3d").classList.toggle("active", mode === "3d");
    this.$("btn-view-top").classList.toggle("active", mode === "top");
  }

  _wireSearchDialog() {
    const dlg = this.$("dialog-search");
    this._dialog = dlg;
  }

  _openSearchDialog() {
    const sel = this.app.scene.selection;
    if (!sel) return;
    this.$("search-title").textContent = sel.userData.name;
    const root = this.$("search-links");
    root.innerHTML = "";
    const query = sel.userData.search || sel.userData.name;
    for (const s of shops) {
      const a = document.createElement("a");
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.href = s.url(query);
      a.innerHTML = `<span class="shop-dot" style="background:${s.color}"></span>${s.label}`;
      root.appendChild(a);
    }
    this._dialog.showModal();
  }

  _wireResponsive() {
    const sb = this.$("sidebar");
    this.$("btn-toggle-sidebar").addEventListener("click", () => {
      sb.classList.toggle("open");
    });
  }

  _wireScene() {
    this.app.scene.on("requestMode", (mode) => this._setView(mode));
    this.app.scene.on("change", () => this.app.autosave());
  }

  _wireRefImage() {
    const inp = this.$("ref-image");
    inp.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const win = window.open();
      if (win) {
        win.document.title = "Zdjęcie referencyjne";
        win.document.body.style.cssText = "margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh";
        const img = win.document.createElement("img");
        img.src = url;
        img.style.cssText = "max-width:100%;max-height:100vh";
        win.document.body.appendChild(img);
      }
    });
  }

  _toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      document.querySelector(".viewport").appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }
}
