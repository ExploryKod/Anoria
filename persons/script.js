import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(function() {
  let scene, renderer, camera, model, mixer, clock= new THREE.Clock(), idle;
  let isMovingRight = false; // Track if 'D' key is pressed


  init();

  function init() {
    const MODEL_PATH = '../public/resources/RobotExpressive.glb';
    const canvas = document.querySelector('#c');
    const backgroundColor = 0xf1f1f1;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    camera.position.x = 0;
    camera.position.y = -3;

    const loader = new GLTFLoader();

    loader.load(
      MODEL_PATH,
      function(gltf) {
        model = gltf.scene;
        let fileAnimations = gltf.animations;
        model.scale.set(1, 1, 1);
        model.position.y = -1;
        
        mixer = new THREE.AnimationMixer(model);
        let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'Run');
        console.log('idleAnim', THREE.AnimationClip)
        idle = mixer.clipAction(idleAnim);
        console.log('idle', idle)
        if(idle) {
          idle.play();
        }
      

        scene.add(model);
      },
      undefined,
      function(error) {
        console.error(error);
      }
    );

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);


    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const d = 8.25;
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    scene.add(dirLight);

    const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      shininess: 0
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -11;
    scene.add(floor);

    update();
  }

  function update() {

    if (isMovingRight) {
        // If 'D' key is pressed, move the character to the right
        model.position.x += 0.1; // Adjust speed as needed
    }

    if (mixer) {
      mixer.update(clock.getDelta());
    }
  
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const needResize =
      canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function handleKeyDown(event) {
    // Check if 'D' key is pressed
    if (event.key === 'D' || event.key === 'd') {
      isMovingRight = true;
    }
  }

  function handleKeyUp(event) {
    // Check if 'D' key is released
    if (event.key === 'D' || event.key === 'd') {
      isMovingRight = false;
    }
  }
})();
