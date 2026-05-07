// Style presets — applying a style updates wall colour, floor texture and
// recolours existing furniture by category. Each style also exposes a
// shopping query that drives the per-style shop links.
//
// `palette` keys correspond to roles a furniture catalog entry maps to
// (see `roleFor` below):
//   sofa, armchair, darkWood, lightWood, curtain, accent, mirror
//
// `suggestions` lists catalog ids the UI may offer to add to round out the
// style (kept conservative — applying a style never adds furniture
// automatically).

export const styles = [
  {
    id: "current",
    name: "Aktualny",
    icon: "🏠",
    desc: "Twój salon — biel, jodełka, ciemny mahoń, akcenty żółto-zielone.",
    walls: "#f5f1ea",
    floor: "herringbone",
    palette: {
      sofa: "#ece4d4",
      armchair: "#e3d6b8",
      darkWood: "#3a2410",
      lightWood: "#b8965c",
      curtain: "#c2a884",
      accent: "#e2b53d",
      mirror: "#3a2a1a",
    },
    suggestions: ["sailboat", "easel"],
    shop: "salon klasyczny meble drewniane mahoń",
  },
  {
    id: "scandinavian",
    name: "Skandynawski",
    icon: "❄️",
    desc: "Jasne ściany, jasne drewno, biele i szałwiowe akcenty.",
    walls: "#fafaf6",
    floor: "planks",
    palette: {
      sofa: "#efeae1",
      armchair: "#d0cdc2",
      darkWood: "#a98a5a",
      lightWood: "#d4b885",
      curtain: "#f0ece4",
      accent: "#9bb0a5",
      mirror: "#d4b885",
    },
    suggestions: ["plant", "rug", "shelf"],
    shop: "skandynawski salon jasny minimalistyczny",
  },
  {
    id: "glamour",
    name: "Glamour",
    icon: "✨",
    desc: "Ciemne ściany, welurowe meble, złote akcenty, lustro w bogatej ramie.",
    walls: "#2c3e50",
    floor: "carpet",
    palette: {
      sofa: "#e6c87e",
      armchair: "#3d5a78",
      darkWood: "#1a1208",
      lightWood: "#c8a050",
      curtain: "#1a2030",
      accent: "#c8a050",
      mirror: "#c8a050",
    },
    suggestions: ["mirror-round", "art-abstract"],
    shop: "glamour welur złoty salon",
  },
  {
    id: "boho",
    name: "Boho",
    icon: "🌿",
    desc: "Ciepłe terakoty, wzorzysty dywan, makrama, dużo zieleni.",
    walls: "#e8c8a8",
    floor: "herringbone",
    palette: {
      sofa: "#d8b598",
      armchair: "#a86b3c",
      darkWood: "#5a3a20",
      lightWood: "#b8865a",
      curtain: "#d6a878",
      accent: "#9c5028",
      mirror: "#b8865a",
    },
    suggestions: ["plant", "plant-small", "rug-large"],
    shop: "boho salon terakota makrama",
  },
  {
    id: "industrial",
    name: "Industrialny",
    icon: "🏭",
    desc: "Beton, surowe drewno, czarna stal, miedziane akcenty.",
    walls: "#a8a098",
    floor: "tile",
    palette: {
      sofa: "#5a6068",
      armchair: "#6a4030",
      darkWood: "#2a2018",
      lightWood: "#8a6a4a",
      curtain: "#4a4a4a",
      accent: "#a86040",
      mirror: "#2a2018",
    },
    suggestions: ["shelf", "desk"],
    shop: "industrialny loft salon",
  },
  {
    id: "classic",
    name: "Klasyczny",
    icon: "👑",
    desc: "Beżowe ściany, mahoń, eleganckie tkaniny, klasyczne formy.",
    walls: "#ebe2cc",
    floor: "herringbone",
    palette: {
      sofa: "#d8c8a8",
      armchair: "#8a4a30",
      darkWood: "#3a1810",
      lightWood: "#a06848",
      curtain: "#a8855e",
      accent: "#8a4a30",
      mirror: "#a06848",
    },
    suggestions: ["cabinet-glass", "chair"],
    shop: "klasyczny salon mahoń elegancki",
  },
  {
    id: "minimalist",
    name: "Minimalistyczny",
    icon: "⬜",
    desc: "Biel, szarość, proste linie, ascetyczna paleta.",
    walls: "#f7f7f6",
    floor: "planks",
    palette: {
      sofa: "#e8e8e6",
      armchair: "#c8c8c6",
      darkWood: "#2a2828",
      lightWood: "#a8a8a6",
      curtain: "#e8e8e6",
      accent: "#888887",
      mirror: "#2a2828",
    },
    suggestions: [],
    shop: "minimalistyczny salon biały szary",
  },
  {
    id: "marine",
    name: "Marynistyczny",
    icon: "⛵",
    desc: "Granat, biel, naturalne drewno, mosiężne lampy, akcenty żaglowe.",
    walls: "#f0f4f7",
    floor: "planks",
    palette: {
      sofa: "#f0f0ec",
      armchair: "#1a3050",
      darkWood: "#3a2a1a",
      lightWood: "#c8a878",
      curtain: "#1a2540",
      accent: "#1a3050",
      mirror: "#c8a878",
    },
    suggestions: ["sailboat"],
    shop: "marynistyczny salon granat drewno",
  },
];

// Map a catalog item to a palette role.
export function roleFor(item) {
  if (!item) return null;
  const id = item.catalogId || item.id;
  const cat = item.category;
  if (id?.startsWith("sofa")) return "sofa";
  if (id?.startsWith("armchair") || id === "chair" || id === "pouf") return "armchair";
  if (id === "curtain") return "curtain";
  if (id?.startsWith("mirror")) return "mirror";
  if (id?.startsWith("rug")) return "accent";
  if (id?.startsWith("art") || id === "picture") return "accent";
  if (id === "plant" || id === "plant-small") return null; // keep green
  if (id === "tv-55" || id === "tv-65" || id === "ac" || id === "radiator") return null; // keep tech colours
  if (cat === "Przechowywanie" || cat === "Stoły") return "darkWood";
  if (cat === "Oświetlenie") return "accent";
  if (cat === "Dekoracje") return "lightWood";
  return null;
}

export function styleById(id) {
  return styles.find((s) => s.id === id);
}
