<img width="44" src="src/icon128.png" alt="settings screenshot"/> IQ Alert
===============
![Chrome users](https://img.shields.io/chrome-web-store/users/nhjapojbdgmjlnmlenegefgfjannjchb?label=Chrome%20users)
![Firefox users](https://img.shields.io/amo/users/iqalert?label=Firefox%20users)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate?business=5GY9A82PFY38W&no_recurring=1&currency_code=EUR)

A browser extension that adds sound alerts and desktop notifications for game events 
in [Idle Quest RPG](https://www.iqrpg.com/).

[<img src="https://user-images.githubusercontent.com/13658335/138092194-303708fb-9a4e-4e3f-a1dc-74baff1e45c9.png" height="59"/>](https://chrome.google.com/webstore/detail/iqalert/nhjapojbdgmjlnmlenegefgfjannjchb)
[<img src="https://user-images.githubusercontent.com/13658335/138086366-8deee659-16c3-4621-b3f0-eaf4cb6ed9ba.png" height="60"/>](https://addons.mozilla.org/firefox/addon/iqalert/)


Features
------------
- Unique sound alerts for: raid returns, bosses, events, bonus effects
- Auto alert: a beeping sound when your autos are below a chosen threshold
- Clan events: get notified of clan events like clan bosses or donations
- Sound volume and individual alerts can be configured on the options page
- Support for widgets with UI alterations and additions
- Desktop notifications

Installation
--
Get the extension from the [Chrome](https://chrome.google.com/webstore/detail/iqalert/nhjapojbdgmjlnmlenegefgfjannjchb) or [Firefox](https://addons.mozilla.org/firefox/addon/iqalert/) store. Refresh IQ after installing.

### Configuration
Click on the extension icon to bring up the [options page](#options). Press save and refresh IQ after making changes.

Allow notifications on iqrpg.com for desktop notifications to work.

### Widgets
In addition to the various alerts, there are also a few "widgets" that can be enabled:

- Clan battlegrounds: shows the remaining clan mobs on the main IQ screen (including clan bosses)
- Trinket scorer (experimental): Show a score for each trinket in your inventory based on the stat order from [iqrpg.guide](https://iqrpg.guide/). Choose between Battler or Gatherer from the options screen.
- Remove header graphic
- Remove auto bar animation

Screenshots
--
#### Options
<img width="260" src="https://user-images.githubusercontent.com/13658335/178152679-f73d460f-0bfb-428a-8241-de8a49cfa7dd.png" alt="settings screenshot"/>

#### Desktop notifications
<p>
<img width="330" src="https://user-images.githubusercontent.com/13658335/177621080-ac6d602c-f8ea-40e8-9298-eec356e31aaf.png" alt="desktop notification"/>
<img width="330" src="https://user-images.githubusercontent.com/13658335/177621107-c64aefcc-95a2-4283-ac48-fd42d2ba52c0.png" alt="desktop notification"/>
<img width="330" src="https://user-images.githubusercontent.com/13658335/177621116-8f2d48a4-eecd-47a0-96b7-33d72ab7847a.png" alt="desktop notification"/>
<img width="330" src="https://user-images.githubusercontent.com/13658335/177622407-1ed6a36e-d77f-4f91-95b0-b79d840cebea.png" alt="desktop notification"/>
</p>

#### Clan Battlegrounds widget with header and auto animation removed
<img width="550" src="https://user-images.githubusercontent.com/13658335/177624366-0816ef0b-4e7a-40ba-9b25-fafaaec2c4dd.png" alt="clan battlegrounds"/>

#### Trinket Score widget
<img width="550" src="https://user-images.githubusercontent.com/13658335/178152796-68daf251-23d7-48f0-b2f8-4b7430c1631f.png" alt="trinket score"/>

Build
---
Requires Node.js. Output is in the `build` directory.
```
git clone https://github.com/gmertes/IQAlert.git
cd IQAlert
npm install
npm run build
```
Optionally run `npm run pack` to create a zip in the `dist` directory.

Donate
----
The extension is and will remain free. If you like and want to support my work, donations are welcome.

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate?business=5GY9A82PFY38W&no_recurring=1&currency_code=EUR)

BTC: `bc1qx8duq3526zhc2md724ym70qgd4wgadj5dqfuvr`

ETH: `0x02635a2ef80887B0AEBa5a8282AeFAEA401DFCf9`

XLM: `GB5Y7TVH7OBI7MFAT26RZ4TCZRDMVNWXLQH3LPTI2RRB22PRHSDR25BH`