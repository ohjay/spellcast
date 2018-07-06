## Premise
> You're a wizard, Harry.

This is a virtual spellcasting demo in which you take control of your "wand"
(i.e. your smartphone) and cast spell(s). It was created as a final project for
the Harry Potter DeCal at UC Berkeley. The idea is that the user would hold
his/her phone in front of a computer while calling out an incantation and
brandishing the phone "wand." On-screen the user would then be able to see
his/her wand moving around, along with the effect of the spell that he/she casts.

## Instructions
1. Open the website in a desktop/laptop browser.
2. Use your phone to scan the provided QR code.
3. Point your phone at the screen and hit _Calibrate_.
   - At this point, you should be able to see your real-world movements reflected in the scene.
4. **To cast a spell:** hold down the _Incantate_ button, call out the spell, and release the button.
   - Supported spells are listed below.
   - For bonus points, provide the correct wand motion as well.

## Spell List
- Wingardium Leviosa
  - _Levitates objects._
- Lumos
  - _Creates a beam of light that shines from the wand's tip._
- Nox
  - _Extinguishes light from Lumos._

## Technologies
- WebSockets
- Babylon.js
- JsSpeechRecognizer

## Supported Browsers
- Chrome

## URLs
- ~~[http://www.wingardium.xyz](http://www.wingardium.xyz)~~
- [https://spelkast.herokuapp.com](https://spelkast.herokuapp.com)

## Notes
- You cannot move your feet in-world.
- I don't intend to put much work into the scene,
  meaning it could be greatly improved by the careful touch of an artist.
  To my extreme regret, the label of "artist" cannot in general be applied to me.
- I had planned to involve accelerometer data in order to track the position
  of the wand as well as the orientation, but after multiple numerical integration
  attempts I found that the scheme introduced too much error/drift to be usable.
