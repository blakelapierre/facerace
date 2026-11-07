# FaceRace

Race your face around a raytraced stadium. Five other faces start ahead of you. Three laps, don’t cut the grass.

**Play it:** [blakelapierre.github.io/facerace](https://blakelapierre.github.io/facerace/)

WASD or the arrows drive (A is left). M mutes. On a phone, turn it sideways: tilt to steer, push the stick to drive, and drag the picture to look around. **Use my face** paints your webcam onto the helmet. Leave the room as `pit` to meet other people on that code, or clear it to race the bots alone. Your best time stays in this browser.

Sound is synthesized the way Meridian does it: a listener, short cues, and a small ambient schedule, plus an engine drone for the karts. The picture uses Meridian’s pace scaler, so a still view sharpens and a busy GPU drops rays instead of locking the tab. Bumps trade momentum and kick the camera.

This branch (`modern`) replaces the 2014 Angular client. The old game is still on `rewrite2`. The picture is the Meridian raytracer; bumps trade momentum the way the latest nobody raycaster does, instead of sticking the karts together.

```bash
npm install
npm run dev
```

The GitHub Pages demo is a static build of the same race:

```bash
npm run build:pages
```
