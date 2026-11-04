// Decides whether the heavy visual effects should run. Anyone who asks for less motion,
// is saving data, or is on a very small device gets the calm static page instead.
export function canRunImmersive({ reducedMotion = false, saveData = false, deviceMemory, cores } = {}) {
  if (reducedMotion || saveData) return false;
  if (typeof deviceMemory === 'number' && deviceMemory <= 2) return false;
  if (typeof cores === 'number' && cores <= 2) return false;
  return true;
}

export function readEnvironment() {
  if (typeof window === 'undefined') return { reducedMotion: true };
  const nav = window.navigator || {};
  return {
    reducedMotion: Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
    saveData: Boolean(nav.connection && nav.connection.saveData),
    deviceMemory: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
  };
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch { return false; }
}
