import * as THREE from 'three';
import { createCamera } from './camera.js';
import { createAsset } from './asset.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {fetchPlayer, freePromises, playerMesh} from "./fetchPlayer.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {tombstonesModelsObj} from "./buildings.js";
const SKY_URL = './resources/textures/skies/plain_sky.jpg';
let mixer;
const loader = new GLTFLoader();
const clock = new THREE.Clock();

export function createScene() {
    const gameWindow = document.getElementById('game-window');
    const displayPop = document.querySelector('.info-panel .display-pop')
    const displayFood = document.querySelector('.info-panel .display-food')
    const displayDead = document.querySelector('.info-panel .display-dead')
    const displayDelay = document.querySelector('.info-panel .display-delay')
    const displayDelayUI = document.querySelector('.delay-ui')


    // Accounts
    const displayFunds = document.querySelector('.info-panel .display-funds')
    const displayDebt = document.querySelector('.info-panel .display-debt')

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

    //  Variables de items
    let terrain = [];
    let buildings = [];
    let loadingPromises = [];

    let infoGamelay = {
        population: 0,
        maxPop: 0,
        deads: 0,
        foodAvailable: 0,
        foodNeeded: 0,
        salaries: 0,
        salesTax: 0,
        citizenTax: 0,
        foodMarkets: 0,
        goodsMarkets: 0,
        goodsNeeded: 0,
        goodsAvailable: 0,
        foodSales: 0,
        goodSales: 0,
        debt: 0,
        funds: 0,
    }
    // Variables de gameplay
    let maxPop = 5;
    let population  = 0;
    let food = 0;
    let deads = 0;

    let debt = 0;
    let funds = 300;
    let salaries = 0;
    let salesTax = 0.2;
    let citizenTax = 0.2;
    let markets = 0;

    let delay = 0;

    const houses = ['House-Red', 'House-Purple', 'House-Blue']
    const bigHouses = ['House-2Story']
    const farms = ['Farm-Wheat', 'Farm-Carrot', 'Farm-Cabbage']
    const commerce = ['Market-Stall']

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

        //  Initialize gameplay
        displayPop.textContent = population.toString()
        displayFood.textContent = food.toString()
        displayDead.textContent = deads.toString()
        displayFunds.textContent = funds.toString()
        displayDelay.textContent = delay.toString() + ' délai'
        displayDebt.textContent = debt.toString() + ' $'

        // addPlayerToScene(4, 0, 4)

    }

    function update(city, time=0) {
        // --- BOUCLE SUR LA VILLE ----
        let infoBuildings = []

        console.log('Etat des bâtiments : ', infoBuildings)
        for(let x = 0; x < city.size; x++) {
            for(let y = 0; y < city.size; y++) {
                // console.log(`the city at y ${y}- x ${x} : >>`, city)
              const currentBuildingId = buildings[x][y]?.userData?.id;
              const newBuildingId = city.tiles[x][y].buildingId;
              const buildingInfo =  city.tiles[x][y];
              if(currentBuildingId) {
                  console.log('current building', buildings[x][y])
                  console.log('current building id', currentBuildingId)
              }

              if(currentBuildingId) {

                      const neighbors1 = city.tiles[x-1][y+1]
                      const neighbors2 = city.tiles[x-2][y-1]
                      const neighbors3 = city.tiles[x-1][y-2]
                      const neighbors4 = city.tiles[x+1][y+1]

                      Object.assign(buildings[x][y].userData, {neighbors: [neighbors1, neighbors2, neighbors3, neighbors4]})
                      // buildings[x][y].userData.neighbors.push({one: neighbors1, two:neighbors2, three: neighbors3, four: neighbors4})
                     console.log('Building xy neighbors ', buildings[x][y].userData)

              }


              // if(x-1 > 0 && y+1 <= city.size && x+1 > city.size && y-1 > 0) {
              //
              //     const neighbors1 = city.tiles[x-1][y+1].buildingId
              //     const neighbors2 = city.tiles[x-2][y-1].buildingId
              //     const neighbors3 = city.tiles[x-1][y-2].buildingId
              //     const neighbors4 = city.tiles[x+1][y+1].buildingId
              //     console.log('NEIGHBORS', neighbors1, neighbors2, neighbors3, neighbors4)
              //     buildings[x][y].userData.neighbors.push({one: neighbors1, two:neighbors2, three: neighbors3, four: neighbors4})
              // }
                if(buildingInfo.buildingId) {
                    infoBuildings.push(buildingInfo)
                }

            //  Remove a building from the scene if a player remove a building
            if(!newBuildingId && currentBuildingId) {

                console.log('delete this building', currentBuildingId);
                if(houses.includes(currentBuildingId)) {
                    infoGamelay.funds -= 1
                    infoGamelay.maxPop -= 5
                    infoGamelay.population -= 1
                    infoGamelay.deads += 1
                }
                if(farms.includes(currentBuildingId)) {
                    infoGamelay.funds -= 1;
                    infoGamelay.foodAvailable -= 1
                }
                scene.remove(buildings[x][y]);
                buildings[x][y] = undefined;
            }

            // if data model has changed, update the mesh
            if(newBuildingId && (newBuildingId !== currentBuildingId)) {
                scene.remove(buildings[x][y]);
                buildings[x][y] = createAsset(newBuildingId, x, y);

                if(houses.includes(newBuildingId)) {
                    infoGamelay.funds -= 1;
                    infoGamelay.maxPop += 5;
                    if(infoGamelay.population <= infoGamelay.maxPop) {
                        infoGamelay.population += 1
                    }

                }

                if(farms.includes(newBuildingId)) {
                    infoGamelay.funds -= 1
                    infoGamelay.foodAvailable += 1
                }

                if(bigHouses.includes(newBuildingId)) {
                    infoGamelay.funds -= 2;
                    infoGamelay.maxPop += 10

                    if(population <= maxPop) {
                        infoGamelay.population += 2
                    }
                }

                if(commerce.includes(newBuildingId)) {
                    infoGamelay.funds -= 2;
                    infoGamelay.markets += 1;
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
        console.log('population', infoGamelay.population)
        console.log('food', infoGamelay.foodNeeded)

        if(infoGamelay.population > 0 && (infoGamelay.foodNeeded > infoGamelay.population)) {
            console.log('famine')
            // delay += 1

            if(delay > 10) {
                while(food < population) {
                    infoGamelay.population -= 1;
                    infoGamelay.deads += 1;
                }
            }
        }

        if(infoGamelay.population > 0 && infoGamelay.foodNeeded <= population && infoGamelay.markets > 0) {
            infoGamelay.funds += Math.floor(markets * salesTax)
        }



        if(infoGamelay.population > 0 && (infoGamelay.foodNeeded === infoGamelay.population)) {
            console.log('city growing')
            delay = 0
            while(infoGamelay.foodNeeded > infoGamelay.population && infoGamelay.population <= infoGamelay.maxPop) {
                infoGamelay.population += 1;
            }
        }

        if(population > 0 && (infoGamelay.foodNeeded > infoGamelay.population)) {
            console.log('city growing')
            while(infoGamelay.foodNeeded > infoGamelay.population && infoGamelay.population <= infoGamelay.maxPop) {
                infoGamelay.population += 1;
                infoGamelay.funds += 1;
                infoGamelay.foodNeeded -= 1;
            }
        }

        if(infoGamelay.funds < 0) {
            infoGamelay.debt += 1
        }

        // if(time > 10 && delay === 0 && population === 0 && food <= 0) {
        //     window.game.gameOver('idle')
        // }

        if(infoGamelay.debt > 5000) {
            window.game.gameOver('debt', {'debt': deads}, 'debt')
        }

        // On rembourse une dette dés qu'on gagne de l'argent
        if(infoGamelay.debt > 0 && infoGamelay.funds > 0) {
            infoGamelay.funds -= 1
            infoGamelay.debt -= 1
        }

        // On perd si plus de 10 morts
        if(infoGamelay.deads > 10) {
            window.game.gameOver('death', {'deads': deads}, 'deads')
        }

        // Gestion de la barre des délais
        if(delay > 0 && delay < 80) {
            displayDelayUI.textContent += '****'
        } else {
            displayDelayUI.textContent += ''
        }

        //  Display results in UI
        displayDelay.textContent = delay.toString() + ' delai'

        displayPop.textContent = infoGamelay.population.toString()
        displayFood.textContent = infoGamelay.foodNeeded.toString()

        displayFunds.textContent = infoGamelay.funds.toString()
        displayDebt.textContent =  infoGamelay.debt.toString() + ' $'

        displayDead.textContent = infoGamelay.deads.toString()


    }

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
            console.log('selected object scene onMouseD ==>', selectedObject.material)
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
        delay,
        deads
    }
}