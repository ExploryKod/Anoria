import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const fbxLoader = new FBXLoader();
const plyLoader = new PLYLoader();
const buildingModels = [];
const miscellaneous = [];

// Instantiate a loader
const gltfloader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
gltfloader.setDRACOLoader( dracoLoader );

// Load a glTF resource that is alone (not a file with several assets)
// gltfloader.load(
//     // resource URL
//     '../public/resources/lowpoly/Building.glb',
//     // called when the resource is loaded
//     function ( gltf ) {

//         // scene.add( gltf.scene );
//         buildingModels.push(gltf.scene)
//         gltf.animations; // Array<THREE.AnimationClip>
//         gltf.scene; // THREE.Group
//         gltf.scenes; // Array<THREE.Group>
//         gltf.cameras; // Array<THREE.Camera>
//         gltf.asset; // Object

//         gltf.scene.traverse(function (child) {
//             console.log(child);
//             if (child instanceof THREE.Mesh) {
//                 const texture = new THREE.TextureLoader().load("../models/Textures/Building/Ground/Building1_Ground_DefaultMaterial_AlbedoTransparency.png");
//                 const normal = new THREE.TextureLoader().load("../models/Textures/Building/Ground/Building1_Ground_DefaultMaterial_Normal.png");
//                 const metal = new THREE.TextureLoader().load("../models/Textures/Building/Ground/Building1_Ground_DefaultMaterial_MetallicSmoothness.png");
//                 const material = new THREE.MeshPhongMaterial();
//                 material.color = new THREE.Color(1, 5, 1);
//                 material.shininess = 1000;
//                 material.map = texture;
//                 material.reflectivity = 1;
//                 material.metalnessMap = metal;
//                 material.specularMap = metal;
//                 material.emissive = new THREE.Color(1, 1, 0.5);
//                 material.emissiveMap = metal;
//                 material.emissiveIntensity = 0;
//                 material.metalness = .2;
//                 material.normalMap = normal;
//                 child.material = material;
//                 child.position.set(0, 0, 0);
//                 child.castShadow = true;
//                 child.receiveShadow = true;
//             }
//         });


//     },
//     // called while loading is progressing
//     function ( xhr ) {

//         console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

//     },
//     // called when loading has errors
//     function ( error ) {

//         console.log( 'An error happened' );

//     }
// );


// Load a glTF resource if file with several assets
gltfloader.load(
    // resource URL
    '../public/resources/lowpoly/low_poly_desert_village.glb',
    // called when the resource is loaded
    function ( gltf ) {

        // scene.add( gltf.scene );
        console.log('pack gltf', gltf);
       
        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

        gltf.scene.traverse(function (child) {
            console.log(child);
            if (child instanceof THREE.Mesh) { 
                const assetFullName = child.userData.name
                const firstNamePart = assetFullName.split('_')[0]
                switch(firstNamePart) {
                    case 'house':
                        buildingModels.push(child)
                        break;
                    default:
                        miscellaneous.push(child)
                        break
                }
            
                
            }
        });


    },
    // called while loading is progressing
    function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

        console.log( 'An error happened' );

    }
);

export { 
    buildingModels,
    miscellaneous
 };