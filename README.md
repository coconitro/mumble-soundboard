# Mumble Soundboard

A simple soundboard bot and web client for mumble. A bot will idle in a specified channel on your mumble server which takes /slash commands and a web UI will be served up to also control the soundboard.

## Dependancies

If you are running outside of the docker container you will need:

 * node & npm

## Usage

### Config

The following env variables need to be set.

 * MUMBLE_NAME
 * MUMBLE_PASS
 * MUMBLE_URL
 * AUDIO_DIR

### Node

```
npm install
npm start
```

### Docker

```
docker run \
  -d \
  --restart always \
  -p 8080:3000 \
  -v "/var/lib/docker/data/soundboard/:/audio" \
  -e MUMBLE_URL="mumble://yourhost.mumble.example/ChannelName" \
  -e MUMBLE_NAME="SoundboardBot" \
  -e MUMBLE_PASS="password" \
  -e AUDIO_DIR="/audio/" \
  mycatisblack/mumble-soundboard:latest
```

