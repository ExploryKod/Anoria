import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const fbxLoader = new FBXLoader();
const plyLoader = new PLYLoader();
const buildingModels = [];
const buildingModelsObj = {};

const tombstonesModels = [];
const tombstonesModelsObj = {};
const miscellaneous = [];
const assetNames = [];
const tombstonesNames = [];

const animalsNames = [];
const animalsModels = [];
const animalsModelsObj = {};

const dragonModelObj = {};

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
                const assetFullName = child.userData.name
                const firstNamePart = assetFullName.split('_')[0]
                const secondNamePart = assetFullName.split('_')[1]

                // console.log('ASSETS NAMES => ', assetNames)
                // console.log('TOMBSTONE NAMES => ', tombstonesNames)
                       
                switch(firstNamePart) {
                    case 'House':
                        assetNames.push(`${firstNamePart}-${secondNamePart}`);
                        buildingModels.push(child)
                        Object.assign(buildingModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})
                        break;
                    case 'Tombstone':
                        tombstonesNames.push(`${firstNamePart}-${secondNamePart}`);
                        tombstonesModels.push(child)
                        Object.assign(tombstonesModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})
                        break;
                    default:
                        // console.log(miscellaneous)
                        // miscellaneous.push(child)
                        break
                }
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

gltfloader.load(
    // resource URL
    './resources/lowpoly/dragon.glb',
    // called when the resource is loaded
    function ( gltf ) {

        // scene.add( gltf.scene );
        console.log('DRAGON GLTF', gltf);

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

        gltf.scene.traverse(function (child) {
            console.log('dragon', child);
            if (child instanceof THREE.Mesh) {
                const animalFullName = child.userData.name
                const firstNamePart = animalFullName.split('_')[0]
                const secondNamePart = animalFullName.split('_')[1]

                console.log('ANIMAL NAMES => ', animalsNames)

                switch(firstNamePart) {
                    case 'dragon':
                        animalsNames.push(`${firstNamePart}-${secondNamePart}`);
                        animalsModels.push(child)
                        Object.assign(dragonModelObj, {[`${firstNamePart}-${secondNamePart}`]: child})
                        break;
                    case 'Tombstone':
                        animalsNames.push(`${firstNamePart}-${secondNamePart}`);
                        animalsModels.push(child)
                        Object.assign(animalsModelsObj, {[`${firstNamePart}-${secondNamePart}`]: child})
                        break;
                    default:
                        console.log('dragons miscenallous', miscellaneous)
                        miscellaneous.push(child)
                        break
                }
            }
        });
        console.log('buildings js - DRAGON OBJECTS => ', animalsModelsObj)
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

export {
    animalsModelsObj,
    animalsModels,
    animalsNames,
    buildingModels,
    miscellaneous,
    assetNames,
    buildingModelsObj,
    tombstonesModelsObj,
    dragonModelObj
 };