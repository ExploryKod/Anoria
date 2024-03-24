import * as THREE from 'three';
import { buildingModels, miscellaneous } from './buildings.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { fetchPlayer, freePromises } from './fetchPlayer.js';
let avatarPath = 'public/resources/monster.glb';
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

const textures = {
    'roads': loadTextures('public/resources/textures/grounds/ground_cobblestone5.png'),
    'grass': loadTextures('public/resources/textures/grounds/foliage_privets1.png'),
    'residential1': loadTextures('public/resources/textures/buildings/apartment_block5.png'),
    'residential2': loadTextures('public/resources/textures/buildings/apartment_block6.png'),
    'residential3': loadTextures('public/resources/textures/buildings/apartment_block6.png'),
    'industrial1': loadTextures('public/resources/textures/buildings/building_side3.png'),
    'industrial2': loadTextures('public/resources/textures/buildings/warehouse_front.png'),
    'industrial3': loadTextures('public/resources/textures/buildings/loading_bays.png'),
    'commercial1':  loadTextures('public/resources/textures/buildings/shop_front15.png'),
    'commercial2':  loadTextures('public/resources/textures/buildings/shop_front13.png'),
    'commercial3':  loadTextures('public/resources/textures/buildings/shop_front11.png'),
    'person':  loadTextures('public/resources/textures/buildings/shop_front11.png'),
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
    // 'grass': (x, y) => {
    //     const material = new THREE.MeshLambertMaterial({ map: textures['grass']});
    //     const mesh = new THREE.Mesh(geometry, material);
    //     mesh.userData = { id: 'grass',x,y};
    //     mesh.position.set(x, -0.5, y);
    //     mesh.castShadow = true;
    //     mesh.receiveShadow = true;
    //     return mesh;
    // },

    'grass': (x, y) => createZone(x,y, 'grass', 'grass'),
    'roads': (x, y) => createZone(x,y, 'roads', 'roads'),

    'residential': (x, y) => createZone(x,y, 'residential1', 'residential'),
    'industrial': (x, y) => createZone(x,y, 'industrial1', 'industrial'),
    'commercial': (x, y) => createZone(x,y, 'commercial1', 'commercial'),
    // 'roads': (x, y) => {
    //     const material = new THREE.MeshLambertMaterial({ map: textures['roads'] });
    //     const mesh = new THREE.Mesh(geometry, material);
    //     mesh.userData = { id: 'roads',x,y};
    //     mesh.scale.set(1, 0, 1);
    //     mesh.position.set(x, -0.4, y);
    //     mesh.castShadow = true;
    //     mesh.receiveShadow = true;
    //     return mesh;
    // },
    'house': (x,y) => {
        // const material = new THREE.MeshLambertMaterial({ map: textures['roads'] });
        // const mesh = new THREE.Mesh(geometry, material);
        // mesh.userData = { id: 'roads',x,y};
        // mesh.scale.set(1, 1, 1);
        // mesh.position.set(x, -0.5, y);
        // mesh.castShadow = true;
        // mesh.receiveShadow = true;
        // return mesh;
        console.log('DIVERS MODELS >>>> ', miscellaneous);
        console.log('BUILDINGS MODELS >>>> ', buildingModels);
        if(buildingModels.length) {
            let placerPos = new THREE.Vector3(x, 0, y);
            let objGltf = buildingModels[10].clone()
       
            objGltf.name = `house-${x}-${y}`;
            objGltf.position.set(x, 0, y);
            objGltf.scale.set(0.002,0.002,0.002)
            objGltf.rotation.set(THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(0));
            
            objGltf.userData = { id:objGltf.name, x, y }
            return objGltf;
        }
     
       
    }
}

export function createAsset(assetId, x, y) {
   if(assetId in assets) {
       return assets[assetId](x, y);
   } else {
       console.warn(`Asset ${assetId} does not exist`);
       return undefined
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