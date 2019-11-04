# bragarden-raspberry

This is the hardware part of the IoT garden watering system, a simple hobby project of mine, that use a RasperryPI as CPU. The script use the Firebase Realtime Database as method to update and sync the pumps status.

## Screenshot

(TODO)

## Usage

required Node > 8.x

create a .env file with:
- FIREBASE_REALTIMEDB_URL=`realtime database address`
- DEBUG=`true/false`
- SCHEDULE_INTERVAL=`10000 milliseconds`

add the serviceAccount.json file from Firebase and name it `firebaseServiceAccount.json`

```bash
node pi.js
```

or, better, with nodemon or pm2.

## Changelog

#### v0.0.1

- First code, firebase db + logics, no GPIO integration

## Author

Davide Bragagnolo - [davebra.me](https://davebra.me)
