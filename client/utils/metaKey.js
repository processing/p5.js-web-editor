const metaKey = (() => {
  if (navigator != null && navigator.platform != null) {
    return /^MAC/i.test(navigator.platform) ?
      'Cmd' :
      'Ctrl';
  }

  return 'Ctrl';
})();

const metaKeyName = metaKey === 'Cmd' ? 'Command' : 'Control';

export {
  metaKey,
  metaKeyName,
};
