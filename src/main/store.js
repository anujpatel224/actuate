const fs = require('fs');
const path = require('path');

const DEFAULTS = {
  enabled: true,
  pack: 'mxbrown',
  volume: 0.8,
  launchAtLogin: false,
};

class Store {
  constructor(userDataPath) {
    this.filePath = path.join(userDataPath, 'settings.json');
    this.data = this._load();
  }

  _load() {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  _save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  get all() {
    return { ...this.data };
  }

  set(patch) {
    this.data = { ...this.data, ...patch };
    this._save();
    return this.all;
  }
}

module.exports = { Store, DEFAULTS };
