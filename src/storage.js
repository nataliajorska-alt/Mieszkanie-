const KEY = "mieszkanie3d.layout.v1";
const KEY_AUTOSAVE = "mieszkanie3d.autosave.v1";

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn("save failed", e);
    return false;
  }
}

export function load() {
  try {
    const v = localStorage.getItem(KEY);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
}

export function autosave(state) {
  try { localStorage.setItem(KEY_AUTOSAVE, JSON.stringify(state)); } catch {}
}

export function loadAutosave() {
  try {
    const v = localStorage.getItem(KEY_AUTOSAVE);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
