export const sendMainMessage = (action, payload = {}) => {
  parent.postMessage(
    {
      pluginMessage: {
        action,
        payload: JSON.parse(JSON.stringify(payload)),
      },
    },
    '*'
  );
};
