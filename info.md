## Premise
> You're a wizard, Harry.

This is a virtual spellcasting demo in which you take control of your "wand"
(i.e. your smartphone) and cast spell(s). It was created as a final project for
the Harry Potter DeCal at UC Berkeley. The idea is that the user would hold
his/her phone in front of a computer while calling out an incantation and
brandishing the phone "wand." On-screen the user would then be able to see
his/her wand moving around, along with the effect of the spell that he/she casts.

## Spell List
- Wingardium Leviosa
- Lumos
- Nox

## Technologies
- WebSockets
- Babylon.js
- JsSpeechRecognizer

## Supported Browsers
- Chrome

## URLs
- [http://www.wingardium.xyz](http://www.wingardium.xyz)
- [https://spelkast.herokuapp.com](https://spelkast.herokuapp.com)

## Notes
- You cannot move your feet in-world.
- I don't intend to put much work into the scene,
  meaning it could be greatly improved by the careful touch of an artist.
  To my extreme regret, the label of "artist" cannot in general be applied to me.
- I had planned to involve accelerometer data in order to track the position
  of the wand as well as the orientation, but after multiple numerical integration
  attempts I found that the scheme introduced too much error/drift to be usable.
