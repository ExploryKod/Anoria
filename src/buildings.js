import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const fbxLoader = new FBXLoader();
const plyLoader = new PLYLoader();
const playerLoader = new GLTFLoader();

const avatarPath = './resources/monster.glb'
const playerData = {
    url: avatarPath,
    size: 0.8
}



let mixer;
const toolIds = {
    zones: ['grass', 'roads'],
    houses: ['House-Blue', 'House-Red', 'House-Purple', 'House-2Story'],
    tombs:  ['Tombstone-1', 'Tombstone-2', 'Tombstone-3'],
    farms: ['Farm-Wheat', 'Farm-Carrot', 'Farm-Cabbage'],
    markets: ['Market-Stall'],
    nature : []
}

export const toolPrices = {
    zones: [{'grass' : 0}, {'roads': 5}],
    houses: [{'House-Blue': 10}],
    tombs:  [{'Tombstone-1': 2}, {'Tombstone-2': 4}, {'Tombstone-3': 8}],
    farms: [{'Farm-Wheat': 15}, {'Farm-Carrot': 20}, {'Farm-Cabbage': 20}],
    markets: [{'Market-Stall': 10}],
    nature : []
}

export const assetsPrices = Object.freeze({
    // Zones
    'grass': { price: 0, category: 'zones' },
    'roads': { price: 5, category: 'zones' },

    // Houses
    'House-Blue': { price: 10, category: 'houses' },

    // Tombs
    'Tombstone-1': { price: 2, category: 'tombs' },
    'Tombstone-2': { price: 4, category: 'tombs' },
    'Tombstone-3': { price: 8, category: 'tombs' },

    // Farms
    'Farm-Wheat': { price: 15, category: 'farms' },
    'Farm-Carrot': { price: 20, category: 'farms' },
    'Farm-Cabbage': { price: 20, category: 'farms' },

    // Markets
    'Market-Stall': { price: 10, category: 'markets' }
});

let allAssetsNames = [
    {houses: []},
    {nature: []},
    {farm: []},
    {markets: []},
    {other: []}
];
let assetFullName;

const buildingModelsObj = {};

const tombstonesModelsObj = {};
const miscellaneous = [];
const assetNames = [];
const tombstonesNames = [];

const farmsNames = [];
const farmsModelsObj = {};

const marketsNames = [];
const marketsModelsObj = {};

const playerModelObj = {};
let playerAnimations;
const playerNames = [];

const dragonModelObj = {};

let buttonData = [];


const wantedHouses = [
    'House-Blue',
    'House-Red',
    'House-Purple',
    'House-2Story'
]

// Instantiate a loader
const gltfloader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
gltfloader.setDRACOLoader( dracoLoader );


// Load a glTF resource if file with several assets
gltfloader.load(
    // resource URL
    './resources/lowpoly/village_town_assets_v2.glb',
    // called when the resource is loaded
    function ( gltf ) {

        // scene.add( gltf.scene );
        // console.log('pack gltf', gltf);
       
        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

        gltf.scene.traverse(function (child) {
            // console.log(child);
            if (child instanceof THREE.Mesh) {
                // Market Stall Red.002_Material.005_0
                assetFullName = child.userData.name

                assetFullName = assetFullName.replace(/[._\s]/g, '_');
                const firstNamePart = assetFullName.split('_')[0]
                const secondNamePart = assetFullName.split('_')[1]
                const toolName = `${firstNamePart}-${secondNamePart}`

                allAssetsNames.map((asset, index) => {
                    if (asset.houses && toolIds.houses.includes(toolName)) {
                        if (wantedHouses.includes(toolName)) {
                            buttonData.push({
                                text: firstNamePart + ' ' + secondNamePart,
                                tool: toolName,
                                group: firstNamePart
                            })
                        }
                        assetNames.push(`${firstNamePart}-${secondNamePart}`);
                        Object.assign(buildingModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})
                        asset.houses.push({
                            'fullName': child.userData.name,
                            name: `${firstNamePart}-${secondNamePart}`,
                            'mesh': child
                        })
                    } else if (asset.nature && toolIds.nature.includes(toolName)) {
                        asset.nature.push({
                            'fullName': child.userData.name,
                            name: `${firstNamePart}-${secondNamePart}`,
                            'mesh': child
                        })
                    } else if (asset.farm && toolIds.farms.includes(toolName)) {
                        asset.farm.push({
                            'fullName': child.userData.name,
                            name: `${firstNamePart}-${secondNamePart}`,
                            'mesh': child
                        })
                        buttonData.push({
                            text: firstNamePart + ' ' + secondNamePart,
                            tool: toolName,
                            group: firstNamePart
                        })
                        farmsNames.push(`${firstNamePart}-${secondNamePart}`);
                        Object.assign(farmsModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})

                    } else if(asset.markets && toolIds.markets.includes(toolName)) {
                        asset.markets.push({
                            'fullName': child.userData.name,
                            name: `${firstNamePart}-${secondNamePart}`,
                            'mesh': child
                        })
                        buttonData.push({
                            text: firstNamePart + ' ' + secondNamePart,
                            tool: toolName,
                            group: firstNamePart
                        })
                        Object.assign(marketsModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})

                    } else if(asset.other) {
                        if(firstNamePart === 'Tombstone') {
                            buttonData.push({text: firstNamePart+ ' ' + secondNamePart, tool: toolName, group: firstNamePart})
                            tombstonesNames.push(`${firstNamePart}-${secondNamePart}`);
                            Object.assign(tombstonesModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})
                        }

                        asset.other.push({
                            'fullName': child.userData.name,
                            name : `${firstNamePart}-${secondNamePart}`,
                            'mesh': child
                        })
                    }
                })
            }
        });
    },
    // called while loading is progressing
    function ( xhr ) {

        // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

        console.error( 'An error happened' , error);

    }
);

// Load a glTF resource if file with several assets
playerLoader.load(
    playerData.url,
    function(gltf) {
        const model = gltf.scene;
        console.log('AVATAR ', model)

        playerAnimations = gltf.animations;
        const firstNamePart = 'player'
        const secondNamePart = 'hero'
        playerNames.push(`${firstNamePart}-${secondNamePart}`);
        Object.assign(playerModelObj, {[`${firstNamePart}-${secondNamePart}`]: model})
    },
    undefined,
    function(error) {
        console.error('player error', error);
    }
);

console.log('buildingjs - tool ids', toolIds)
console.log('buildingjs - all assets names', allAssetsNames);
console.log('buildingjs - button datas in building', buttonData);
// console.log('player > >> ', playerModelObj)

export {
    toolIds,
    buttonData,
    allAssetsNames,
    assetFullName,
    playerModelObj,
    marketsModelsObj,
    miscellaneous,
    assetNames,
    buildingModelsObj,
    tombstonesModelsObj,
    dragonModelObj,
    farmsModelsObj,
    playerNames,
    playerAnimations
 };