const path = require('path');
const { app } = require('electron');

const PACKS_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'sounds', 'packs')
  : path.join(__dirname, '..', '..', 'sounds', 'packs');

// caption text from the original kbsim project (MIT licensed, github.com/tplai/kbsim)
const PACKS = [
  { id: 'cream', caption: 'NovelKeys Creams' },
  { id: 'holypanda', caption: 'Holy Pandas' },
  { id: 'alpaca', caption: 'Alpacas' },
  { id: 'turquoise', caption: 'Turquoise Tealios' },
  { id: 'blackink', caption: 'Gateron Black Inks' },
  { id: 'redink', caption: 'Gateron Red Inks' },
  { id: 'mxblack', caption: 'Cherry MX Blacks' },
  { id: 'mxbrown', caption: 'Cherry MX Browns' },
  { id: 'mxblue', caption: 'Cherry MX Blues' },
  { id: 'boxnavy', caption: 'Kailh Box Navies' },
  { id: 'buckling', caption: 'Buckling Spring' },
  { id: 'bluealps', caption: 'SKCM Blue Alps' },
  { id: 'topre', caption: 'Topre' },
];

function packDir(id) {
  return path.join(PACKS_DIR, id);
}

module.exports = { PACKS, PACKS_DIR, packDir };
