import uniqid from 'uniqid';
import { generateString } from './utils';

figma.showUI(__html__, {
  width: 300,
  height: 410
});

async function main() {
  let roomName = figma.root.getPluginData('roomName');
  let secret = figma.root.getPluginData('secret');

  if (!roomName) {
    let randomRoomName = uniqid() + '-' + generateString(15);
    figma.root.setPluginData('roomName', randomRoomName);
    roomName = randomRoomName;
  }

  if (!secret) {
    secret = generateString(20);
    figma.root.setPluginData('secret', secret);
  }

  return {
    roomName,
    secret
  };
}

const postMessage = (type = '', payload = {}) =>
  figma.ui.postMessage({
    type,
    payload
  });

main().then(({ roomName, secret }) => {
  figma.ui.onmessage = async message => {
    if (message.action === 'save-user-settings') {
      await figma.clientStorage.setAsync('user-settings', message.options);

      postMessage('user-settings', message.options);
    }

    if (message.action === 'get-user-settings') {
      const settings = await figma.clientStorage.getAsync('user-settings');

      postMessage('user-settings', settings);
    }

    if (message.action === 'set-server-url') {
      await figma.clientStorage.setAsync('server-url', message.options);

      alert('Please restart the plugin to connect to the new server.');
      figma.closePlugin();
    }

    if (message.action === 'initialize') {
      const url = await figma.clientStorage.getAsync('server-url');

      postMessage('initialize', url || '');
    }

    if (message.action === 'get-selection') {
      postMessage('selection', figma.currentPage.selection.map(n => n.id));
    }

    if (message.action === 'focus-nodes') {
      const nodes = figma.currentPage.findAll(
        n => message.options.ids.indexOf(n.id) !== -1
      );

      figma.viewport.scrollAndZoomIntoView(nodes);
    }

    if (message.action === 'get-root-data') {
      postMessage('root-data', { roomName, secret });
    }

    if (message.action === 'cancel') {
      figma.closePlugin();
    }
  };
});
