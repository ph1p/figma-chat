import uniqid from 'uniqid';
import { generateString } from './utils';

figma.showUI(__html__, {
  width: 300,
  height: 415
});

async function main() {
  // random user id for current user
  let instanceId = await figma.clientStorage.getAsync('id');
  // figma.root.setPluginData('history', '');
  let history = figma.root.getPluginData('history');
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

  if (!history) {
    history = '[]';
    figma.root.setPluginData('history', history);
  }

  if (!instanceId) {
    instanceId = 'user-' + uniqid() + '-' + generateString(15);
    await figma.clientStorage.setAsync('id', instanceId);
  }

  return {
    roomName,
    secret,
    history: typeof history === 'string' ? JSON.parse(history) : [],
    instanceId
  };
}

const postMessage = (type = '', payload = {}) =>
  figma.ui.postMessage({
    type,
    payload
  });

main().then(({ roomName, secret, history, instanceId }) => {
  figma.ui.onmessage = async message => {
    if (message.action === 'save-user-settings') {
      await figma.clientStorage.setAsync('user-settings', message.options);

      postMessage('user-settings', message.options);
    }

    if (message.action === 'add-message-to-history') {
      const history = JSON.parse(figma.root.getPluginData('history'));

      figma.root.setPluginData(
        'history',
        JSON.stringify(history.concat(message.options))
        //(history || []).concat(message.options)
      );
    }

    if (message.action === 'get-history') {
      const history = figma.root.getPluginData('history');

      postMessage('history', JSON.parse(history));
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

    if (message.action === 'remove-all-messages') {
      figma.root.setPluginData('history', '[]');

      postMessage('history', JSON.parse('[]'));
    }

    if (message.action === 'focus-nodes') {
      const nodes = figma.currentPage.findAll(
        n => message.options.ids.indexOf(n.id) !== -1
      );

      figma.viewport.scrollAndZoomIntoView(nodes);
    }

    if (message.action === 'get-root-data') {
      postMessage('root-data', { roomName, secret, history, instanceId });
    }

    if (message.action === 'cancel') {
      figma.closePlugin();
    }
  };
});
