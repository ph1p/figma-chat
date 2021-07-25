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
export const generateString = (length: number = 40): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return text;
};
