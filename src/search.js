// Polish furniture/home shops + general image search.
// Each entry: { id, label, color, url(query) }.
export const shops = [
  { id: "ikea",     label: "IKEA",         color: "#0058a3",
    url: (q) => `https://www.ikea.com/pl/pl/search/?q=${encodeURIComponent(q)}` },
  { id: "allegro",  label: "Allegro",      color: "#ff5a00",
    url: (q) => `https://allegro.pl/listing?string=${encodeURIComponent(q)}` },
  { id: "agata",    label: "Agata Meble",  color: "#e30613",
    url: (q) => `https://www.agatameble.pl/szukaj?q=${encodeURIComponent(q)}` },
  { id: "brw",      label: "Black Red White", color: "#111",
    url: (q) => `https://www.brw.pl/wyszukiwarka?text=${encodeURIComponent(q)}` },
  { id: "vox",      label: "VOX",          color: "#9bbb59",
    url: (q) => `https://meble.vox.pl/szukaj?q=${encodeURIComponent(q)}` },
  { id: "jysk",     label: "JYSK",         color: "#003d7a",
    url: (q) => `https://jysk.pl/search?q=${encodeURIComponent(q)}` },
  { id: "westwing", label: "Westwing",     color: "#cba36b",
    url: (q) => `https://www.westwing.pl/search/?q=${encodeURIComponent(q)}` },
  { id: "leroy",    label: "Leroy Merlin", color: "#78b833",
    url: (q) => `https://www.leroymerlin.pl/search.html?search=${encodeURIComponent(q)}` },
  { id: "google",   label: "Google",       color: "#4285f4",
    url: (q) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}` },
  { id: "pinterest",label: "Pinterest",    color: "#e60023",
    url: (q) => `https://pl.pinterest.com/search/pins/?q=${encodeURIComponent(q)}` },
];

export function shopLink(shop, query) {
  return { ...shop, href: shop.url(query) };
}
