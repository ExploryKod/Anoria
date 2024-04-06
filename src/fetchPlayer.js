import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function fetchPlayer(THREE, loadingPromises, scene, playerAnimationsData, playerData) {
  
    let mixer;
    const loader = new GLTFLoader();
    const clock = new THREE.Clock();
    loadingPromises.push(new Promise((resolve, reject) => {
        loader.load(
            playerData.url,
            function(gltf) {
                const model = gltf.scene;
                console.log('AVATAR ', model)
                model.scale.set(playerData.size, playerData.size, playerData.size);
                model.position.y = playerData.y;
                model.position.x = playerData.x;
                model.position.z = playerData.z;
               

                if(playerAnimationsData.isAnimated) {
                    mixer = new THREE.AnimationMixer(model);
                      // Armature|mixamo.com|Layer0
                    let fileAnimations = gltf.animations;
                    console.log('ANIMATIONS PLAYER', fileAnimations)
                    let animate = THREE.AnimationClip.findByName(fileAnimations, playerAnimationsData.name);
                    let idle = mixer.clipAction(animate);  
                    idle.play();
        
                }

                function update() {

                    if (mixer) {
                        // console.log('updated mixer')
                        mixer.update(clock.getDelta());
                        scene.add(model);
                    } else {
                        scene.add(model);
                    }

                    requestAnimationFrame(update)

                }

            
                update()
                resolve(); // Resolve the promise when the model is loaded
            },
            undefined,
            function(error) {
                console.error(error);
                reject(error); // Reject the promise if there's an error
            }
        );
    }));

}

export function freePromises(loadingPromises) {
        Promise.all(loadingPromises)
    .then(() => {
        console.log('All models loaded successfully');
        // Now you can proceed with other scene initialization tasks if needed
    })
    .catch((error) => {
        console.error('Error loading models:', error);
    });
}