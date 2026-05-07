import * as THREE from "three";

const FLOOR_PRESETS = {
  herringbone: { base: "#b07a44", grout: "#7a4f29", style: "herringbone" },
  planks: { base: "#a87148", grout: "#6e4525", style: "planks" },
  tile: { base: "#dcd6cb", grout: "#a8a094", style: "tile" },
  carpet: { base: "#c9bfa4", grout: "#c9bfa4", style: "solid" },
};

function createFloorTexture(style, w, d) {
  const preset = FLOOR_PRESETS[style] || FLOOR_PRESETS.herringbone;
  const px = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = preset.base;
  ctx.fillRect(0, 0, px, px);

  if (preset.style === "herringbone") {
    drawHerringbone(ctx, px, preset);
  } else if (preset.style === "planks") {
    drawPlanks(ctx, px, preset);
  } else if (preset.style === "tile") {
    drawTiles(ctx, px, preset);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  // repeat so each meter is roughly one tile pattern
  const repeats = Math.max(1, Math.round(Math.max(w, d) / 2));
  tex.repeat.set(repeats, repeats);
  tex.anisotropy = 8;
  return tex;
}

function drawHerringbone(ctx, px, preset) {
  const plankLen = px / 6;
  const plankW = plankLen / 4.5;
  ctx.save();
  ctx.translate(px / 2, px / 2);
  ctx.rotate(Math.PI / 4);
  for (let y = -px; y < px; y += plankW) {
    for (let x = -px; x < px; x += plankLen + plankW) {
      const offset = ((y / plankW) % 2 === 0) ? 0 : plankLen / 2;
      const grad = ctx.createLinearGradient(0, y, 0, y + plankW);
      const v = 0.85 + Math.random() * 0.3;
      grad.addColorStop(0, shade(preset.base, v));
      grad.addColorStop(1, shade(preset.base, v * 0.92));
      ctx.fillStyle = grad;
      ctx.fillRect(x + offset, y, plankLen, plankW);
      ctx.strokeStyle = preset.grout;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + offset, y, plankLen, plankW);
      // wood grain
      ctx.strokeStyle = "rgba(60,30,10,0.18)";
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        ctx.moveTo(x + offset, y + Math.random() * plankW);
        ctx.bezierCurveTo(
          x + offset + plankLen * 0.3, y + Math.random() * plankW,
          x + offset + plankLen * 0.7, y + Math.random() * plankW,
          x + offset + plankLen, y + Math.random() * plankW
        );
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawPlanks(ctx, px, preset) {
  const plankH = px / 12;
  for (let y = 0; y < px; y += plankH) {
    const offset = ((y / plankH) % 2 === 0) ? 0 : px / 4;
    for (let x = -px; x < px; x += px / 3) {
      const v = 0.85 + Math.random() * 0.25;
      ctx.fillStyle = shade(preset.base, v);
      ctx.fillRect(x + offset, y, px / 3, plankH);
      ctx.strokeStyle = preset.grout;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + offset, y, px / 3, plankH);
    }
  }
}

function drawTiles(ctx, px, preset) {
  const t = px / 8;
  for (let y = 0; y < px; y += t) {
    for (let x = 0; x < px; x += t) {
      const v = 0.92 + Math.random() * 0.16;
      ctx.fillStyle = shade(preset.base, v);
      ctx.fillRect(x, y, t, t);
      ctx.strokeStyle = preset.grout;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, t, t);
    }
  }
}

function shade(hex, v) {
  const c = new THREE.Color(hex);
  c.r = Math.min(1, c.r * v);
  c.g = Math.min(1, c.g * v);
  c.b = Math.min(1, c.b * v);
  return "#" + c.getHexString();
}

export class Room {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "room";
    this.scene.add(this.group);
    this.config = {
      width: 3.6,    // X axis
      length: 5.2,   // Z axis
      height: 2.6,
      wallColor: "#f5f1ea",
      floorStyle: "herringbone",
    };
    this._floorTex = null;
    this.build();
  }

  setConfig(partial) {
    Object.assign(this.config, partial);
    this.build();
  }

  build() {
    // dispose previous
    while (this.group.children.length) {
      const c = this.group.children.pop();
      c.traverse?.((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
    }
    if (this._floorTex) this._floorTex.dispose();

    const { width: W, length: L, height: H, wallColor, floorStyle } = this.config;

    // floor
    this._floorTex = createFloorTexture(floorStyle, W, L);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this._floorTex,
      roughness: 0.75,
      metalness: 0.0,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.name = "floor";
    floor.userData.role = "floor";
    this.group.add(floor);

    // ceiling
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(W, L),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, side: THREE.BackSide })
    );
    ceil.rotation.x = -Math.PI / 2;
    ceil.position.y = H;
    ceil.receiveShadow = true;
    this.group.add(ceil);

    // walls — back / left / right (front-left wall is split for window opening, no front-right wall so the room feels open)
    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.95, side: THREE.DoubleSide });
    const wallThick = 0.06;

    // back wall (-Z)
    const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, wallThick), wallMat);
    back.position.set(0, H / 2, -L / 2);
    back.userData.role = "wall";
    back.userData.normal = new THREE.Vector3(0, 0, 1);
    back.receiveShadow = true;
    this.group.add(back);

    // front wall (+Z) — kitchen opening on the right side
    const openingW = Math.min(1.0, W * 0.32);
    const frontLeftW = W - openingW;
    const front = new THREE.Mesh(new THREE.BoxGeometry(frontLeftW, H, wallThick), wallMat);
    front.position.set(-openingW / 2, H / 2, L / 2);
    front.userData.role = "wall";
    front.userData.normal = new THREE.Vector3(0, 0, -1);
    front.receiveShadow = true;
    this.group.add(front);

    // door frame around the kitchen opening
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(openingW + 0.08, 0.06, wallThick + 0.04), frameMat);
    frameTop.position.set(W / 2 - openingW / 2, H * 0.82, L / 2);
    this.group.add(frameTop);

    // left wall (-X) with window
    this._buildLeftWallWithWindow(W, L, H, wallMat, wallThick);

    // right wall (+X)
    const right = new THREE.Mesh(new THREE.BoxGeometry(wallThick, H, L), wallMat);
    right.position.set(W / 2, H / 2, 0);
    right.userData.role = "wall";
    right.userData.normal = new THREE.Vector3(-1, 0, 0);
    right.receiveShadow = true;
    this.group.add(right);

    // baseboards
    this._buildBaseboards(W, L);

    this._floorMesh = floor;
    this._size = { W, L, H };
  }

  _buildLeftWallWithWindow(W, L, H, wallMat, wallThick) {
    // Window centered on left wall: 1.8m wide x 1.4m high, sill at 0.9m
    const winW = Math.min(1.8, L * 0.5);
    const winH = 1.4;
    const sill = 0.9;

    const segFront = (L - winW) / 2; // along Z
    const segBack = (L - winW) / 2;

    // back segment (behind window, -Z half)
    const backSeg = new THREE.Mesh(new THREE.BoxGeometry(wallThick, H, segBack), wallMat);
    backSeg.position.set(-W / 2, H / 2, -L / 2 + segBack / 2);
    backSeg.userData.role = "wall";
    backSeg.userData.normal = new THREE.Vector3(1, 0, 0);
    this.group.add(backSeg);

    // front segment
    const frontSeg = new THREE.Mesh(new THREE.BoxGeometry(wallThick, H, segFront), wallMat);
    frontSeg.position.set(-W / 2, H / 2, L / 2 - segFront / 2);
    frontSeg.userData.role = "wall";
    frontSeg.userData.normal = new THREE.Vector3(1, 0, 0);
    this.group.add(frontSeg);

    // below window (sill area)
    const below = new THREE.Mesh(new THREE.BoxGeometry(wallThick, sill, winW), wallMat);
    below.position.set(-W / 2, sill / 2, 0);
    below.userData.role = "wall";
    below.userData.normal = new THREE.Vector3(1, 0, 0);
    this.group.add(below);

    // above window
    const aboveH = H - (sill + winH);
    if (aboveH > 0) {
      const above = new THREE.Mesh(new THREE.BoxGeometry(wallThick, aboveH, winW), wallMat);
      above.position.set(-W / 2, sill + winH + aboveH / 2, 0);
      above.userData.role = "wall";
      above.userData.normal = new THREE.Vector3(1, 0, 0);
      this.group.add(above);
    }

    // window frame (white) + glass
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.5 });
    const frameThick = 0.04;
    const fL = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH, frameThick), frameMat);
    fL.position.set(-W / 2 + 0.03, sill + winH / 2, -winW / 2 + 0.02);
    this.group.add(fL);
    const fR = fL.clone(); fR.position.z = winW / 2 - 0.02; this.group.add(fR);
    const fT = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, winW), frameMat);
    fT.position.set(-W / 2 + 0.03, sill + winH - 0.02, 0); this.group.add(fT);
    const fB = fT.clone(); fB.position.y = sill + 0.02; this.group.add(fB);
    // mullions (3 panes)
    for (let i = 1; i <= 2; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH - 0.08, 0.04), frameMat);
      m.position.set(-W / 2 + 0.03, sill + winH / 2, -winW / 2 + (i / 3) * winW);
      this.group.add(m);
    }
    const sillBoard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, winW + 0.16), frameMat);
    sillBoard.position.set(-W / 2 + 0.06, sill, 0);
    this.group.add(sillBoard);

    // glass with sky/tree gradient texture
    const skyTex = this._createSkyTexture();
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(winW - 0.06, winH - 0.06),
      new THREE.MeshStandardMaterial({
        map: skyTex,
        roughness: 0.05,
        metalness: 0.0,
        emissive: 0xffffff,
        emissiveMap: skyTex,
        emissiveIntensity: 0.3,
      })
    );
    glass.rotation.y = Math.PI / 2;
    glass.position.set(-W / 2 + 0.005, sill + winH / 2, 0);
    this.group.add(glass);

    // sun light through window
    const sun = new THREE.DirectionalLight(0xfff1d6, 0.9);
    sun.position.set(-W, sill + winH, 0);
    sun.target.position.set(W / 2, 0.5, 0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 12;
    const camSize = Math.max(W, L) * 0.8;
    sun.shadow.camera.left = -camSize;
    sun.shadow.camera.right = camSize;
    sun.shadow.camera.top = camSize;
    sun.shadow.camera.bottom = -camSize;
    sun.shadow.bias = -0.0008;
    this.group.add(sun);
    this.group.add(sun.target);
  }

  _createSkyTexture() {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 512;
    const ctx = c.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#f8d089");
    grad.addColorStop(0.45, "#f4b56b");
    grad.addColorStop(0.55, "#cdd9b8");
    grad.addColorStop(1, "#5e7a4a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    // suggestion of trees
    ctx.fillStyle = "rgba(60,90,50,0.6)";
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512;
      const y = 250 + Math.random() * 60;
      const r = 15 + Math.random() * 35;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // distant building silhouettes
    ctx.fillStyle = "rgba(120,110,100,0.45)";
    for (let i = 0; i < 6; i++) {
      const x = i * 80 + Math.random() * 30;
      const w = 60 + Math.random() * 40;
      const h = 40 + Math.random() * 50;
      ctx.fillRect(x, 280 - h * 0.4, w, h);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _buildBaseboards(W, L) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const h = 0.08, t = 0.015;
    const mk = (w, d) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    const back = mk(W, t);
    back.position.set(0, h / 2, -L / 2 + t / 2 + 0.001);
    this.group.add(back);
    const front = mk(W, t);
    front.position.set(0, h / 2, L / 2 - t / 2 - 0.001);
    this.group.add(front);
    const left = mk(t, L);
    left.position.set(-W / 2 + t / 2 + 0.001, h / 2, 0);
    this.group.add(left);
    const right = mk(t, L);
    right.position.set(W / 2 - t / 2 - 0.001, h / 2, 0);
    this.group.add(right);
  }

  size() { return this._size; }
  floorMesh() { return this._floorMesh; }
}
