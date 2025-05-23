const readOptions = require('./readoptions');

function save_options() {
    chrome.storage.sync.set({
        soundVolume: document.getElementById('soundVolume').value / 10,
        autoAlertNumber: parseInt(document.getElementById('autoAlertNumber').value),
        autoAlert: document.getElementById('autoAlert').checked,
        bossAlert: document.getElementById('bossAlert').checked,
        bossAlertDone: document.getElementById('bossAlertDone').checked,
        eventAlert: document.getElementById('eventAlert').checked,
        eventAlertDone: document.getElementById('eventAlertDone').checked,
        bonusAlert: document.getElementById('bonusAlert').checked,
        bonusAlertDone: document.getElementById('bonusAlertDone').checked,
        raidAlert: document.getElementById('raidAlert').checked,
        clanAlert: document.getElementById('clanAlert').checked,
        pmAlert: document.getElementById('pmAlert').checked,
        labAlert: document.getElementById('labAlert').checked,
        labAlertDone: document.getElementById('labAlertDone').checked,
        desktopNotifications: document.getElementById('desktopNotifications').checked,
        widgets: {
            battlegrounds: document.getElementById('widgetBattlegrounds').checked,
            removeHeader: document.getElementById('widgetRemoveHeader').checked,
            removeAuto: document.getElementById('widgetRemoveAuto').checked,
            trinketScore: document.getElementById('widgetTrinketScore').checked,
            trinketScoreType: document.getElementById('widgetTrinketScoreType').value,
        }
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = "Options saved. Refresh IQ to take effect.";
        setTimeout(function () {
            status.textContent = '';
        }, 2500);
    });
}

function set_options() {
    document.getElementById('version').innerHTML = "v" + VERSION;
    readOptions().then(options => {
        document.getElementById('soundVolume').value = options.soundVolume * 10;
        document.getElementById('autoAlertNumber').value = options.autoAlertNumber;
        document.getElementById('autoAlert').checked = options.autoAlert;
        document.getElementById('bossAlert').checked = options.bossAlert;
        document.getElementById('bossAlertDone').checked = options.bossAlertDone;
        document.getElementById('eventAlert').checked = options.eventAlert;
        document.getElementById('eventAlertDone').checked = options.eventAlertDone;
        document.getElementById('bonusAlert').checked = options.bonusAlert;
        document.getElementById('bonusAlertDone').checked = options.bonusAlertDone;
        document.getElementById('raidAlert').checked = options.raidAlert;
        document.getElementById('clanAlert').checked = options.clanAlert;
        document.getElementById('pmAlert').checked = options.pmAlert;
        document.getElementById('labAlert').checked = options.labAlert;
        document.getElementById('labAlertDone').checked = options.labAlertDone;
        document.getElementById('desktopNotifications').checked = options.desktopNotifications;
        document.getElementById('widgetBattlegrounds').checked = options.widgets.battlegrounds;
        document.getElementById('widgetRemoveHeader').checked = options.widgets.removeHeader;
        document.getElementById('widgetRemoveAuto').checked = options.widgets.removeAuto;
        document.getElementById('widgetTrinketScore').checked = options.widgets.trinketScore;
        document.getElementById('widgetTrinketScoreType').value = options.widgets.trinketScoreType;

        trinket();
    });
}

function trinket() {
    document.getElementById('widgetTrinketScoreType').hidden = !document.getElementById('widgetTrinketScore').checked;
}

document.getElementById('widgetTrinketScore').addEventListener('input', trinket);
document.addEventListener('DOMContentLoaded', set_options);
document.getElementById('save').addEventListener('click', save_options);