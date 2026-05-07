// Default arrangement matching the user's living room photos:
// - small Warsaw flat
// - large window on the left (long wall), kitchen door on far +Z right
// - white sofa facing the window, armchair to the left, coffee table between
// - dark glass cabinet on right wall, TV on back wall, sailboat decoration
// Coordinate system: X is room width, Z is room length, Y is up.
export const defaultLayout = {
  version: 1,
  room: {
    width: 3.6,
    length: 5.2,
    height: 2.6,
    wallColor: "#f5f1ea",
    floorStyle: "herringbone",
  },
  objects: [
    // sofa centered, parallel to long axis, facing the window (-X)
    {
      catalogId: "sofa-3",
      position: { x: 0.55, y: 0, z: 0.4 },
      rotation: -Math.PI / 2,
      size: { w: 2.1, d: 0.92, h: 0.85 },
      color: "#ece4d4",
    },
    // armchair near the back wall (TV side)
    {
      catalogId: "armchair-vintage",
      position: { x: 0.4, y: 0, z: -1.7 },
      rotation: -Math.PI / 2,
      size: { w: 0.7, d: 0.78, h: 0.92 },
      color: "#e3d6b8",
    },
    // dark coffee table in front of sofa
    {
      catalogId: "coffee-square",
      position: { x: -0.55, y: 0, z: 0.2 },
      rotation: 0,
      size: { w: 0.95, d: 0.6, h: 0.45 },
      color: "#3a2010",
    },
    // glass cabinet on right wall
    {
      catalogId: "cabinet-glass",
      position: { x: 1.55, y: 0, z: 0.6 },
      rotation: -Math.PI / 2,
      size: { w: 0.95, d: 0.4, h: 1.85 },
      color: "#3a2410",
    },
    // TV on back wall
    {
      catalogId: "tv-55",
      position: { x: 0, y: 1.4, z: -2.54 },
      rotation: 0,
      size: { w: 1.24, d: 0.06, h: 0.72 },
      color: "#1a1a1a",
    },
    // AC unit on right wall, high
    {
      catalogId: "ac",
      position: { x: 1.66, y: 2.2, z: -1.5 },
      rotation: -Math.PI / 2,
      size: { w: 0.85, d: 0.22, h: 0.32 },
      color: "#fafafa",
    },
    // ceiling lamp
    {
      catalogId: "lamp-ceiling",
      position: { x: 0, y: 2.6, z: 0 },
      rotation: 0,
      size: { w: 0.4, d: 0.4, h: 0.5 },
      color: "#f3e0a8",
    },
    // floor lamp by bedroom doorway
    {
      catalogId: "lamp-floor",
      position: { x: -1.5, y: 0, z: -2.2 },
      rotation: 0,
      size: { w: 0.4, d: 0.4, h: 1.55 },
      color: "#f3e0a8",
    },
    // sailboat decoration leaning against right wall
    {
      catalogId: "sailboat",
      position: { x: 1.5, y: 0, z: 1.5 },
      rotation: -Math.PI / 2,
      size: { w: 0.7, d: 0.2, h: 1.0 },
      color: "#f0ead6",
    },
    // easel
    {
      catalogId: "easel",
      position: { x: 1.3, y: 0, z: 2.0 },
      rotation: -Math.PI / 4,
      size: { w: 0.5, d: 0.4, h: 1.5 },
      color: "#b8965c",
    },
    // plant near doorway
    {
      catalogId: "plant",
      position: { x: 0.6, y: 0, z: 2.1 },
      rotation: 0,
      size: { w: 0.5, d: 0.5, h: 1.2 },
      color: "#3e6b3a",
    },
    // curtains on window (left wall)
    {
      catalogId: "curtain",
      position: { x: -1.7, y: 0, z: 0 },
      rotation: Math.PI / 2,
      size: { w: 2.4, d: 0.1, h: 2.4 },
      color: "#c2a884",
    },
    // radiator under window
    {
      catalogId: "radiator",
      position: { x: -1.72, y: 0, z: 0 },
      rotation: Math.PI / 2,
      size: { w: 0.9, d: 0.08, h: 0.6 },
      color: "#dcdcdc",
    },
  ],
};
