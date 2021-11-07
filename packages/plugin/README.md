# Figma Chat Plugin

A plugin to chat in figma files. Fully **encrypted**! (https://github.com/sehrope/node-simple-encryptor)

### Installation

There is no special installation process. Just install the plugin in figma.
You can find it [**here**](https://www.figma.com/c/plugin/742073255743594050/Figma-Chat)

### What does it look like?

![preview](https://user-images.githubusercontent.com/15351728/140659857-f45affff-2d36-43ce-810f-c4c6f9b04017.gif)
(And yes, I have chatted with myself)

### Encrypted? No login?

Yes. When opening the plugin a **room** name and a **secret key** are randomly generated once
and stored inside the `figma.root`. All editors within the file can access this attribute.

```javascript
figma.root.setPluginData('roomName', '');
```

All messages are en- and decrypted with the stored secret key and send to the server.

### Development

```bash
git clone git@github.com:ph1p/figma-chat.git
cd figma-chat
yarn install
```

```bash
yarn build:plugin
```

or

```bash
yarn start:plugin
```

- Open figma
- Go to **Plugins**
- Click the "+" next to **Development**
- Choose the manifest.json inside `packages/plugin/Figma Chat`
- Ready to develop

### Bugs / Features

Feel free to open a feature request or a bug report: https://github.com/ph1p/figma-chat/issues

### Sound

Thanks to [https://notificationsounds.com/notification-sounds/when-604](https://notificationsounds.com/notification-sounds/when-604)
