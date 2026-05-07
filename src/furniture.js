import * as THREE from "three";

const TAU = Math.PI * 2;

function box(w, h, d, color, opts = {}) {
  const geom = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.8,
    metalness: opts.metalness ?? 0.05,
  });
  const m = new THREE.Mesh(geom, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cylinder(r, h, color, opts = {}) {
  const geom = new THREE.CylinderGeometry(r, r, h, opts.segments ?? 24);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.7,
    metalness: opts.metalness ?? 0.1,
  });
  const m = new THREE.Mesh(geom, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function legBlock(group, w, d, h, color, inset = 0.06) {
  const lw = 0.06, lh = h, ld = 0.06;
  const positions = [
    [+w / 2 - inset, lh / 2, +d / 2 - inset],
    [-w / 2 + inset, lh / 2, +d / 2 - inset],
    [+w / 2 - inset, lh / 2, -d / 2 + inset],
    [-w / 2 + inset, lh / 2, -d / 2 + inset],
  ];
  for (const [x, y, z] of positions) {
    const leg = box(lw, lh, ld, color, { roughness: 0.6, metalness: 0.4 });
    leg.position.set(x, y, z);
    group.add(leg);
  }
}

// --- builders ---------------------------------------------------------------

const builders = {
  sofa(g, p) {
    const { w, h, d, color } = p;
    const legH = 0.14;
    const baseH = h * 0.42;
    const seatH = 0.10;
    const armH = h * 0.78;
    const armW = 0.16;
    const backH = h - legH - 0.05;

    const base = box(w, baseH, d * 0.98, color);
    base.position.set(0, legH + baseH / 2, 0);
    g.add(base);

    const seat = box(w - armW * 2, seatH, d * 0.78, lighten(color, 0.05));
    seat.position.set(0, legH + baseH + seatH / 2, d * 0.05);
    g.add(seat);

    const back = box(w, backH, 0.18, color);
    back.position.set(0, legH + backH / 2 + 0.05, -d / 2 + 0.09);
    g.add(back);

    const armL = box(armW, armH, d * 0.92, color);
    armL.position.set(-w / 2 + armW / 2, legH + armH / 2, 0);
    g.add(armL);
    const armR = armL.clone();
    armR.position.x = w / 2 - armW / 2;
    g.add(armR);

    // legs (thin black)
    const legColor = "#1a1a1a";
    const legY = legH / 2;
    const lx = w / 2 - 0.08, lz = d / 2 - 0.10;
    for (const [x, z] of [[lx, lz], [-lx, lz], [lx, -lz], [-lx, -lz]]) {
      const leg = box(0.04, legH, 0.04, legColor, { roughness: 0.4, metalness: 0.7 });
      leg.position.set(x, legY, z);
      g.add(leg);
    }

    // pillows for character
    const pillowL = box(0.28, 0.28, 0.12, "#e2b53d", { roughness: 0.9 });
    pillowL.position.set(-w / 2 + 0.35, legH + baseH + seatH + 0.14, -d * 0.18);
    pillowL.rotation.z = 0.1;
    g.add(pillowL);
    const pillowR = box(0.28, 0.28, 0.12, "#1f5e4a", { roughness: 0.9 });
    pillowR.position.set(0.05, legH + baseH + seatH + 0.14, -d * 0.18);
    pillowR.rotation.z = -0.05;
    g.add(pillowR);
  },

  armchair(g, p) {
    const { w, h, d, color } = p;
    const legH = 0.12;
    const seatH = 0.10;
    const baseH = h * 0.45;
    const back = box(w * 0.88, h * 0.85, 0.14, color);
    back.position.set(0, legH + (h * 0.85) / 2, -d / 2 + 0.09);
    g.add(back);
    const base = box(w * 0.88, baseH, d * 0.85, color);
    base.position.set(0, legH + baseH / 2, 0);
    g.add(base);
    const seat = box(w * 0.78, seatH, d * 0.7, lighten(color, 0.06));
    seat.position.set(0, legH + baseH + seatH / 2, 0.02);
    g.add(seat);
    legBlock(g, w * 0.9, d * 0.9, legH, "#3a2a1a", 0.06);
  },

  coffeeTable(g, p) {
    const { w, h, d, color } = p;
    const top = box(w, 0.06, d, color, { roughness: 0.4, metalness: 0.1 });
    top.position.y = h - 0.03;
    g.add(top);
    const shelf = box(w * 0.86, 0.04, d * 0.86, color);
    shelf.position.y = h * 0.45;
    g.add(shelf);
    legBlock(g, w, d, h - 0.06, color, 0.05);
  },

  diningTable(g, p) {
    const { w, h, d, color } = p;
    const top = box(w, 0.05, d, color, { roughness: 0.35 });
    top.position.y = h - 0.025;
    g.add(top);
    legBlock(g, w, d, h - 0.05, color, 0.08);
  },

  chair(g, p) {
    const { w, h, d, color } = p;
    const seatY = 0.45;
    const seat = box(w, 0.05, d, color);
    seat.position.y = seatY;
    g.add(seat);
    const back = box(w, h - seatY, 0.04, color);
    back.position.set(0, seatY + (h - seatY) / 2, -d / 2 + 0.02);
    g.add(back);
    legBlock(g, w, d, seatY, "#2a1c10", 0.04);
  },

  cabinet(g, p) {
    const { w, h, d, color } = p;
    const body = box(w, h, d, color, { roughness: 0.5 });
    body.position.y = h / 2;
    g.add(body);
    // glass doors
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbfd8e0, transparent: true, opacity: 0.25,
      roughness: 0.05, metalness: 0, transmission: 0.8, thickness: 0.02,
    });
    const doorW = (w - 0.04) / 2;
    for (const sx of [-1, 1]) {
      const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, h * 0.92, 0.02), glassMat);
      door.position.set(sx * (doorW / 2 + 0.01), h / 2, d / 2 + 0.01);
      g.add(door);
    }
    // shelves visible behind glass
    for (let i = 1; i <= 3; i++) {
      const shelf = box(w - 0.06, 0.02, d - 0.08, lighten(color, 0.1));
      shelf.position.y = (i / 4) * h;
      g.add(shelf);
    }
    // crown moulding
    const crown = box(w + 0.06, 0.06, d + 0.06, lighten(color, -0.1));
    crown.position.y = h + 0.03;
    g.add(crown);
  },

  dresser(g, p) {
    const { w, h, d, color } = p;
    const body = box(w, h, d, color);
    body.position.y = h / 2;
    g.add(body);
    for (let i = 0; i < 3; i++) {
      const drawer = box(w * 0.92, h / 3 - 0.04, 0.02, lighten(color, 0.06));
      drawer.position.set(0, (i + 0.5) * (h / 3), d / 2 + 0.01);
      g.add(drawer);
      const knob = cylinder(0.015, 0.04, "#d4af72");
      knob.rotation.x = Math.PI / 2;
      knob.position.set(0, (i + 0.5) * (h / 3), d / 2 + 0.04);
      g.add(knob);
    }
  },

  shelf(g, p) {
    const { w, h, d, color } = p;
    const body = box(w, h, d, color);
    body.position.y = h / 2;
    g.add(body);
    const shelves = 4;
    for (let i = 1; i < shelves; i++) {
      const s = box(w - 0.04, 0.02, d - 0.04, lighten(color, 0.08));
      s.position.y = (i / shelves) * h;
      g.add(s);
    }
  },

  tv(g, p) {
    const { w, h, d, color } = p;
    const frame = box(w, h, d, "#0a0a0a", { roughness: 0.3, metalness: 0.6 });
    g.add(frame);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.96, h * 0.92),
      new THREE.MeshStandardMaterial({
        color: color || "#3a4a8a",
        emissive: color || "#243a72",
        emissiveIntensity: 0.6,
        roughness: 0.2,
      })
    );
    screen.position.z = d / 2 + 0.001;
    g.add(screen);
  },

  floorLamp(g, p) {
    const { h, color } = p;
    const base = cylinder(0.18, 0.04, "#222", { roughness: 0.4 });
    base.position.y = 0.02;
    g.add(base);
    const pole = cylinder(0.018, h - 0.4, "#3a3a3a", { roughness: 0.3, metalness: 0.6 });
    pole.position.y = (h - 0.4) / 2 + 0.04;
    g.add(pole);
    const shadeGeom = new THREE.ConeGeometry(0.22, 0.32, 24, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({
      color, side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.25,
      roughness: 0.9,
    });
    const shade = new THREE.Mesh(shadeGeom, shadeMat);
    shade.position.y = h - 0.16;
    shade.rotation.x = Math.PI;
    g.add(shade);
    const bulb = new THREE.PointLight(0xffd9a8, 0.5, 4, 2);
    bulb.position.y = h - 0.18;
    g.add(bulb);
  },

  ceilingLamp(g, p) {
    // origin = ceiling attachment point; lamp hangs DOWN
    const { color } = p;
    const cord = cylinder(0.005, 0.35, "#222");
    cord.position.y = -0.175;
    g.add(cord);
    const shade = cylinder(0.18, 0.18, color, { roughness: 0.7 });
    shade.position.y = -0.44;
    const shadeMat = shade.material;
    shadeMat.transparent = true;
    shadeMat.opacity = 0.55;
    g.add(shade);
    const bulb = new THREE.PointLight(0xfff0d6, 0.7, 6, 2);
    bulb.position.y = -0.5;
    g.add(bulb);
  },

  rug(g, p) {
    const { w, d, color } = p;
    const geom = new THREE.PlaneGeometry(w, d);
    const mat = new THREE.MeshStandardMaterial({
      color, roughness: 1, side: THREE.DoubleSide,
    });
    const rug = new THREE.Mesh(geom, mat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.y = 0.005;
    rug.receiveShadow = true;
    g.add(rug);
  },

  plant(g, p) {
    const { h, color } = p;
    const pot = cylinder(0.18, 0.22, "#8a6a4a", { roughness: 0.7 });
    pot.position.y = 0.11;
    g.add(pot);
    const trunk = cylinder(0.02, h * 0.4, "#5a3a1a");
    trunk.position.y = 0.22 + (h * 0.4) / 2;
    g.add(trunk);
    for (let i = 0; i < 5; i++) {
      const leafGeom = new THREE.SphereGeometry(0.22 + Math.random() * 0.12, 12, 10);
      const leaf = new THREE.Mesh(leafGeom, new THREE.MeshStandardMaterial({
        color, roughness: 0.9,
      }));
      leaf.position.set(
        (Math.random() - 0.5) * 0.4,
        h - 0.1 - Math.random() * 0.2,
        (Math.random() - 0.5) * 0.4
      );
      leaf.scale.y = 1 + Math.random() * 0.4;
      g.add(leaf);
    }
  },

  mirror(g, p) {
    const { w, h, d, color } = p;
    const frame = box(w, h, d, color, { roughness: 0.4, metalness: 0.4 });
    g.add(frame);
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.92, h * 0.94),
      new THREE.MeshPhysicalMaterial({
        color: 0xeaf2f7, roughness: 0.05, metalness: 0.9,
      })
    );
    glass.position.z = d / 2 + 0.001;
    g.add(glass);
    // small foot
    const foot = box(w * 0.6, 0.05, d * 1.6, "#2a1c10");
    foot.position.set(0, -h / 2 + 0.025, 0);
    g.add(foot);
  },

  picture(g, p) {
    const { w, h, d, color } = p;
    const frame = box(w, h, d, "#3a2a1a", { roughness: 0.5 });
    g.add(frame);
    const canvas = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.9, h * 0.9),
      new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
    );
    canvas.position.z = d / 2 + 0.001;
    g.add(canvas);
  },

  sailboat(g, p) {
    const { h, color } = p;
    const hull = box(0.7, 0.12, 0.18, "#3a2a1a");
    hull.position.y = 0.1;
    hull.rotation.z = 0.05;
    g.add(hull);
    const mast = cylinder(0.012, h * 0.9, "#5a3a1a");
    mast.position.set(0, 0.1 + (h * 0.9) / 2, 0);
    g.add(mast);
    // sail
    const sailGeom = new THREE.PlaneGeometry(0.5, h * 0.8);
    const sailMat = new THREE.MeshStandardMaterial({
      color, side: THREE.DoubleSide, roughness: 1,
    });
    const sail = new THREE.Mesh(sailGeom, sailMat);
    sail.position.set(0.16, 0.1 + (h * 0.85) / 2, 0);
    g.add(sail);
  },

  easel(g, p) {
    const { h, color } = p;
    const a = cylinder(0.018, h, color);
    a.position.set(-0.15, h / 2, 0.1);
    a.rotation.z = 0.1;
    g.add(a);
    const b = cylinder(0.018, h, color);
    b.position.set(0.15, h / 2, 0.1);
    b.rotation.z = -0.1;
    g.add(b);
    const c = cylinder(0.018, h * 0.9, color);
    c.position.set(0, h * 0.45, -0.18);
    g.add(c);
    const canvas = box(0.4, 0.5, 0.02, "#f5f1e8");
    canvas.position.set(0, h * 0.55, 0.05);
    g.add(canvas);
  },

  curtain(g, p) {
    const { w, h, color } = p;
    const folds = 8;
    for (let i = 0; i < folds; i++) {
      const t = i / (folds - 1);
      const x = (t - 0.5) * w;
      const fold = cylinder(0.04, h, color, { segments: 8, roughness: 1 });
      fold.position.set(x, h / 2, 0);
      fold.scale.x = 1.5;
      g.add(fold);
    }
    const rod = cylinder(0.012, w + 0.2, "#5a4a3a");
    rod.rotation.z = Math.PI / 2;
    rod.position.y = h + 0.04;
    g.add(rod);
  },

  radiator(g, p) {
    const { w, h, d, color } = p;
    const fins = 12;
    const fw = w / fins;
    for (let i = 0; i < fins; i++) {
      const fin = box(fw * 0.7, h, d, color, { roughness: 0.4, metalness: 0.3 });
      fin.position.set((i - (fins - 1) / 2) * fw, h / 2, 0);
      g.add(fin);
    }
  },

  ac(g, p) {
    const { w, h, d, color } = p;
    const body = box(w, h, d, color, { roughness: 0.4 });
    body.position.y = h / 2;
    g.add(body);
    const vent = box(w * 0.85, 0.04, d * 0.6, "#aaa");
    vent.position.set(0, 0.06, 0);
    g.add(vent);
  },

  bed(g, p) {
    const { w, h, d, color } = p;
    const frame = box(w, h * 0.4, d, color);
    frame.position.y = (h * 0.4) / 2;
    g.add(frame);
    const mattress = box(w * 0.96, h * 0.25, d * 0.96, lighten(color, 0.15));
    mattress.position.y = h * 0.4 + (h * 0.25) / 2;
    g.add(mattress);
    const head = box(w, h * 1.2, 0.1, color);
    head.position.set(0, h * 0.6, -d / 2 + 0.05);
    g.add(head);
    const pillow = box(w * 0.4, 0.1, 0.3, "#fff");
    pillow.position.set(-w * 0.22, h * 0.4 + h * 0.25 + 0.05, -d * 0.3);
    g.add(pillow);
    const pillow2 = pillow.clone();
    pillow2.position.x = w * 0.22;
    g.add(pillow2);
  },

  desk(g, p) {
    const { w, h, d, color } = p;
    const top = box(w, 0.04, d, color);
    top.position.y = h - 0.02;
    g.add(top);
    legBlock(g, w, d, h - 0.04, "#1a1a1a", 0.05);
  },

  pouf(g, p) {
    const { w, h, color } = p;
    const cyl = cylinder(w / 2, h, color, { roughness: 1 });
    cyl.position.y = h / 2;
    g.add(cyl);
  },

  bookshelf(g, p) {
    builders.shelf(g, p);
  },

  wardrobe(g, p) {
    const { w, h, d, color } = p;
    const body = box(w, h, d, color);
    body.position.y = h / 2;
    g.add(body);
    const seam = box(0.01, h * 0.94, 0.02, "#1a1a1a");
    seam.position.set(0, h / 2, d / 2 + 0.01);
    g.add(seam);
    const handleL = cylinder(0.01, 0.18, "#c8a877");
    handleL.position.set(-0.06, h / 2, d / 2 + 0.03);
    g.add(handleL);
    const handleR = handleL.clone();
    handleR.position.x = 0.06;
    g.add(handleR);
  },
};

function lighten(hex, amount) {
  const c = new THREE.Color(hex);
  c.r = clamp01(c.r + amount);
  c.g = clamp01(c.g + amount);
  c.b = clamp01(c.b + amount);
  return "#" + c.getHexString();
}
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// --- catalog ----------------------------------------------------------------

export const catalog = [
  // siedziska
  { id: "sofa-3", name: "Sofa 3-os.", category: "Siedziska", icon: "🛋️",
    size: { w: 2.1, d: 0.92, h: 0.85 }, color: "#ece4d4",
    search: "sofa 3 osobowa biała tapicerowana skandynawska", build: "sofa" },
  { id: "sofa-2", name: "Sofa 2-os.", category: "Siedziska", icon: "🛋️",
    size: { w: 1.6, d: 0.90, h: 0.85 }, color: "#ece4d4",
    search: "sofa 2 osobowa", build: "sofa" },
  { id: "armchair-vintage", name: "Fotel klasyczny", category: "Siedziska", icon: "💺",
    size: { w: 0.7, d: 0.78, h: 0.92 }, color: "#d8c8ad",
    search: "fotel klasyczny vintage tapicerowany", build: "armchair" },
  { id: "armchair-modern", name: "Fotel uszak", category: "Siedziska", icon: "💺",
    size: { w: 0.85, d: 0.85, h: 1.05 }, color: "#3f5a4a",
    search: "fotel uszak welurowy", build: "armchair" },
  { id: "chair", name: "Krzesło", category: "Siedziska", icon: "🪑",
    size: { w: 0.46, d: 0.5, h: 0.92 }, color: "#2a1c10",
    search: "krzesło tapicerowane do jadalni", build: "chair" },
  { id: "pouf", name: "Puf", category: "Siedziska", icon: "🟫",
    size: { w: 0.5, d: 0.5, h: 0.42 }, color: "#c2a36b",
    search: "puf okrągły", build: "pouf" },

  // stoły
  { id: "coffee-square", name: "Stolik kawowy", category: "Stoły", icon: "🪵",
    size: { w: 0.9, d: 0.6, h: 0.45 }, color: "#4a2a1a",
    search: "stolik kawowy drewniany ciemny", build: "coffeeTable" },
  { id: "coffee-round", name: "Stolik okrągły", category: "Stoły", icon: "⭕",
    size: { w: 0.7, d: 0.7, h: 0.45 }, color: "#5a3a1a",
    search: "stolik kawowy okrągły", build: "coffeeTable" },
  { id: "dining", name: "Stół jadalny", category: "Stoły", icon: "🍽️",
    size: { w: 1.6, d: 0.9, h: 0.76 }, color: "#3a2410",
    search: "stół jadalny rozkładany", build: "diningTable" },
  { id: "desk", name: "Biurko", category: "Stoły", icon: "💻",
    size: { w: 1.2, d: 0.6, h: 0.74 }, color: "#3a2a1a",
    search: "biurko proste minimalistyczne", build: "desk" },

  // przechowywanie
  { id: "cabinet-glass", name: "Witryna szklana", category: "Przechowywanie", icon: "🍷",
    size: { w: 0.95, d: 0.4, h: 1.85 }, color: "#3a2410",
    search: "witryna szklana drewniana antyczna", build: "cabinet" },
  { id: "dresser", name: "Komoda", category: "Przechowywanie", icon: "🗄️",
    size: { w: 1.2, d: 0.45, h: 0.85 }, color: "#3a2410",
    search: "komoda drewniana", build: "dresser" },
  { id: "shelf", name: "Regał", category: "Przechowywanie", icon: "📚",
    size: { w: 0.8, d: 0.35, h: 1.85 }, color: "#e7dfce",
    search: "regał na książki", build: "shelf" },
  { id: "wardrobe", name: "Szafa", category: "Przechowywanie", icon: "🚪",
    size: { w: 1.5, d: 0.6, h: 2.2 }, color: "#e7dfce",
    search: "szafa garderoba", build: "wardrobe" },

  // multimedia
  { id: "tv-55", name: 'Telewizor 55"', category: "Multimedia", icon: "📺",
    size: { w: 1.24, d: 0.06, h: 0.72 }, color: "#1a1a1a",
    search: "telewizor 55 cali 4k", build: "tv", anchor: "wall", wallY: 1.4 },
  { id: "tv-65", name: 'Telewizor 65"', category: "Multimedia", icon: "📺",
    size: { w: 1.46, d: 0.06, h: 0.84 }, color: "#1a1a1a",
    search: "telewizor 65 cali", build: "tv", anchor: "wall", wallY: 1.4 },
  { id: "ac", name: "Klimatyzator", category: "Multimedia", icon: "❄️",
    size: { w: 0.85, d: 0.22, h: 0.32 }, color: "#fafafa",
    search: "klimatyzator ścienny split", build: "ac", anchor: "wall", wallY: 2.2 },

  // oświetlenie
  { id: "lamp-floor", name: "Lampa podłogowa", category: "Oświetlenie", icon: "💡",
    size: { w: 0.4, d: 0.4, h: 1.55 }, color: "#f3e0a8",
    search: "lampa podłogowa stojąca", build: "floorLamp" },
  { id: "lamp-ceiling", name: "Lampa sufitowa", category: "Oświetlenie", icon: "🔆",
    size: { w: 0.4, d: 0.4, h: 0.5 }, color: "#f3e0a8",
    search: "lampa sufitowa nowoczesna", build: "ceilingLamp", anchor: "ceiling" },

  // dekoracje
  { id: "rug", name: "Dywan", category: "Dekoracje", icon: "🟦",
    size: { w: 2.0, d: 1.4, h: 0.01 }, color: "#a89b7c",
    search: "dywan salonowy beżowy", build: "rug" },
  { id: "rug-large", name: "Dywan duży", category: "Dekoracje", icon: "🟦",
    size: { w: 2.6, d: 1.7, h: 0.01 }, color: "#7a8896",
    search: "dywan duży orientalny", build: "rug" },
  { id: "plant", name: "Roślina", category: "Dekoracje", icon: "🪴",
    size: { w: 0.5, d: 0.5, h: 1.2 }, color: "#3e6b3a",
    search: "roślina doniczkowa monstera", build: "plant" },
  { id: "plant-small", name: "Mała roślina", category: "Dekoracje", icon: "🌱",
    size: { w: 0.3, d: 0.3, h: 0.5 }, color: "#406b3a",
    search: "kwiatek doniczkowy", build: "plant" },
  { id: "mirror", name: "Lustro stojące", category: "Dekoracje", icon: "🪞",
    size: { w: 0.6, d: 0.05, h: 1.6 }, color: "#3a2a1a",
    search: "lustro stojące w ramie", build: "mirror" },
  { id: "picture", name: "Obraz", category: "Dekoracje", icon: "🖼️",
    size: { w: 0.7, d: 0.04, h: 0.5 }, color: "#9aa6b8",
    search: "obraz na ścianę plakat", build: "picture", anchor: "wall", wallY: 1.5 },
  { id: "sailboat", name: "Model żaglówki", category: "Dekoracje", icon: "⛵",
    size: { w: 0.7, d: 0.2, h: 1.0 }, color: "#f0ead6",
    search: "model żaglowca dekoracyjny", build: "sailboat" },
  { id: "easel", name: "Sztaluga", category: "Dekoracje", icon: "🎨",
    size: { w: 0.5, d: 0.4, h: 1.5 }, color: "#b8965c",
    search: "sztaluga drewniana malarska", build: "easel" },

  // tekstylia
  { id: "curtain", name: "Zasłony", category: "Tekstylia", icon: "🪟",
    size: { w: 2.4, d: 0.1, h: 2.4 }, color: "#c2a884",
    search: "zasłony dekoracyjne beżowe", build: "curtain" },
  { id: "radiator", name: "Grzejnik", category: "Tekstylia", icon: "♨️",
    size: { w: 0.9, d: 0.08, h: 0.6 }, color: "#dcdcdc",
    search: "grzejnik panelowy", build: "radiator" },

  // sypialnia
  { id: "bed", name: "Łóżko 160", category: "Sypialnia", icon: "🛏️",
    size: { w: 1.6, d: 2.0, h: 0.55 }, color: "#5a4a3a",
    search: "łóżko 160 z zagłówkiem", build: "bed" },
];

export function buildFurniture(item, overrides = {}) {
  const params = {
    w: overrides.w ?? item.size.w,
    h: overrides.h ?? item.size.h,
    d: overrides.d ?? item.size.d,
    color: overrides.color ?? item.color,
  };
  const group = new THREE.Group();
  const fn = builders[item.build];
  if (fn) fn(group, params);
  group.userData = {
    type: "furniture",
    catalogId: item.id,
    name: item.name,
    category: item.category,
    search: item.search,
    anchor: item.anchor || "floor",
    wallY: item.wallY,
    color: params.color,
    size: { w: params.w, h: params.h, d: params.d },
    baseSize: { ...item.size },
  };
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return group;
}

export function rebuildFurniture(group, overrides = {}) {
  // dispose existing children
  for (let i = group.children.length - 1; i >= 0; i--) {
    const c = group.children[i];
    group.remove(c);
    c.traverse?.((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
  }
  const itemId = group.userData.catalogId;
  const item = catalog.find((c) => c.id === itemId);
  if (!item) return;
  const params = {
    w: overrides.w ?? group.userData.size.w,
    h: overrides.h ?? group.userData.size.h,
    d: overrides.d ?? group.userData.size.d,
    color: overrides.color ?? group.userData.color,
  };
  const fn = builders[item.build];
  if (fn) fn(group, params);
  group.userData.size = { w: params.w, h: params.h, d: params.d };
  group.userData.color = params.color;
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
}

export const categories = Array.from(new Set(catalog.map((c) => c.category)));
