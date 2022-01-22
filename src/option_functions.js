export const readLocalStorage = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get({
            soundVolume: .8,
            autoAlertNumber: 10,
            autoAlert: true,
            bossAlert: true,
            eventAlert: true,
            raidAlert: true,
            desktopNotifications: true,
        }, function (result) {
            resolve(result);
        });
    });
};