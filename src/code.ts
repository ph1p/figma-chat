import uniqid from 'uniqid';
import { generateString } from './shared/utils';

let isMinimized = false;
let isFocused = true;
let sendNotifications = false;
let triggerSelectionEvent = true;

const isRelaunch = figma.command === 'relaunch';

figma.showUI(__html__, {
  width: 300,
  height: 415,
  // visible: !isRelaunch
});

figma.root.setRelaunchData({
  open: '',
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
    instanceId,
  };
}

const postMessage = (type = '', payload = {}) =>
  figma.ui.postMessage({
    type,
    payload,
  });

const getSelectionIds = () => {
  return figma.currentPage.selection.map((n) => n.id);
};

const sendSelection = () => {
  postMessage('selection', getSelectionIds());
};

const sendRootData = async ({ roomName, secret, history, instanceId }) => {
  const settings = await figma.clientStorage.getAsync('user-settings');

  postMessage('root-data', {
    roomName,
    secret,
    history,
    instanceId,
    settings,
    selection: getSelectionIds(),
  });
};

let alreadyAskedForRelaunchMessage = false;

const isValidShape = (node) =>
  node.type === 'RECTANGLE' ||
  node.type === 'ELLIPSE' ||
  node.type === 'GROUP' ||
  node.type === 'TEXT' ||
  node.type === 'VECTOR' ||
  node.type === 'FRAME' ||
  node.type === 'COMPONENT' ||
  node.type === 'INSTANCE' ||
  node.type === 'POLYGON';

function iterateOverFile(node, cb) {
  if ('children' in node) {
    if (node.type !== 'INSTANCE') {
      cb(node);
      for (const child of node.children) {
        cb(child);
        iterateOverFile(child, cb);
      }
    }
  }
}

main().then(({ roomName, secret, history, instanceId }) => {
  postMessage('ready');

  // events
  figma.on('selectionchange', () => {
    iterateOverFile(figma.root, (node) => {
      if (node.setRelaunchData && isValidShape(node)) {
        node.setRelaunchData({
          relaunch: '',
        });
      }
    });
    if (triggerSelectionEvent) {
      sendSelection();
    }
  });

  figma.ui.onmessage = async (message) => {
    switch (message.action) {
      case 'save-user-settings':
        await figma.clientStorage.setAsync('user-settings', message.payload);

        postMessage('user-settings', message.payload);
        break;
      case 'add-message-to-history':
        {
          const history = JSON.parse(figma.root.getPluginData('history'));

          figma.root.setPluginData(
            'history',
            JSON.stringify(history.concat(message.payload))
          );
        }
        break;
      case 'get-history':
        {
          const history = figma.root.getPluginData('history');

          postMessage('history', JSON.parse(history));
        }
        break;
      case 'notify':
        figma.notify(message.payload);
        break;
      case 'notification':
        if (sendNotifications) {
          figma.notify(message.payload);
        }
        break;
      case 'set-server-url':
        await figma.clientStorage.setAsync('server-url', message.payload);
        break;
      case 'initialize':
        const url = await figma.clientStorage.getAsync('server-url');

        postMessage('initialize', url || '');

        sendRootData({ roomName, secret, history, instanceId });
        break;
      case 'get-selection':
        sendSelection();
        break;
      case 'remove-all-messages':
        figma.root.setPluginData('history', '[]');

        postMessage('history', JSON.parse('[]'));
        break;
      case 'minimize':
        isMinimized = message.payload;
        sendNotifications = isMinimized;

        // resize window
        figma.ui.resize(message.payload ? 180 : 300, message.payload ? 1 : 415);
        break;
      case 'focus':
        if (!isMinimized) {
          isFocused = message.payload;

          if (!isFocused) {
            sendNotifications = true;
          }
        }
        break;
      case 'focus-nodes':
        triggerSelectionEvent = false;
        const nodes = figma.currentPage.findAll(
          (n) => message.payload.ids.indexOf(n.id) !== -1
        );

        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);

        setTimeout(() => (triggerSelectionEvent = true));

        break;
      case 'get-root-data':
        sendRootData({ roomName, secret, history, instanceId });
        break;

      case 'ask-for-relaunch-message':
        if (isRelaunch && !alreadyAskedForRelaunchMessage) {
          alreadyAskedForRelaunchMessage = true;
          postMessage('relaunch-message', {
            selection: getSelectionIds(),
          });
        }
        break;
      case 'cancel':
        figma.closePlugin();
        break;
    }
  };
});
