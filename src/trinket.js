const console = require('./console');
const dialer = require('./dialer');

const battlerWeights = {
    1: {name: "Combat Exp Boost", weight: 5},
    2: {name: "Gathering Exp Boost", weight: 0},
    3: {name: "Gold Boost", weight: 25},
    4: {name: "Attribute Boost", weight: 20},
    5: {name: "Mastery Boost", weight: 3},
    6: {name: "Drop Boost", weight: 7},
    7: {name: "Resource Boost", weight: 0},
    8: {name: "Gathering Shards Boost", weight: 1},
    11: {name: "Base Mob Gold", weight: 30},
    12: {name: "Base Resources", weight: 0},
    13: {name: "Double Items", weight: 1},
    14: {name: "Item Rarity", weight: 1},
    21: {name: "Health", weight: 10},
    22: {name: "Attack", weight: 10},
    23: {name: "Defence", weight: 10},
};

const gathererWeights = {
    1: {name: "Combat Exp Boost", weight: 0},
    2: {name: "Gathering Exp Boost", weight: 13},
    3: {name: "Gold Boost", weight: 1},
    4: {name: "Attribute Boost", weight: 1},
    5: {name: "Mastery Boost", weight: 10},
    6: {name: "Drop Boost", weight: 15},
    7: {name: "Resource Boost", weight: 25},
    8: {name: "Gathering Shards Boost", weight: 20},
    11: {name: "Base Mob Gold", weight: 1},
    12: {name: "Base Resources", weight: 30},
    13: {name: "Double Items", weight: 12},
    14: {name: "Item Rarity", weight: 8},
    21: {name: "Health", weight: 0},
    22: {name: "Attack", weight: 0},
    23: {name: "Defence", weight: 0},
};

let gWeights = {};
let gType = undefined;

const bodyObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
                if (node.classList.contains('heading') && node.innerText === 'Trinkets') {

                    dialer.loadTrinkets().then(data => {
                        const table = node.nextElementSibling.nextElementSibling;
                        const content = [...table.rows].map(r => [...r.querySelectorAll('td, th')].map(td => td));
                        let scores = [];

                        data.forEach((t, i) => {
                            let score = {};
                            score.value = 0;
                            score.index = i;

                            t.mods.forEach(r => {
                                score.value += gWeights[r[0]].weight;
                            });
                            scores.push(score);
                        });

                        scores.sort((a, b) => (b.value - a.value));

                        scores.forEach((t, i) => {
                            const cell = document.createElement('td');
                            cell.innerText = (t.value).toString();
                            if (i < 3) {
                                cell.classList.add('green-text');
                            }
                            content[t.index][0].parentNode.prepend(cell);
                        });

                        const helpText = document.createElement('p')
                        helpText.innerText = `IQ Alert Trinket Score (${gType}): \n The highest number indicates the best trinket for ${gType}. The top 3 are shown in green.`;
                        helpText.classList.add('margin-bottom-medium');
                        helpText.classList.add('text-rarity-1');
                        table.parentNode.insertBefore(helpText, table);
                    }).catch(() => {});

                }
            }
        });
    });
});

const observerOptions = {
    attributes: false,
    subtree: true,
    childList: true,
    characterData: false
};

module.exports = {
    load: (type) => {
        gType = type;
        gWeights = (type === 'battler') ? battlerWeights : gathererWeights;
        console.debug('Trinket type: ' + type);
        bodyObserver.observe(document.body, observerOptions)
    }
};

