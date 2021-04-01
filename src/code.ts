import { DEFAULT_SERVER_URL } from './shared/constants';
import MessageEmitter from './shared/MessageEmitter';
import { generateString } from './shared/utils';

let isMinimized = false;
let isFocused = true;
let sendNotifications = false;
let triggerSelectionEvent = true;

const isRelaunch = figma.command === 'relaunch';

figma.showUI(__html__, {
  width: 333,
  height: 490,
  // visible: !isRelaunch
});

figma.root.setRelaunchData({
  open: '',
});

const main = async () => {
  const timestamp = +new Date();

  // random user id for current user
  let instanceId = await figma.clientStorage.getAsync('id');
  // figma.root.setPluginData('history', '');
  let history = figma.root.getPluginData('history');
  let roomName = figma.root.getPluginData('roomName');
  let secret = figma.root.getPluginData('secret');
  // const ownerId = figma.root.getPluginData('ownerId');

  const settings = await figma.clientStorage.getAsync('user-settings');

  if (!settings || !settings.url) {
    await figma.clientStorage.setAsync('user-settings', {
      ...settings,
      url: DEFAULT_SERVER_URL,
    });
  }

  try {
    JSON.parse(history);
  } catch {
    history = '';
  }

  if (!instanceId) {
    instanceId = 'user-' + timestamp + '-' + generateString(15);
    await figma.clientStorage.setAsync('id', instanceId);
  }

  if (!roomName && !secret) {
    figma.root.setPluginData('ownerId', instanceId);
  }

  if (!roomName) {
    const randomRoomName = timestamp + '-' + generateString(15);
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

  // Parse History
  try {
    history = typeof history === 'string' ? JSON.parse(history) : [];
  } catch {}

  return {
    roomName,
    secret,
    history,
    instanceId,
    settings,
  };
};

const getSelectionIds = () => {
  return figma.currentPage.selection.map((n) => n.id);
};

const sendSelection = () => {
  MessageEmitter.emit('selection', {
    page: {
      id: figma.currentPage.id,
      name: figma.currentPage.name,
    },
    nodes: getSelectionIds(),
  });
};

const sendRootData = async ({ roomName, secret, history, instanceId }) => {
  const settings = await figma.clientStorage.getAsync('user-settings');

  MessageEmitter.emit('root-data', {
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

const goToPage = (id) => {
  if (figma.getNodeById(id)) {
    figma.currentPage = figma.getNodeById(id) as PageNode;
  }
};

let previousSelection = figma.currentPage.selection || [];

MessageEmitter.answer('get image', async (ids) => {
  try {
    const node = figma.getNodeById(ids[0]) as SceneNode;

    return await node.exportAsync({
      format: 'PNG',
      constraint: {
        type: 'SCALE',
        value: 0.3,
      },
    });
  } catch (e) {
    return null;
  }
});

main().then(({ roomName, secret, history, instanceId }) => {
  MessageEmitter.emit('ready');

  // events
  figma.on('selectionchange', () => {
    if (figma.currentPage.selection.length > 0) {
      for (const node of figma.currentPage.selection) {
        if (node.setRelaunchData && isValidShape(node)) {
          node.setRelaunchData({
            relaunch: '',
          });
        }
      }
      previousSelection = figma.currentPage.selection;
    } else {
      if (previousSelection.length > 0) {
        // tidy up 🧹
        for (const node of previousSelection) {
          if (node.setRelaunchData && isValidShape(node)) {
            node.setRelaunchData({});
          }
        }
      }
    }
    if (triggerSelectionEvent) {
      sendSelection();
    }
  });

  MessageEmitter.on('save-user-settings', async (data, emit) => {
    await figma.clientStorage.setAsync('user-settings', data);
    const settings = await figma.clientStorage.getAsync('user-settings');

    emit('user-settings', settings);
  });

  MessageEmitter.on('add-message-to-history', async (data) => {
    const messageHistory = JSON.parse(figma.root.getPluginData('history'));

    figma.root.setPluginData(
      'history',
      JSON.stringify(messageHistory.concat(data))
    );
  });

  MessageEmitter.on('notify', (data) => figma.notify(data));
  MessageEmitter.on('notification', (data) => {
    if (sendNotifications) {
      figma.notify(data);
    }
  });

  MessageEmitter.on('clear-chat-history', (_, emit) => {
    figma.root.setPluginData('history', '[]');

    emit('history', JSON.parse('[]'));
  });

  MessageEmitter.on('initialize', (_, emit) => {
    emit('initialize');

    sendRootData({ roomName, secret, history, instanceId });
  });

  MessageEmitter.on('minimize', (data) => {
    isMinimized = data;
    sendNotifications = isMinimized;

    // resize window
    figma.ui.resize(data ? 180 : 333, data ? 108 : 490);
  });

  MessageEmitter.on('focus', (data) => {
    if (!isMinimized) {
      isFocused = data;

      if (!isFocused) {
        sendNotifications = true;
      }
    }
  });

  MessageEmitter.on('focus-nodes', (data) => {
    let selectedNodes = [];
    triggerSelectionEvent = false;

    // fallback for ids
    if (data.ids) {
      selectedNodes = data.ids;
    } else {
      goToPage(data?.page?.id);
      selectedNodes = data.nodes;
    }

    const nodes = figma.currentPage.findAll(
      (n) => selectedNodes.indexOf(n.id) !== -1
    );

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);

    setTimeout(() => (triggerSelectionEvent = true));
  });

  MessageEmitter.on('get-root-data', () => {
    sendRootData({ roomName, secret, history, instanceId });
  });

  MessageEmitter.on('ask-for-relaunch-message', (_, emit) => {
    if (isRelaunch && !alreadyAskedForRelaunchMessage) {
      alreadyAskedForRelaunchMessage = true;
      emit('relaunch-message', {
        selection: {
          page: {
            id: figma.currentPage.id,
            name: figma.currentPage.name,
          },
          nodes: getSelectionIds(),
        },
      });
    }
  });

  MessageEmitter.on('cancel', () => figma.closePlugin());
});
