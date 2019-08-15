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
