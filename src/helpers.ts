export const sendMainMessage = (action, options = {}) =>
  parent.postMessage(
    {
      pluginMessage: {
        action,
        options
      }
    },
    '*'
  );

export const colors = {
  '#18A0FB': 'blue',
  '#7B61FF': 'purple',
  '#FF00FF': 'hot-pink',
  '#1BC47D': 'green',
  '#F24822': 'red',
  '#FFEB00': 'yellow'
};
