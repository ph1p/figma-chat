# Figma Chat Server

This plugins needs a server.
This is a simple websocket server. **Messages are only forwarded and not stored!**

## How to start your own server?

Clone the repository:

```bash
git clone https://github.com/ph1p/figma-chat.git
```

and install all the dependencies.

```bash
yarn install
```

run the server:

```bash
yarn build && yarn start
```

If you want to set another port, you can set the `PORT` environment variable.

### Docker (run inside this folder)

```bash
docker build . --tag figma-chat-server --build-arg VERSION=$(node -p -e "require('./package.json').version") && docker run -p 127.0.0.1:80:3000/tcp figma-chat-server
```

### Traefik

The simplest way to start your server, is to run it with [traefik](https://traefik.io/).
You can find a `docker-compose.yml` inside this repository.
The only thing you have to change is the URL and run:

```bash
docker-compose up -d
```

or if you want to rebuild it:

```bash
docker-compose build
```

## Development

```bash
yarn start:server # starts a server on port 3000
```

Set the server URL to `http://127.0.0.1:3000/` inside your plugin.
