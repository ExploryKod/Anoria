import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const fbxLoader = new FBXLoader();
const plyLoader = new PLYLoader();
const playerLoader = new GLTFLoader();

const avatarPath = './resources/hero.glb'
const playerData = {
    url: avatarPath,
    size: 0.8
}



let mixer;
const toolIds = {
    zones: ['grass', 'roads'],
    houses: ['House-Blue', 'House-Red', 'House-Purple'],
    tombs:  ['Tombstone-1', 'Tombstone-2', 'Tombstone-3'],
    farms: ['Farm-Wheat', 'Farm-Carrot'],
    nature : []
}

let allAssetsNames = [
    {houses: []},
    {nature: []},
    {farm: []},
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

const playerModelObj = {};
let playerAnimations;
const playerNames = [];

const dragonModelObj = {};

let buttonData = [];

const wantedHouses = [
    'House-Blue',
    'House-Red',
    'House-Purple'
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
    './resources/lowpoly/village__town_assets.glb',
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
                assetFullName = child.userData.name
                const firstNamePart = assetFullName.split('_')[0]
                const secondNamePart = assetFullName.split('_')[1]
                const toolName = `${firstNamePart}-${secondNamePart}`

                allAssetsNames.map((asset, index) => {
                    if(asset.houses && toolIds.houses.includes(toolName)) {
                        if(wantedHouses.includes(toolName)) {
                            buttonData.push({text: firstNamePart+ ' ' + secondNamePart, tool: toolName, group: firstNamePart})
                        }
                        assetNames.push(`${firstNamePart}-${secondNamePart}`);
                        Object.assign(buildingModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})
                        asset.houses.push({
                            'fullName':child.userData.name,
                            name : `${firstNamePart}-${secondNamePart}` ,
                            'mesh': child})
                    } else if(asset.nature && toolIds.nature.includes(toolName)) {
                        asset.nature.push({
                            'fullName':child.userData.name,
                            name : `${firstNamePart}-${secondNamePart}` ,
                            'mesh': child})
                    } else if(asset.farm && toolIds.farms.includes(toolName)) {
                        asset.farm.push({
                            'fullName':child.userData.name,
                            name : `${firstNamePart}-${secondNamePart}` ,
                            'mesh': child})
                        buttonData.push({text: firstNamePart+ ' ' + secondNamePart, tool: toolName, group: firstNamePart})
                        farmsNames.push(`${firstNamePart}-${secondNamePart}`);
                        Object.assign(farmsModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})

                    }else if(asset.other) {
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

                // console.log('ASSETS NAMES => ', assetNames)
                // console.log('TOMBSTONE NAMES => ', tombstonesNames)
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
        // model.traverse((child) => {
        //     if (child.isMesh) {
        //         child.castShadow = true;
        //         child.receiveShadow = true;
        //     }
        // });
        //
        // if(playerAnimationsData.isAnimated) {
        //     mixer = new THREE.AnimationMixer(model);
        //     // Armature|mixamo.com|Layer0
        //     let fileAnimations = gltf.animations;
        //     console.log('ANIMATIONS PLAYER', fileAnimations)
        //     let animate = THREE.AnimationClip.findByName(fileAnimations, playerAnimationsData.name);
        //     let idle = mixer.clipAction(animate);
        //     idle.play();
        // }
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




// Animals

// gltfloader.load(
//     // resource URL
//     './resources/lowpoly/animals_pack_medium.glb',
//     // called when the resource is loaded
//     function ( gltf ) {
//
//         // scene.add( gltf.scene );
//         console.log('pack gltf', gltf);
//
//         gltf.animations; // Array<THREE.AnimationClip>
//         gltf.scene; // THREE.Group
//         gltf.scenes; // Array<THREE.Group>
//         gltf.cameras; // Array<THREE.Camera>
//         gltf.asset; // Object
//
//         gltf.scene.traverse(function (child) {
//             console.log(child);
//             if (child instanceof THREE.Mesh) {
//                 const animalFullName = child.userData.name
//                 const firstNamePart = animalFullName.split('_')[0]
//                 const secondNamePart = animalFullName.split('_')[1]
//
//                 console.log('ANIMAL NAMES => ', animalsNames)
//
//                 switch(firstNamePart) {
//                     case 'Tiger.1':
//                         animalsNames.push(`${firstNamePart}-${secondNamePart}`);
//                         animalsModels.push(child)
//                         Object.assign(buildingModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})
//                         break;
//                     case 'Tombstone':
//                         animalsNames.push(`${firstNamePart}-${secondNamePart}`);
//                         animalsModels.push(child)
//                         Object.assign(animalsModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})
//                         break;
//                     default:
//                         console.log(miscellaneous)
//                         miscellaneous.push(child)
//                         break
//                 }
//             }
//         });
//
//         console.log('buildings js - ANIMAL OBJECTS => ', animalsModelsObj)
//     },
//     // called while loading is progressing
//     function ( xhr ) {
//
//         // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
//
//     },
//     // called when loading has errors
//     function ( error ) {
//
//         console.log( 'An error happened' );
//
//     }
// );

// console.log('all assets names', allAssetsNames);

// console.log('player > >> ', playerModelObj)

export {
    toolIds,
    buttonData,
    allAssetsNames,
    assetFullName,
    playerModelObj,
    miscellaneous,
    assetNames,
    buildingModelsObj,
    tombstonesModelsObj,
    dragonModelObj,
    farmsModelsObj,
    playerNames,
    playerAnimations
 };