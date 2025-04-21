require('./iqwidget');

const readOptions = require('./readoptions');
const console = require('./console');
const dialer = require('./dialer');

const soundAuto = chrome.runtime.getURL("auto.mp3");
const soundBoss = chrome.runtime.getURL("boss.mp3");
const soundEvent = chrome.runtime.getURL("event.mp3");
const soundDone = chrome.runtime.getURL("beep.mp3");
const soundPing = chrome.runtime.getURL("ping.mp3");

let gOptions;
let gDesktopNotificationOnCooldown = false;
let gBonusActive = false;
let gPlayerName = undefined;
let labInterval = undefined;

if (Notification.permission !== "denied") Notification.requestPermission().catch(() => { });

// inject our websocket proxy
const s = document.createElement('script');
s.src = chrome.runtime.getURL('wsproxy.min.js');
s.onload = function () { this.remove(); };
(document.head || document.documentElement).appendChild(s);

function alert(sound, text, title = 'IQ Alert!') {
    playSound(sound, gOptions.soundVolume);
    notify(title, text);
}

function notify(title, text, cooldown = 7000, skipIfActive = false) {
    if (skipIfActive && !document.hidden)
        return;

    if (gDesktopNotificationOnCooldown || !gOptions.desktopNotifications)
        return;

    gDesktopNotificationOnCooldown = true;
    setTimeout(() => { gDesktopNotificationOnCooldown = false; }, cooldown);

    let notification;
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        notification = new Notification(title, { body: text, silent: true, icon: chrome.runtime.getURL("icon128.png") });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                notification = new Notification(title, { body: text, silent: true, icon: chrome.runtime.getURL("icon128.png") });
            }
        }).catch(() => { });
    }
    notification.onclick = function () {
        window.focus();
        this.close();
    };
    setTimeout(notification.close.bind(notification), 7000);
}

function playSound(sound, volume = 0.7) {
    let audio = new Audio(sound);
    audio.volume = volume;
    audio.play().catch(() => { });
}

// strip HTML and IQ-specific tags
function removeTags(str) {
    str = str.toString();

    return str.trim().replace(/(<([^>]+)>)/ig, '')
        .replaceAll('[item:', '')
        .replaceAll(']', '');
}

function truncate(str, num) {
    if (str.length > num)
        return str.slice(0, num) + "…";
    else
        return str;
}

async function checkLabyrinth() {
    // ping the lab endpoint and show an alert if the lab is reset
    if (!gOptions.labAlert)
        return;

    const data = await dialer.loadLabyrinth();
    console.debug('loadLabyrinth:', data);

    if (data?.turns === data?.maxTurns)
        return;

    const text = console.log('Enter the Labyrinth! ⚔️');

    // only show the alert if lab has not been entered yet
    if (data?.turns !== 0)
        return;

    alert(soundEvent, text, "Labyrinth Reset");
}

function startLabyrinthCheck() {
    // start an interval to check the lab status every hour
    if (!gOptions.labAlert)
        return;

    console.debug('Labyrinth check interval started');

    clearInterval(labInterval);
    labInterval = setInterval(checkLabyrinth, 3600 * 1000); // 1 hour
}

function handleWSEvent(event) {

    if (event.type === 'bonusTime') {
        if (event.data.length === 0 || event.data.stage === 'end') {
            gOptions.bonusAlertDone && alert(soundDone, 'Bonus finished.');
            gBonusActive = false;
        } else {
            if (gBonusActive) {
                gOptions.bonusAlert && alert(soundEvent, 'Bonus time extended! 🎉');
            } else {
                gOptions.bonusAlert && alert(soundEvent, 'Bonus time! 🥳');
            }
            gBonusActive = true;
        }
        console.log('bonus ' + gBonusActive);
        return;
    }

    if (event.type === 'msg') {
        const msgText = removeTags(event.data.msg);

        if (event.data.type === 'eventGlobal') {
            if (msgText.includes('rift to the dark realm has opened')) {
                const text = console.log('BOSS! 🤠');
                gOptions.bossAlert && alert(soundBoss, text);
            } else if (msgText.includes('gathering bonus is now active')) {
                console.log(msgText);
                gOptions.eventAlert && alert(soundEvent, msgText, 'IQ Gathering Bonus! ⛏');
            }
            return;
        }

        if (event.data.type === 'clanGlobal') {
            console.log(msgText);
            gOptions.clanAlert && alert(soundDone, msgText, 'IQ Clan Alert');
            return;
        }

        if (event.data.type === 'global') {
            if (msgText.includes('landed the final blow')) {
                console.log(msgText);
                const player = msgText.split(' landed')[0];

                if (player === gPlayerName) {
                    gOptions.bossAlert && alert(soundDone, `🥳 YOU killed the boss! 🥳`, '🎉🎉🎉🎈🎈🎈');
                    console.log('YOU killed the boss!');
                } else {
                    gOptions.bossAlertDone && alert(soundDone, `Boss defeated by ${player}.`);
                }
            }
            return;
        }

        if (event.channel === 'clan-64') {
            if (!gOptions.clanChatAlert.enabled)
                return;

            const user = event.data.username;

            if (user === gPlayerName)
                return;

            console.debug('Clan message:', user, msgText);
            alert(soundPing, truncate(msgText, 80), `Clan message by ${user} 💬`);
            return;
        }

        if (event.data.type === 'pm-from') {
            if (!gOptions.pmAlert)
                return;

            const user = event.data.username;

            console.debug('PM from:', user, msgText);
            alert(soundPing, truncate(msgText, 80), `PM from ${user} 💬`);
            return;
        }
        return;
    }

    if (event.type === 'event') {
        console.log(event.data.type + ' event');

        if (event.data.stage === 'end') {
            gOptions.eventAlertDone && alert(soundDone, 'Event finished.');
            return;
        }

        if (!gOptions.eventAlert)
            return;

        switch (event.data.type) {
            case 'woodcutting':
                alert(soundEvent, 'A spirit tree has sprung up out of the dirt...', 'Woodcutting event 🪓');
                break;
            case 'mining':
                alert(soundEvent, 'A burning meteorite filled with valuable metals...', 'Mining event ⛏');
                break;
            case 'quarrying':
                alert(soundEvent, 'A sinkhole has appeared in the ground...', 'Quarrying event ⚒');
                break;
        }
        return;
    }
}

const bodyObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === "characterData") {
            // autos
            if (mutation.target.parentNode.className === "action-timer__text") {
                let autosRemaining = parseInt(mutation.target.data.replace('Autos Remaining: ', ''));
                if ((autosRemaining <= gOptions.autoAlertNumber && autosRemaining > 0)) {
                    if (autosRemaining === gOptions.autoAlertNumber) {
                        console.log(autosRemaining + ' autos remaining');
                        gOptions.autoAlert && notify('IQ Auto Alert!', 'You have ' + autosRemaining + ' autos remaining!');
                    }
                    gOptions.autoAlert && playSound(soundAuto, gOptions.soundVolume);
                }
            }
        }

        mutation.addedNodes.forEach(node => {
            // raid return
            if (
                node.parentNode.className.includes("space-between") &&
                node.innerText.toLowerCase() === "returned"
            ) {
                const text = console.log('Raid has returned 😎');
                gOptions.raidAlert && alert(soundDone, text);
            }

            // lab done
            if (
                node?.className?.includes("main-section") &&
                node.textContent.toLowerCase().includes("open labyrinth reward chest")
            ) {
                const text = console.log('Open your labyrinth chest! 🎁');
                gOptions.labAlertDone && alert(soundDone, text, 'Labyrinth Done');

                // stop the lab checker and wait some time before restarting it
                clearInterval(labInterval);
                labInterval = undefined;

                setTimeout(startLabyrinthCheck, 12 * 3600 * 1000); // 12 hours
            }
        });
    });
});
const observerOptions = {
    attributes: true,
    subtree: true,
    childList: true,
    characterData: true
};

window.addEventListener("load", function () {
    readOptions().then(options => {
        gOptions = options;
        bodyObserver.observe(document.body, observerOptions);
        console.log('v' + VERSION + ' loaded');

        startLabyrinthCheck();
    });
});

window.addEventListener('message', function (event) {
    if (event.origin !== "https://www.iqrpg.com" && event.origin !== "https://iqrpg.com")
        return;

    if (event.data.type !== 'iqalert_ws-receive')
        return;

    const data = JSON.parse(event.data.msg);

    handleWSEvent(data);

    if (data.type !== 'playersOnline')
        console.debug('WS receive:', data);

    if (data.type !== 'loadMessages')
        return;

    // use this as an entry point for game start:
    //      user is on game screen and websocket connected

    dialer.loadInitialData().then(data => {
        console.debug(data);

        gPlayerName = data.player.username;
        console.log(`Welcome back ${gPlayerName}!`);

        if (data.misc.bonusTime.timeRemaining > 0) {
            gBonusActive = true;
            console.log('Bonus time was active on load.');
        } else {
            gBonusActive = false;
        }
    }).catch(() => { });

    dialer.loadClanMembers().then(data => {
        const clanMembers = data.members.map(item => item.username);
        console.debug('Clan members:', clanMembers);

        readOptions().then(options => {
            const clanChatAlert = options.clanChatAlert;

            for (const member in clanChatAlert.members) {
                if (!clanMembers.includes(member))
                    delete clanChatAlert.members[member];
            }
            clanMembers.forEach(member => {
                if (!(member in clanChatAlert.members))
                    clanChatAlert.members[member] = false;
            });

            chrome.storage.sync.set({ clanChatAlert: clanChatAlert });
            gOptions = options;
        });
    }).catch(() => { });
});