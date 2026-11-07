# FaceRace

Race your face around a raytraced stadium. Five other faces start ahead of you. Three laps, don’t cut the grass.

**Play it:** [blakelapierre.github.io/facerace](https://blakelapierre.github.io/facerace/)

WASD or the arrows drive (A is left). M mutes. On a phone, turn it sideways and use the Motion / Stick button. Motion tilts the phone to steer, with Go and Back. Stick ignores the phone and uses the joystick. Drag the picture to look around. **Use my face** paints your webcam onto the helmet. Leave the room as `pit` to meet other people on that code, or clear it to race the bots alone. Your best time stays in this browser.

The circuit is painted onto Meridian’s dunes, so the asphalt follows the slope instead of a separate mesh. The first course is a wide stadium. Finish it and the field moves to Ridge, a longer loop over the hills. Sound is synthesized the way Meridian does it: a listener, short cues, and a small ambient schedule, plus an engine drone for the karts. The picture spends more rays when a frame comes back cheap, so a still view can sharpen. Bumps trade momentum and kick the camera.

This branch (`modern`) replaces the 2014 Angular client. The old game is still on `rewrite2`. The picture is the Meridian raytracer; bumps trade momentum the way the latest nobody raycaster does, instead of sticking the karts together.

```bash
npm install
npm run dev
```

The GitHub Pages demo is a static build of the same race:

```bash
npm run build:pages
```
