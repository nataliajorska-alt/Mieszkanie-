import { SceneApp } from "./scene.js";
import { UI } from "./ui.js";
import * as storage from "./storage.js";
import { defaultLayout } from "./preset.js";

class App {
  constructor() {
    const canvas = document.getElementById("canvas");
    this.scene = new SceneApp(canvas);
    this.ui = new UI(this);
    this._loadInitial();
  }

  _loadInitial() {
    const auto = storage.loadAutosave();
    if (auto && auto.objects?.length) {
      this.scene.load(auto);
      this._syncRoomInputs();
    } else {
      this.loadDefault();
    }
  }

  loadDefault() {
    this.scene.load(JSON.parse(JSON.stringify(defaultLayout)));
    this._syncRoomInputs();
  }

  _syncRoomInputs() {
    const cfg = this.scene.room.config;
    document.getElementById("room-width").value = cfg.width;
    document.getElementById("room-length").value = cfg.length;
    document.getElementById("room-height").value = cfg.height;
    document.getElementById("wall-color").value = cfg.wallColor;
    document.getElementById("floor-style").value = cfg.floorStyle;
  }

  save() {
    return storage.save(this.scene.serialize());
  }

  load() {
    const data = storage.load();
    if (!data) return false;
    this.scene.load(data);
    this._syncRoomInputs();
    return true;
  }

  autosave() {
    storage.autosave(this.scene.serialize());
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.__app = new App();
});
