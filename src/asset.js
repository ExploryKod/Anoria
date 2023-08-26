import * as THREE from 'three';
// factory pattern 

// Object of anonymous functions for creating assets > assets library
const geometry = new THREE.BoxGeometry(1,1,1);
const assets = {
    'grass': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'grass',x,y};
        mesh.position.set(x, -0.5, y);
        return mesh;
    },
    'residential': (x, y) => {    
        const material = new THREE.MeshLambertMaterial({ color: 0x115995 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'residential',x,y};
        mesh.position.set(x, 0.5, y);
        return mesh;
    },
    'industrial': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ color: 0x777777 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'industrial',x,y};
        // size of the building
        // mesh.scale.set(1, 2, 1);
        // position of the building
        mesh.position.set(x, 0.5, y);
        return mesh;
    },
    'commercial': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ color: 0x123545 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'commercial',x,y};
        // mesh.scale.set(1, 3, 1);
        mesh.position.set(x, 0.5, y);
        return mesh;
    },
    'roads': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'roads',x,y};
        // mesh.scale.set(1, 3, 1);
        mesh.position.set(x, 0.05, y);
        return mesh;
    }
}

export function createAsset(assetId, x, y) {
   if(assetId in assets) {
        console.log(assets[assetId](x, y));
       return assets[assetId](x, y);
   } else {
       console.warn(`Asset ${assetId} does not exist`);
   }
}