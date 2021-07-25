# Figma Chat Plugin

A plugin to chat in figma files. Fully **encrypted**! (https://github.com/sehrope/node-simple-encryptor)

### Installation

There is no special installation process. Just install the plugin in figma.
You can find it [**here**](https://www.figma.com/c/plugin/742073255743594050/Figma-Chat)

### What does it look like?

![presentation](https://user-images.githubusercontent.com/15351728/110795249-ea161680-8276-11eb-8820-0f96ef4bf445.gif)
(And yes, I have chatted with myself)

### Encrypted? No login?

Yes. When opening the plugin a **room** name and a **secret key** are randomly generated once
and stored inside the `figma.root`. All editors within the file can access this attribute.

```javascript
figma.root.setPluginData('roomName', '');
```

All messages are en- and decrypted with the stored secret key and send to the server.

### Todolist/Featurelist

- [x] set custom server URL (`packages/server`)
- [x] add leave and join message
- [ ] add typing info
- [x] notifications (first version)
- [x] save local history
- [x] create a shared history
- [ ] users/instances can delete messages
- [ ] regenerate new room name and secret key
- [ ] create a random unique user name to detect returning users on server and inside a figma file
- [x] remove all messages
- [ ] add max message count to prevent a to large object inside the figma file
- [x] pagination

Feel free to open a feature request: https://github.com/ph1p/figma-chat/issues

### Development

```bash
git clone git@github.com:ph1p/figma-chat.git
cd figma-chat
yarn install
```

```bash
yarn plugin:build
```

or

```bash
yarn plugin:start
```

- Open figma
- Go to **Plugins**
- Click the "+" next to **Development**
- Choose the manifest.json inside `packages/plugin/Figma Chat`
- Ready to develop

### Sound

Thanks to [https://notificationsounds.com/notification-sounds/when-604](https://notificationsounds.com/notification-sounds/when-604)
