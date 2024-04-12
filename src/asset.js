import * as THREE from 'three';
import {
    toolIds,
    miscellaneous,
    assetNames,
    buildingModelsObj,
    tombstonesModelsObj,
    farmsModelsObj,
    marketsModelsObj,
    dragonModelObj,
    assetFullName,
    allAssetsNames,
    playerModelObj,
    playerNames,
    playerAnimations
} from './buildings.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { fetchPlayer, freePromises } from './fetchPlayer.js';
let avatarPath = '/resources/monster.glb';
const gltfLoader = new GLTFLoader();

// Object of anonymous functions for creating assets > assets library
const geometry = new THREE.BoxGeometry(1,1,1);
const loader = new THREE.TextureLoader();
let loadingPromises = [];
function loadTextures(path) {
    const texture = loader.load(path)
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1,1);
    return texture;
}
const root ="./";
export const textures = {
    'roads': loadTextures(`${root}resources/textures/grounds/ground_cobblestone5.png`),
    'grass': loadTextures(`${root}resources/textures/grounds/grass_rough2.png`),
}

export function changeMeshMaterial(mesh, texture) {
    mesh.traverse((obj) => {
        if (obj.material) {
            obj.material = new THREE.MeshLambertMaterial({
                map: texture,
            })
            obj.receiveShadow = true;
            obj.castShadow = true;
        }
    });
}

export function changeMeshColor(mesh, color) {
    mesh.traverse((obj) => {
        if (obj.material) {
            obj.material = new THREE.MeshLambertMaterial({color: color})
            obj.receiveShadow = true;
            obj.castShadow = true;
        }
    });
}

function getRoof(topTexture = '') {
    if(topTexture !== '') {
        return new THREE.MeshLambertMaterial({ map: textures[topTexture].clone() })
    } else {
        return new THREE.MeshLambertMaterial({ color: 0x333333 })
    }
}

function getBuildingSides(textureId) {
    return new THREE.MeshLambertMaterial({ map: textures[textureId].clone() })
}

function getRoadsSides() {
    return new THREE.MeshLambertMaterial({ color: 0x444444 })
}

function getGrassSides() {
    return new THREE.MeshLambertMaterial({ color: 0x004444 })
}

const playerAnimationsData = {
    name: 'Armature|mixamo.com|Layer0',
    isAnimated: true
}

// Initialize assets as an empty object
let assets = {
    'player-hero': (x, y, z=0) => createCitizen(x, y, z, 0.8, 'player-hero', playerModelObj, playerAnimationsData)
};

// Iterate over the dynamicData array
toolIds.zones.forEach((toolId) => {
    // Populate the assets object with dynamic data
    assets[toolId] = (x, y) => createZone(x, y, toolId, toolId);
});

toolIds.houses.forEach((toolId) => {
    // Populate the assets object with dynamic data
    assets[toolId] = (x, y, z=0) => createBuilding(x, y, z, 0.5, toolId, buildingModelsObj);
});

toolIds.tombs.forEach((toolId) => {
    assets[toolId] = (x,y, z=0) => createBuilding(x,y,z, 0.5, toolId, tombstonesModelsObj);
})

toolIds.farms.forEach((toolId) => {
    assets[toolId] = (x,y, z=0) => createBuilding(x,y,z, 1, toolId, farmsModelsObj);
})

toolIds.markets.forEach((toolId) => {
    console.log(toolId)
    assets[toolId] = (x, y, z=0) => createBuilding(x, y, z, 1, toolId, marketsModelsObj)
})

export function createAsset(assetId, x, y) {

   if(assetId in assets) {
       return assets[assetId](x, y);
   } else {
       console.warn(`Asset ${assetId} does not exist`);
       return undefined
   }
}



function createCitizen(x, y, z, size, meshName, playersModels, playerAnimationsData) {
    const model3D = playersModels[meshName].clone()
    let mixer;
    let placerPos = new THREE.Vector3(x, y, z);
    model3D.scale.set(size, size, size);
    model3D.position.set(placerPos.x, placerPos.z, placerPos.y);
    model3D.name = meshName
    model3D.userData = { id:  meshName, x, y, vicinities: [x-1, y-1]}
    if(playerAnimationsData.isAnimated) {
        mixer = new THREE.AnimationMixer(model3D);
        // Armature|mixamo.com|Layer0

        console.log('ANIMATIONS PLAYER', playerAnimations)
        let animate = THREE.AnimationClip.findByName(playerAnimations, playerAnimationsData.name);
        let idle = mixer.clipAction(animate);
        idle.play();
    }
    return { model: model3D, mixer: mixer }
}

function createBuilding(x, y, z, size, meshName, objectsData) {
    console.log('ASSET NAME', assetFullName)

    let placerPos = new THREE.Vector3(x, y, z);
    const object3D = objectsData[meshName].clone()

    object3D.name = `${objectsData.name}-${x}-${y}`
    object3D.position.set(placerPos.x, placerPos.z, placerPos.y);
    object3D.scale.set(size,size,size);
    object3D.rotation.set(THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(180));
    object3D.userData = { id:  meshName, x, y, vicinities: [x-1, y-1]}
    return object3D

}

export function changeBuildingSides(mesh) {
    let roof;
    let sides;
    let buildingSidesArray = [];
    let materialSides = [];

    roof = getRoof()
    sides =  getBuildingSides('roads')
    buildingSidesArray = [sides, sides,roof, roof,sides, sides]
    materialSides = buildingSidesArray
    mesh = new THREE.Mesh(geometry, materialSides)
    mesh.material.forEach(material =>  material.color.set(0xff00ff))
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createZone(x, y, textureName = 'residential1', buildingId='residential') {
    let roof;
    let sides;
    let mesh;
    let buildingSidesArray;
    let materialSides;
    let material;

    switch(buildingId) {
        case 'roads':
            roof = getRoof('roads')
            sides = getRoadsSides()
            material = new THREE.MeshLambertMaterial({ map: textures['roads'] });
            mesh = new THREE.Mesh(geometry, material);
            mesh.userData = { id: 'roads',x,y};
            mesh.scale.set(1, 1, 1);
            mesh.position.set(x, -0.5, y);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            break;
        case 'grass':
            roof = getRoof('grass')
            sides =  getGrassSides()
            buildingSidesArray = [sides, sides,roof, roof,sides, sides]
            materialSides = buildingSidesArray
            mesh = new THREE.Mesh(geometry, materialSides)
            mesh.userData = { id:buildingId, x, y }
            mesh.material.forEach(material =>  material.map?.repeat.set(1,1))
            mesh.scale.set(1, 1, 1);
            mesh.position.set(x, -0.5, y);
            break;
        default:
            roof = getRoof()
            sides =  getBuildingSides(textureName) 
            buildingSidesArray = [sides, sides,roof, roof,sides, sides]
            materialSides = buildingSidesArray
            mesh = new THREE.Mesh(geometry, materialSides)
            mesh.userData = { id:buildingId, x, y }
            mesh.material.forEach(material =>  material.map?.repeat.set(1,1))
            mesh.scale.set(1, 1, 1);
            mesh.position.set(x, 0.5, y);    
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh
}