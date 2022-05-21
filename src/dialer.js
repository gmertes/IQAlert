function dial(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            "headers": {
                "Accept": "application/json, text/plain, */*"
            },
            "method": "GET"
        }).then(data => data.json()).then(data => {
            if (data) {
                resolve(data);
            } else {
                reject(undefined);
            }
        });
    });
}

const dialer = {
    loadBattlegrounds: () => dial("https://www.iqrpg.com/php/clan.php?mod=loadBattlegrounds"),
    loadInitialData: () => dial("https://www.iqrpg.com/php/_load_initial_data.php"),
}

module.exports = dialer;