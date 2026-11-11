# FaceRace

Race your face around a raytraced stadium. Five other faces start ahead of you. Three laps count only when you pass the checkpoints. Grass only trims you to about three quarters speed, so you can get back on the road. Sand, rock, and water are slower still. Sharp corners have guardrails. A hard hit bends a section until it breaks, and a high jump can clear one. Four inflatable checkpoints stand just off the racing line and lean in the wind. The corner map and a marker on the picture point at the next one. The picture settles toward about 30 frames a second. Resolution and frame rate ease together in small steps, with a short fade between sizes, softening only as far as the device needs for 20 or, at worst, 12, and sharpening back slowly once the frames are quick. Each course has its own top speed, so the oval stays slower than the long ridge.

**Play it:** [blakelapierre.github.io/facerace](https://blakelapierre.github.io/facerace/)

WASD or the arrows drive (A is left). Space brakes. Shift is the nox bottle; it spends itself and fills back up. M mutes. On a phone, turn it sideways and use the Motion / Stick button. Motion tilts the phone to steer, with Go and Back, and pitching the phone brakes or fires the bottle. Stick ignores the phone and uses the joystick. Brake and Nox sit on the right either way. Drag the picture to look around. The corner map shows more of the course when the road is straight and tightens in the turns. **My face** paints your webcam onto the helmet. Your name and that face stay in this browser after a refresh. Other drivers wear a small see-through thought bubble that grows as you close in and shrinks as you pull away. Leave the room as `pit` to meet other people on that code, or clear it to race the bots alone. Your best time stays in this browser.

The Garage hires a mechanic and builds their kart. Wings and a rudder are separate parts, and they only work on the kart you selected after a block confirms the fit. Wings hold a jump on their own once you are in the air. The rudder is the same steer you already use (A and D, the stick, or a phone tilt) while the kart is airborne. Wins raise that mechanic's skill. Another wallet can hire them away by paying more. Those fees feed a developer pool and a bonus purse, and a slice of the bonus tops the next purse race. Blocks is the ledger, a way to send chips or oil, batteries, and engines, and a small exchange for those materials.

The circuit is painted onto Meridian’s dunes, mountain, lake, and cinder cone. Summit climbs the mountain and Caldera runs the volcano rim. A solo race walks every course, then brings the field back faster and starts again. Rain and fog banks roll through on the same clock. The pit menu posts a room on the public torrent trackers, and Pits (or Escape) brings you back after a race.

This branch (`modern`) replaces the 2014 Angular client. The old game is still on `rewrite2`. The picture is the Meridian raytracer; bumps trade momentum the way the latest nobody raycaster does, instead of sticking the karts together.

```bash
npm install
npm run dev
```

The GitHub Pages demo is a static build of the same race:

```bash
npm run build:pages
```
