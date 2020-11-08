# ws-wrtc-client

## Vue 3 client for testing p2p webRTC connection on a data chanel.
This project was created to test the possibility of using webRTC as a substitute to firebase realtime database. Soo to be implemented as the backend of [Noter](https://github.com/soulsam480/noter).

### Stack
#### Backend (Signaling Server):
- Express
- Socket.io
#### Frontend (Client):
- Vue 3
- Javascript webRTC API

### How to test:
- open [https://wswrtc.netlify.app/](https://wswrtc.netlify.app/) in two browser windows.
- click the button which will only show up after it's been opened in two windows.
- accept the alerts and after it shows connected both the cleints are connected through peer to peer webRTC connection.
- Type in the text area to see the realtime conection in action in the other client.

### Known caveats:
- This connection is not working when one client is behind a [NAT](https://en.wikipedia.org/wiki/Network_address_translation) which includes a laptop using a mobile hotspot as well.
- The problem could be solved by using a [STUN](https://tools.ietf.org/html/rfc5389)  server with proper config.
