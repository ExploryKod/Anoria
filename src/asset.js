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
    'building-1': (x, y) => {    
        const material = new THREE.MeshLambertMaterial({ color: 0x777777 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'building-1',x,y};
        mesh.position.set(x, 0.5, y);
        return mesh;
    },
    'building-2': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ color: 0x777562 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'building-2',x,y};
        // size of the building
        mesh.scale.set(1, 2, 1);
        // position of the building
        mesh.position.set(x, 1, y);
        return mesh;
    },
    'building-3': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ color: 0x777852 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'building-3',x,y};
        mesh.scale.set(1, 3, 1);
        mesh.position.set(x, 1.5, y);
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