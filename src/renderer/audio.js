// Web Audio engine: preloads a switch pack's samples once, then plays a
// one-shot voice per keydown/keyup with small pitch/gain jitter so repeats
// don't sound identical.

const CATEGORIES = ['GENERIC', 'SPACE', 'ENTER', 'BACKSPACE'];
const GENERIC_VARIANTS = ['R0', 'R1', 'R2', 'R3', 'R4'];
const PITCH_JITTER = 0.03; // +/- 3%
const GAIN_JITTER_DB = 1.5; // +/- 1.5dB

const audioContext = new AudioContext({ latencyHint: 'interactive' });
const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);

let state = { enabled: true, volume: 0.8, packUrl: null };
let press = {}; // category -> AudioBuffer[]
let release = {}; // category -> AudioBuffer[]
const roundRobin = {};

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) return null;
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

async function loadPack(packUrl) {
  const nextPress = {};
  const nextRelease = {};

  const genericPress = (
    await Promise.all(GENERIC_VARIANTS.map((v) => fetchBuffer(`${packUrl}/press/GENERIC_${v}.mp3`)))
  ).filter(Boolean);
  nextPress.GENERIC = genericPress;

  const genericReleaseBuf = await fetchBuffer(`${packUrl}/release/GENERIC.mp3`);
  nextRelease.GENERIC = genericReleaseBuf ? [genericReleaseBuf] : [];

  for (const category of CATEGORIES) {
    if (category === 'GENERIC') continue;
    const pressBuf = await fetchBuffer(`${packUrl}/press/${category}.mp3`);
    nextPress[category] = pressBuf ? [pressBuf] : nextPress.GENERIC;

    const releaseBuf = await fetchBuffer(`${packUrl}/release/${category}.mp3`);
    nextRelease[category] = releaseBuf ? [releaseBuf] : nextRelease.GENERIC;
  }

  press = nextPress;
  release = nextRelease;
  console.log('Pack loaded: ' + packUrl);
}

function pickBuffer(bank, category) {
  const buffers = bank[category];
  if (!buffers || buffers.length === 0) return null;
  const i = (roundRobin[category] || 0) % buffers.length;
  roundRobin[category] = i + 1;
  return buffers[i];
}

function play(bank, category) {
  const buffer = pickBuffer(bank, category);
  if (!buffer) return;

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = 1 + (Math.random() * 2 - 1) * PITCH_JITTER;

  const gain = audioContext.createGain();
  const jitterDb = (Math.random() * 2 - 1) * GAIN_JITTER_DB;
  gain.gain.value = Math.pow(10, jitterDb / 20);

  source.connect(gain);
  gain.connect(masterGain);
  source.start(0);
}

window.actuate.onSettingsChanged((next) => {
  const packChanged = next.packUrl && next.packUrl !== state.packUrl;
  state = { ...state, ...next };
  masterGain.gain.value = state.volume;
  if (packChanged) loadPack(state.packUrl);
});

window.actuate.onKeyEvent((event) => {
  if (!state.enabled) return;
  const bank = event.type === 'down' ? press : release;
  play(bank, event.category);
});
