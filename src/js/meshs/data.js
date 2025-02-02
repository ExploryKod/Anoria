import { loadTextures } from "./asset.js";

export const baseUrl = import.meta.env.BASE_URL;


// export const texturesPath = [
//     { "roads": `${baseUrl}resources/textures/grounds/ground_cobblestone5.png` },
//     { "grass": `${baseUrl}resources/textures/grounds/grass_rough2.png` },
//     { "decal": `${baseUrl}resources/textures/skies/plain_sky.jpg` },
//     { "no-roads": `${baseUrl}resources/textures/status/no-road.png` },
//     { "no-power": `${baseUrl}resources/textures/status/no-road.png` },
//     { "base": `${baseUrl}resources/textures/maps/base.png` },
//     { "specular": `${baseUrl}resources/textures/maps/specular.png` },
//     { "grid": `${baseUrl}resources/textures/maps/grid.png` }
// ];

export const textures = {
    'roads': loadTextures(`${baseUrl}/resources/textures/grounds/ground_cobblestone5.png`),
    'grass': loadTextures(`${baseUrl}/resources/textures/grounds/grass_rough2.png`),
    'decal': loadTextures(`${baseUrl}/resources/textures/skies/plain_sky.jpg`),
    'no-roads': loadTextures(`${baseUrl}/resources/textures/status/no-road.png`),
    'no-power': loadTextures(`${baseUrl}/resources/textures/status/no-road.png`),
    'base' : loadTextures(`${baseUrl}/resources/textures/maps/base.png`),
    'specular' : loadTextures(`${baseUrl}/resources/textures/maps/specular.png`),
    'grid': loadTextures(`${baseUrl}/resources/textures/maps/grid.png`)
}

export const toolIds = {
    zones: ['grass', 'roads'],
    houses: ['House-Blue', 'House-Red', 'House-Purple', 'House-2Story'],
    tombs:  ['Tombstone-1', 'Tombstone-2', 'Tombstone-3'],
    farms: ['Farm-Wheat', 'Farm-Carrot', 'Farm-Cabbage', 'Windmill-001'],
    markets: ['Market-Stall'],
    nature : []
}

export const assetsPrices = Object.freeze({
    // Zones
    'grass': { price: 0, category: 'zones' },
    'roads': { price: 5, category: 'zones' },

    // Houses
    'House-Blue': { price: 10, category: 'houses' },
    'House-Red': { price: 10, category: 'houses' },
    'House-Purple': { price: 10, category: 'houses' },
    'House-2Story': { price: 20, category: 'houses' },

    // Tombs
    'Tombstone-1': { price: 2, category: 'tombs' },
    'Tombstone-2': { price: 4, category: 'tombs' },
    'Tombstone-3': { price: 8, category: 'tombs' },

    // Farms
    'Farm-Wheat': { price: 10, category: 'farms' },
    'Farm-Carrot': { price: 20, category: 'farms' },
    'Farm-Cabbage': { price: 30, category: 'farms' },

    // Markets
    'Market-Stall': { price: 10, category: 'markets' }
});

export const wantedHouses = [
    'House-Blue',
    'House-Red',
    'House-Purple',
    'House-2Story'
]
