export const readLocalStorage = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get({
            soundVolume: .7,
            autoAlertNumber: 10,
            autoAlert: true,
            raidAlert: true,
            bonusAlert: true,
            bossAlert: true,
            eventAlert: true,
            bonusAlertDone: false,
            bossAlertDone: false,
            eventAlertDone: false,
            desktopNotifications: true,
        }, function (result) {
            resolve(result);
        });
    });
};