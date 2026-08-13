const { UiohookKey } = require('uiohook-napi');

const CATEGORY_BY_KEYCODE = {
  [UiohookKey.Space]: 'SPACE',
  [UiohookKey.Enter]: 'ENTER',
  [UiohookKey.NumpadEnter]: 'ENTER',
  [UiohookKey.Backspace]: 'BACKSPACE',
};

function categoryFor(keycode) {
  return CATEGORY_BY_KEYCODE[keycode] || 'GENERIC';
}

const KEY_NAMES = Object.entries(UiohookKey).reduce((map, [name, code]) => {
  if (!(code in map)) map[code] = name;
  return map;
}, {});

function nameFor(keycode) {
  return KEY_NAMES[keycode] || 'unknown';
}

module.exports = { categoryFor, nameFor };
