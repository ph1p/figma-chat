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
  '#4F4F4F': 'gray',
  '#18A0FB': 'blue',
  '#56CCF2': 'lightblue',
  '#7B61FF': 'purple',
  '#1BC47D': 'green',
  '#6fcf97': 'lightgreen',
  '#F24822': 'red',
  '#F2994A': 'orange'
};

export const generateString = (length = 40) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
};
