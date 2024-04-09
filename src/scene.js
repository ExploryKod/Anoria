import * as THREE from 'three';
import { createCamera } from './camera.js';
import { createAsset } from './asset.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {fetchPlayer, freePromises, playerMesh} from "./fetchPlayer.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
const SKY_URL = './resources/textures/skies/plain_sky.jpg';
let mixer;
const loader = new GLTFLoader();
const clock = new THREE.Clock();

export function createScene() {
    const gameWindow = document.getElementById('game-window');
    const displayPop = document.querySelector('.info-panel .display-pop')
    const displayNeed = document.querySelector('.info-panel .display-need')
    const displayLife = document.querySelector('.info-panel .display-life')
    const displayFood = document.querySelector('.info-panel .display-food')
    const displayDead = document.querySelector('.info-panel .display-dead')
    const displayDelay = document.querySelector('.info-panel .display-delay')
    const displaySurplus = document.querySelector('.info-panel .display-surplus')

    // Accounts
    const displayFunds = document.querySelector('.info-panel .display-funds')


    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x79845);

    let skyLoader = new THREE.TextureLoader();
    skyLoader.load(
        // URL of the image
        SKY_URL,
        function (texture) {
            // Set the scene's background to the loaded texture
            scene.background = texture;
        }
    );

    const camera = createCamera(gameWindow);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const controls = new OrbitControls(camera.camera, renderer.domElement);
    gameWindow.appendChild(renderer.domElement);

    // Selections d'un objet
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedObject = undefined;
    // Référence une fonction appelée si un objet est sélectionné
    let onObjectSelected = undefined;

    let terrain = [];
    let buildings = [];
    let loadingPromises = [];
    let population  = 0;
    let need = 0;
    let food = 0;
    let life = 0;
    let deads = 0;
    let turn = 0;
    let delay = 0;

    let sales = true;

    let surplus = 0;
    let funds = 0;

    const houses = ['House-Red', 'House-Purple', 'House-Blue']
    const farms = ['Farm-Wheat', 'Farm-Carrot']

    function initialize(city) { 
        scene.clear();
        terrain = [];
        buildings = [];
        loadingPromises = [];
       
        for(let x = 0; x < city.size; x++) {
            let column = [];
            for(let y = 0; y < city.size; y++) {
                // Grass
                const terrainId = city.tiles[x][y].terrainId;
                const mesh = createAsset(terrainId, x, y);
                mesh.name = terrainId;
                scene.add(mesh);
                column.push(mesh);  
            }
            terrain.push(column);

            // create empty array for buildings : an array of undefined values
            buildings.push([...Array(city.size)]);
            setUpLights();
        }

        displayPop.textContent = population.toString()
        // displayNeed.textContent = need.toString()
        // displayLife.textContent = life.toString()
        displayFood.textContent = food.toString()
        displayDead.textContent = deads.toString()
        displayFunds.textContent = funds.toString()
        displayDelay.textContent = delay.toString()
        // displaySurplus.textContent = surplus.toString()
        // addPlayerToScene(4, 0, 4)

    }

    function update(city, time=0) {
        // --- BOUCLE SUR LA VILLE ----
        for(let x = 0; x < city.size; x++) {
            for(let y = 0; y < city.size; y++) {
                // console.log(`the city at y ${y}- x ${x} : >>`, city)
              const currentBuildingId = buildings[x][y]?.userData?.id;
              const newBuildingId = city.tiles[x][y].buildingId;

            //  Remove a building from the scene if a player remove a building
            if(!newBuildingId && currentBuildingId) {

                console.log('delete this building', currentBuildingId);
                if(houses.includes(currentBuildingId)) {
                    funds -= 1
                    population -= 1
                    deads += 1
                }
                if(farms.includes(currentBuildingId)) {
                    funds -= 1;
                    food -= 1
                }
                scene.remove(buildings[x][y]);
                buildings[x][y] = undefined;
            }

            // if data model has changed, update the mesh
            if(newBuildingId && (newBuildingId !== currentBuildingId)) {
                scene.remove(buildings[x][y]);
                buildings[x][y] = createAsset(newBuildingId, x, y);

                if(houses.includes(newBuildingId)) {
                    funds -= 1;
                    population += 1
                }

                if(farms.includes(newBuildingId)) {
                    funds -= 1
                    food += 1
                }

                if(newBuildingId === 'player-hero') {
                    // addPlayerToScene(x,0,y)
                } else {
                    scene.add(buildings[x][y]);
                }
                }
            }

        }
        // --- FIN BOUCLE SUR LA VILLE ----
        console.log(population)
        console.log(food)

        if(population > 0 && (food < population)) {
            console.log('famine')
            while(food < population) {
                population -= 1;
                deads += 1;
            }
        }

        if(population > 0 && (food > population)) {
            console.log('famine')
            while(food > population) {
                population += 1;
            }
        }


        displayDelay.textContent = delay.toString()
        displayPop.textContent = population.toString()
        displayFood.textContent = food.toString()
        displayFunds.textContent = funds.toString()
        displayDead.textContent = deads.toString()

    }

    // function updatePlayer(mixer, model) {
    //
    //     if (mixer) {
    //         console.log('updated mixer')
    //         mixer.update(clock.getDelta());
    //         scene.add(model);
    //     } else {
    //         scene.add(model);
    //     }
    //
    //     requestAnimationFrame(update)
    //
    // }

    function addPlayerToScene(x=0, y=0, z=0) {
        const avatarPath = './resources/dragon.glb'
        const playerData = {
            url: avatarPath,
            x: x,
            y: y,
            z: z,
            size: 0.8
        }

        const playerAnimationsData = {
            name: 'Flying',
            isAnimated: true
        }
        if(playerMesh) {
            playerMesh.userData = {id: 'player-hero', x, y}
        }

        fetchPlayer(THREE, loadingPromises, scene, playerAnimationsData, playerData)
        freePromises(loadingPromises)
    }
   

    function setUpLights() {
        const lights = [
            new THREE.AmbientLight(0xffffff, 0.03),
            new THREE.DirectionalLight(0x999999, 0.05),
            new THREE.DirectionalLight(0x999999, 0.05),
            new THREE.DirectionalLight(0x999999, 0.05)
        ];

        lights[1].position.set(0, 1, 0);
        lights[2].position.set(0, 1, 0);
        lights[3].position.set(0, 1, 0);

        // lights[1].castShadow = true;
        lights[1].shadow.camera.left = -10;
        lights[1].shadow.camera.right = 10;
        lights[1].shadow.camera.top = 0;
        lights[1].shadow.camera.bottom = -10;
        lights[1].shadow.mapSize.width = 1024;
        lights[1].shadow.mapSize.height = 1024;
        lights[1].shadow.camera.near = 0.5;
        lights[1].shadow.camera.far = 50;

        scene.add(...lights);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
        hemiLight.position.set(0, 50, 0);
        scene.add(hemiLight);
    }

    function draw() {
        renderer.render(scene, camera.camera);
    }

    function start() {
        renderer.setAnimationLoop(draw);
    }

    function stop(){
        renderer.setAnimationLoop(null);
    }

    function onMouseDown(event){
        camera.onMouseDown(event);
        // Raycasting need y and x axis as + on the terrain (plan) (y-1,y1,x1,x-1)
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera.camera);
        // all children of the scene (all objects) and recursive = true (all children of the children)
        // @return {Array} An array of intersections, which are objects containing distance, point, face, faceIndex, and object fields.
        // The clossest object is the first one in the array
        let intersections = raycaster.intersectObjects(scene.children, false);
        // if any intersection where found (if the array is not empty)
        if(intersections.length > 0) {
            // get the first object (the intersection) of the array of intersections
            console.log('intersection', intersections[0]);
            // if(selectedObject) selectedObject.material.emissive.setHex(0);
            selectedObject = intersections[0].object;
            // if(selectedObject.material.length !== undefined) {
               
            // }
            // console.log('selected object scene onMouseD ==>', selectedObject.material)
            // console.log('selected object scene is an array ? ==>', selectedObject.material.length)
            // selectedObject.material.emissive.setHex(0xff0000);
        
            if(this.onObjectSelected) {
                this.onObjectSelected(selectedObject);
            }
        }
    }

    function onMouseUp(event){
        camera.onMouseUp(event);
    }

    function onMouseMove(event){
        camera.onMouseMove(event);
    }

    function onKeyBoardDown(event){

        camera.onKeyBoardDown(event);
        // Raycasting need y and x axis as + on the terrain (plan) (y-1,y1,x1,x-1)
        // (number btw 0 and 1) * 2 - 1 > to get the value between -1 and 1
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera.camera);
        // array of object > all objects from our scene that intersect with the ray (false = non recursive = only the first object)
        // array of intersections sorted by distance with the closest object 
        const intersections = raycaster.intersectObjects(scene.children, false);
    
        if(intersections.length > 0) {
            // get the first object (the intersection) of the array of intersections
            const selected = intersects[0].object;
            if(selected) {
                console.log('selected material scene: ===> ', selected.material)
            }
            // selected.material.emissive.setHex(0xff0000);
            console.log('selected Object ==> ', selectedObject);
        }

    }

    function onKeyBoardUp(event){
        camera.onKeyBoardUp(event);
    }

    return {
        // make the game know the object userData I selected (to reach x and y position of the object or its id from asset)
        onObjectSelected,
        initialize,
        update,
        start,
        stop,
        onMouseDown,
        onMouseUp,
        onMouseMove, 
        onKeyBoardDown,
        onKeyBoardUp,
        setUpLights,
        addPlayerToScene,
        delay
    }
}