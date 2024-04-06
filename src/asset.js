import * as THREE from 'three';
import { buildingModels, miscellaneous, assetNames, buildingModelsObj, tombstonesModelsObj, dragonModelObj } from './buildings.js';
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
const textures = {
    'roads': loadTextures(`${root}resources/textures/grounds/ground_cobblestone5.png`),
    'grass': loadTextures(`${root}resources/textures/grounds/grass_rough2.png`),
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

const assets = {

    'grass': (x, y) => createZone(x,y, 'grass', 'grass'),
    'roads': (x, y) => createZone(x,y,'roads', 'roads'),

    'House-Blue': (x,y, z=0) => createBuilding(x,y,z, 'House-Blue', buildingModelsObj),
    'House-Red' : (x,y, z=0) => createBuilding(x,y,z, 'House-Red', buildingModelsObj),
    'House-Purple' : (x,y, z=0) => createBuilding(x,y,z, 'House-Purple', buildingModelsObj),
    'Tombstone-1' : (x,y, z=0) => createBuilding(x,y,z, 'Tombstone-1', tombstonesModelsObj),

    'Dragon' : (x,y, z=0) => createOneAnimal(x,y,z, 'Dragon',  dragonModelObj)
}




export function createAsset(assetId, x, y) {
   if(assetId in assets) {
       return assets[assetId](x, y);
   } else {
       console.warn(`Asset ${assetId} does not exist`);
       return undefined
   }
}

function createOneAnimal(x, y , z, meshName, objectsData) {
    let placerPos = new THREE.Vector3(x, y, z);
    const object3D = objectsData.clone()

    object3D.name = `${objectsData.name}-${x}-${y}`;
    object3D.position.set(placerPos.x, placerPos.z, placerPos.y);
    object3D.scale.set(0.5,0.5,0.5);
    object3D.rotation.set(THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(180));
    object3D.userData = { id:  objectsData.name, x, y}

    return object3D

}

function createBuilding(x, y, z, meshName, objectsData) {
    
    if(buildingModels.length) {
        let placerPos = new THREE.Vector3(x, y, z);
        const object3D = objectsData[meshName].clone()
        
        object3D.name = `${objectsData.name}-${x}-${y}`
        object3D.position.set(placerPos.x, placerPos.z, placerPos.y);
        object3D.scale.set(0.5,0.5,0.5);
        object3D.rotation.set(THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(180));
        object3D.userData = { id:  objectsData.name, x, y}
        
        return object3D  
    }
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