const enabledEl = document.getElementById('enabled');
const packEl = document.getElementById('pack');
const volumeEl = document.getElementById('volume');
const launchAtLoginEl = document.getElementById('launchAtLogin');

function applyToForm(settings) {
  enabledEl.checked = settings.enabled;
  volumeEl.value = settings.volume;
  launchAtLoginEl.checked = settings.launchAtLogin;
  if (packEl.value !== settings.pack) packEl.value = settings.pack;
}

window.actuateSettings.get().then((settings) => {
  packEl.innerHTML = settings.packs
    .map((p) => `<option value="${p.id}">${p.caption}</option>`)
    .join('');
  applyToForm(settings);
});

window.actuateSettings.onChanged(applyToForm);

enabledEl.addEventListener('change', () => {
  window.actuateSettings.set({ enabled: enabledEl.checked });
});

packEl.addEventListener('change', () => {
  window.actuateSettings.set({ pack: packEl.value });
});

volumeEl.addEventListener('input', () => {
  window.actuateSettings.set({ volume: parseFloat(volumeEl.value) });
});

launchAtLoginEl.addEventListener('change', () => {
  window.actuateSettings.set({ launchAtLogin: launchAtLoginEl.checked });
});
