import { readLocalStorage } from './option_functions.js';

export function save_options() {
    chrome.storage.sync.set({
        soundVolume: document.getElementById('soundVolume').value/10,
        autoAlertNumber: parseInt(document.getElementById('autoAlertNumber').value),
        autoAlert: document.getElementById('autoAlert').checked,
        bossAlert: document.getElementById('bossAlert').checked,
        eventAlert: document.getElementById('eventAlert').checked,
        raidAlert: document.getElementById('raidAlert').checked,
        desktopNotifications: document.getElementById('desktopNotifications').checked,
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = "Options saved (refresh IQ).";
        setTimeout(function() {
            status.textContent = '';
        }, 2500);
    });
}

async function set_options(){
    var options = await readLocalStorage();
    document.getElementById('soundVolume').value = options.soundVolume*10;
    document.getElementById('autoAlertNumber').value = options.autoAlertNumber;
    document.getElementById('autoAlert').checked = options.autoAlert;
    document.getElementById('bossAlert').checked = options.bossAlert;
    document.getElementById('eventAlert').checked = options.eventAlert;
    document.getElementById('raidAlert').checked = options.raidAlert;
    document.getElementById('desktopNotifications').checked = options.desktopNotifications;
}

document.addEventListener('DOMContentLoaded', set_options);
document.getElementById('save').addEventListener('click', save_options);