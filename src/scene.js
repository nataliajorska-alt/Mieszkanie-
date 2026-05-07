import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Room } from "./room.js";
import { buildFurniture, rebuildFurniture, catalog } from "./furniture.js";

export class SceneApp {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x12141b, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x12141b);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.05, 200);
    this.camera.position.set(4.5, 3.4, 5.5);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 1.0, 0);
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 18;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;

    this._setupLights();

    this.room = new Room(this.scene);

    this.objects = new THREE.Group();
    this.objects.name = "furniture";
    this.scene.add(this.objects);

    this.selection = null;
    this._selectionBox = new THREE.BoxHelper(new THREE.Object3D(), 0xe9b96b);
    this._selectionBox.material.depthTest = false;
    this._selectionBox.material.linewidth = 2;
    this._selectionBox.visible = false;
    this.scene.add(this._selectionBox);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this._dragging = false;
    this._dragOffset = new THREE.Vector3();
    this._dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    this._listeners = {};
    this._mode = "3d"; // "3d" | "top"

    this._addEvents();
    this._resize();
    window.addEventListener("resize", () => this._resize());

    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);

    this._undoStack = [];
    this._redoStack = [];
  }

  _setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x554a3a, 0.4);
    this.scene.add(hemi);
    // soft fill
    const fill = new THREE.DirectionalLight(0xfff5e6, 0.25);
    fill.position.set(3, 4, -2);
    this.scene.add(fill);
  }

  on(event, fn) {
    (this._listeners[event] ||= []).push(fn);
  }
  _emit(event, ...args) {
    (this._listeners[event] || []).forEach((fn) => fn(...args));
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height, false);
    this.camera.aspect = rect.width / Math.max(1, rect.height);
    this.camera.updateProjectionMatrix();
  }

  _tick() {
    this.controls.update();
    if (this.selection) {
      this._selectionBox.update();
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._tick);
  }

  // --- mode -----------------------------------------------------------------
  setMode(mode) {
    this._mode = mode;
    const { W, L } = this.room.size();
    if (mode === "top") {
      this.controls.enableRotate = false;
      this.camera.position.set(0, Math.max(W, L) * 1.2, 0.001);
      this.controls.target.set(0, 0, 0);
    } else {
      this.controls.enableRotate = true;
      this.camera.position.set(W * 0.9, 2.5, L * 0.7);
      this.controls.target.set(0, 1.0, 0);
    }
  }

  resetCamera() {
    const { W, L } = this.room.size();
    this.camera.position.set(W * 0.9, 2.5, L * 0.7);
    this.controls.target.set(0, 1.0, 0);
  }

  // --- furniture management -------------------------------------------------
  addFromCatalog(itemId, position, opts = {}) {
    const item = catalog.find((c) => c.id === itemId);
    if (!item) return null;
    const obj = buildFurniture(item);
    if (position) obj.position.copy(position);
    else this._placeNewObject(obj, item);
    if (opts.rotation != null) obj.rotation.y = opts.rotation;
    this.objects.add(obj);
    this._pushUndo({ type: "add", id: obj.uuid });
    this.select(obj);
    this._emit("change");
    return obj;
  }

  _placeNewObject(obj, item) {
    const { W, L, H } = this.room.size();
    if (item.anchor === "wall") {
      // default: back wall, centered
      obj.position.set(0, item.wallY ?? 1.4, -L / 2 + item.size.d / 2 + 0.05);
    } else if (item.anchor === "ceiling") {
      obj.position.set(0, H - 0.05, 0);
    } else {
      // place near camera target
      const t = this.controls.target.clone();
      t.x = THREE.MathUtils.clamp(t.x, -W / 2 + 0.3, W / 2 - 0.3);
      t.z = THREE.MathUtils.clamp(t.z, -L / 2 + 0.3, L / 2 - 0.3);
      obj.position.set(t.x, 0, t.z);
    }
  }

  removeSelected() {
    if (!this.selection) return;
    const obj = this.selection;
    this.deselect();
    this.objects.remove(obj);
    this._pushUndo({ type: "remove", obj });
    this._emit("change");
  }

  duplicateSelected() {
    if (!this.selection) return;
    const obj = this.selection;
    const cloneItem = catalog.find((c) => c.id === obj.userData.catalogId);
    if (!cloneItem) return;
    const dup = buildFurniture(cloneItem, {
      w: obj.userData.size.w,
      h: obj.userData.size.h,
      d: obj.userData.size.d,
      color: obj.userData.color,
    });
    dup.position.copy(obj.position).add(new THREE.Vector3(0.4, 0, 0.4));
    dup.rotation.y = obj.rotation.y;
    this.objects.add(dup);
    this.select(dup);
    this._emit("change");
  }

  // --- selection ------------------------------------------------------------
  select(obj) {
    this.selection = obj;
    this._selectionBox.setFromObject(obj);
    this._selectionBox.visible = true;
    this._emit("select", obj);
  }

  deselect() {
    this.selection = null;
    this._selectionBox.visible = false;
    this._emit("select", null);
  }

  applySelectionEdit(patch) {
    if (!this.selection) return;
    const obj = this.selection;
    if (patch.x != null) obj.position.x = patch.x;
    if (patch.z != null) obj.position.z = patch.z;
    if (patch.y != null) obj.position.y = patch.y;
    if (patch.rotation != null) obj.rotation.y = patch.rotation;
    if (patch.color != null) {
      rebuildFurniture(obj, { color: patch.color });
    }
    if (patch.w != null || patch.d != null || patch.h != null) {
      rebuildFurniture(obj, {
        w: patch.w ?? obj.userData.size.w,
        d: patch.d ?? obj.userData.size.d,
        h: patch.h ?? obj.userData.size.h,
      });
    }
    this._selectionBox.setFromObject(obj);
    this._emit("change");
  }

  // --- input ----------------------------------------------------------------
  _addEvents() {
    const c = this.canvas;
    c.addEventListener("pointerdown", (e) => this._onPointerDown(e));
    c.addEventListener("pointermove", (e) => this._onPointerMove(e));
    c.addEventListener("pointerup", (e) => this._onPointerUp(e));
    c.addEventListener("contextmenu", (e) => e.preventDefault());

    window.addEventListener("keydown", (e) => this._onKey(e));
  }

  _setMouse(ev) {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    this.mouse.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
  }

  _hitTest() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.objects.children, true);
    if (!hits.length) return null;
    let o = hits[0].object;
    while (o && o.parent && o.parent !== this.objects) o = o.parent;
    return { obj: o, point: hits[0].point };
  }

  _onPointerDown(e) {
    if (e.button !== 0) return;
    this._setMouse(e);
    const hit = this._hitTest();
    if (hit) {
      this.select(hit.obj);
      this._dragging = true;
      this.controls.enabled = false;
      const o = hit.obj;
      // use a horizontal plane at the object's current Y
      this._dragPlane.set(new THREE.Vector3(0, 1, 0), -o.position.y);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const planePt = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this._dragPlane, planePt);
      this._dragOffset.subVectors(o.position, planePt);
      this.canvas.setPointerCapture?.(e.pointerId);
    } else {
      this.deselect();
    }
  }

  _onPointerMove(e) {
    if (!this._dragging || !this.selection) return;
    this._setMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const planePt = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this._dragPlane, planePt)) return;
    const target = planePt.add(this._dragOffset);
    const { W, L } = this.room.size();
    const half = this.selection.userData.size;
    const minX = -W / 2 + half.w / 2;
    const maxX = W / 2 - half.w / 2;
    const minZ = -L / 2 + half.d / 2;
    const maxZ = L / 2 - half.d / 2;
    this.selection.position.x = THREE.MathUtils.clamp(target.x, minX, maxX);
    this.selection.position.z = THREE.MathUtils.clamp(target.z, minZ, maxZ);
    this._selectionBox.setFromObject(this.selection);
    this._emit("transform", this.selection);
  }

  _onPointerUp(e) {
    if (this._dragging) {
      this._dragging = false;
      this.controls.enabled = true;
      this.canvas.releasePointerCapture?.(e.pointerId);
      this._emit("change");
    }
  }

  _onKey(e) {
    const target = e.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA")) {
      return;
    }
    if (!this.selection) {
      if (e.key === "1") this._emit("requestMode", "3d");
      if (e.key === "2") this._emit("requestMode", "top");
      return;
    }
    const o = this.selection;
    const step = e.shiftKey ? 0.5 : 0.1;
    let handled = true;
    switch (e.key) {
      case "ArrowLeft": o.position.x -= step; break;
      case "ArrowRight": o.position.x += step; break;
      case "ArrowUp": o.position.z -= step; break;
      case "ArrowDown": o.position.z += step; break;
      case "r": o.rotation.y += Math.PI / 12; break;
      case "R": o.rotation.y -= Math.PI / 12; break;
      case "Delete":
      case "Backspace": this.removeSelected(); break;
      case "d":
      case "D":
        if (e.ctrlKey || e.metaKey) { e.preventDefault(); this.duplicateSelected(); }
        else handled = false;
        break;
      default: handled = false;
    }
    if (handled) {
      this._selectionBox.setFromObject(o);
      this._emit("transform", o);
      this._emit("change");
    }
  }

  // --- serialization --------------------------------------------------------
  serialize() {
    return {
      version: 1,
      room: { ...this.room.config },
      objects: this.objects.children.map((o) => ({
        catalogId: o.userData.catalogId,
        position: { x: o.position.x, y: o.position.y, z: o.position.z },
        rotation: o.rotation.y,
        size: { ...o.userData.size },
        color: o.userData.color,
      })),
    };
  }

  load(data) {
    if (!data || !data.objects) return;
    if (data.room) this.room.setConfig(data.room);
    // clear
    while (this.objects.children.length) {
      const c = this.objects.children.pop();
      c.traverse?.((x) => {
        if (x.geometry) x.geometry.dispose();
        if (x.material) {
          if (Array.isArray(x.material)) x.material.forEach((m) => m.dispose());
          else x.material.dispose();
        }
      });
    }
    this.deselect();
    for (const it of data.objects) {
      const item = catalog.find((c) => c.id === it.catalogId);
      if (!item) continue;
      const obj = buildFurniture(item, {
        w: it.size?.w, h: it.size?.h, d: it.size?.d, color: it.color,
      });
      obj.position.set(it.position.x, it.position.y, it.position.z);
      obj.rotation.y = it.rotation || 0;
      this.objects.add(obj);
    }
    this._emit("change");
  }

  _pushUndo(action) {
    this._undoStack.push(action);
    if (this._undoStack.length > 50) this._undoStack.shift();
    this._redoStack.length = 0;
  }
}
