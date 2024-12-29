import * as THREE from 'three';
import { createCamera } from './camera.js';
import { createAsset } from './asset.js';
import { createGameplay} from "./gameplay.js";
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
    const displayNeedFood = document.querySelector('.info-panel .display-starve')
    const displayDead = document.querySelector('.info-panel .display-dead')
    const displayDelay = document.querySelector('.info-panel .display-delay')
    const displayDelayUI = document.querySelector('.delay-ui')

    const bulldozeSelected = document.querySelector('.bulldoze-btn');

  
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

    let infoGameplay = {
        population: 0,
        maxPop: 0,
        deads: 0,
        foodAvailable: 0,
        foodNeeded: 0,
        salaries: 0,
        salesTax: 0.2,
        citizenTax: 0.2,
        markets: 0,
        foodMarkets: 0,
        goodsMarkets: 0,
        goodsNeeded: 0,
        goodsAvailable: 0,
        foodSales: 0,
        goodSales: 0,
        debt: 0,
        funds: 200,
    }
    // Variables de gameplay
    let maxPop = 5;
    let delay = 0;

    const houses = ['House-Red', 'House-Purple', 'House-Blue']
    const bigHouses = ['House-2Story']
    const farms = ['Farm-Wheat', 'Farm-Carrot', 'Farm-Cabbage']
    const commerce = ['Market-Stall']

    const gameplay = createGameplay(infoGameplay);

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
        displayPop.textContent = infoGameplay.population.toString()

        displayFood.textContent = infoGameplay.foodAvailable.toString()
        displayNeedFood.textContent = infoGameplay.foodNeeded.toString();

        displayDead.textContent = infoGameplay.deads.toString()
        displayFunds.textContent = infoGameplay.funds.toString()
        displayDelay.textContent = delay.toString() + ' délai'
        displayDebt.textContent = infoGameplay.debt.toString() + ' $'

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

              const isInCityLimits = x+1 < city.size && y+1 < city.size && x-1 > 0 && y-1 > 0

              if(currentBuildingId && isInCityLimits) {

                // South
                const neighborSouth = city.tiles[x][y+1]; // Neighbor directly to the north
                Object.assign(buildings[x][y].userData, {neighborS: neighborSouth.buildingId })
                // North-East
                const neighborNorthEast = city.tiles[x+1][y+1]; // Neighbor diagonally to the north-east
                  Object.assign(buildings[x][y].userData, {neighborNE: neighborNorthEast.buildingId })
                // East
                const neighborEast = city.tiles[x+1][y]; // Neighbor directly to the east
                  Object.assign(buildings[x][y].userData, {neighborE: neighborEast.buildingId })
                // South-East
                const neighborSouthEast = city.tiles[x+1][y-1]; // Neighbor diagonally to the south-east
                  Object.assign(buildings[x][y].userData, {neighborSE: neighborSouthEast.buildingId })
                // North
                const neighborNorth = city.tiles[x][y-1]; // Neighbor directly to the south
                  Object.assign(buildings[x][y].userData, {neighborN: neighborNorth.buildingId })
                // South-West
                const neighborSouthWest = city.tiles[x-1][y-1]; // Neighbor diagonally to the south-west
                  Object.assign(buildings[x][y].userData, {neighborSW: neighborSouthWest.buildingId })
                // West
                const neighborWest = city.tiles[x-1][y]; // Neighbor directly to the west
                  Object.assign(buildings[x][y].userData, {neighborW: neighborWest.buildingId })
                // North-West
                const neighborNorthWest = city.tiles[x-1][y+1]; // Neighbor diagonally to the north-west
                  Object.assign(buildings[x][y].userData, {neighborNW: neighborNorthWest.buildingId })

                      Object.assign(buildings[x][y].userData,
                          {neighbors: [
                          neighborNorth,
                          neighborNorthWest,
                          neighborNorthEast,
                          neighborEast,
                          neighborSouthEast,
                          neighborSouthWest,
                          neighborSouth,
                          neighborWest]})

                      console.log(`Building neighbors of ${currentBuildingId} x: ${x} y: ${y} ==> `, buildings[x][y].userData.neighbors)

              }

                if(buildingInfo.buildingId) {
                    infoBuildings.push(buildingInfo)
                }


             
            //  Remove a building from the scene if a player remove a building
            if(!newBuildingId && currentBuildingId) {

                if(bulldozeSelected.classList.contains('selected') && currentBuildingId) { 
                    console.log('bulldoze has been selected', bulldozeSelected)
                    if(houses.includes(currentBuildingId)) {
                        infoGameplay.funds -= 1
                        infoGameplay.maxPop -= 5
                     
                        console.log(`A building was deleted so pop is ${infoGameplay.population}`)
                        infoGameplay.population -= 1
                    }
                    if(farms.includes(currentBuildingId)) {
                        infoGameplay.funds -= 1;
                        infoGameplay.foodAvailable -= 1
                    }
                    scene.remove(buildings[x][y]);
                    buildings[x][y] = undefined;
                }

          
            }

            // if data model has changed, update the mesh
            if(newBuildingId && (newBuildingId !== currentBuildingId)) {
                scene.remove(buildings[x][y]);
                buildings[x][y] = createAsset(newBuildingId, x, y);

                if(houses.includes(newBuildingId)) {
                    infoGameplay.funds -= 1;
                    infoGameplay.maxPop += 5;
                    if(infoGameplay.population <= infoGameplay.maxPop) {
                        infoGameplay.population += 1
                    }

                }

                if(farms.includes(newBuildingId)) {
                    infoGameplay.funds -= 1
                    infoGameplay.foodAvailable += 1
                }

                if(bigHouses.includes(newBuildingId)) {
                    infoGameplay.funds -= 2;
                    infoGameplay.maxPop += 10

                    if(infoGameplay.population <= maxPop) {
                        infoGameplay.population += 2
                    }
                }

                if(commerce.includes(newBuildingId)) {
                    infoGameplay.funds -= 2;
                    infoGameplay.markets += 1;
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
        console.log('population', infoGameplay.population)
        console.log('deads', infoGameplay.deads)
        console.log('food needed', infoGameplay.foodNeeded)
        console.log('food available', infoGameplay.foodAvailable)
        infoGameplay.foodNeeded = infoGameplay.population - infoGameplay.foodAvailable

        if(infoGameplay.population > 0 && (infoGameplay.foodNeeded >= infoGameplay.population)) {
            console.log('city growing and need food for equal population')
            delay += 1

            if(delay > 1) {
                while((infoGameplay.foodAvailable <= infoGameplay.population) && infoGameplay.population > 0) {
                    
                    infoGameplay.deads += 1;
                    infoGameplay.population -= 1;  

                    for(let x = 0; x < city.size; x++) {
                        for(let y = 0; y < city.size; y++) {
                        console.log(`the city in need food at y ${y}- x ${x} : >>`, city)
                        
                            city.tiles.forEach(tile => 
                                tile.filter((building) => houses.includes(building.buildingId)).forEach(building => {
                                    console.log('the tile with building', building)
                                    
                                    building.buildingId = undefined
                                   
                                    console.log('building is removed', building)
                                })
                            
                            )
                        }
                    }
                }
                
            }
        }

        if(infoGameplay.population > 0 && (infoGameplay.foodNeeded > infoGameplay.population)) {
            console.log('city growing and need food')
         
        }

        if(infoGameplay.funds < 0) {
            console.log('city growing debt')
            infoGameplay.debt += 1
        }

        // On rembourse une dette dés qu'on gagne de l'argent
        if(infoGameplay.debt > 0 && infoGameplay.funds > 0) {
            console.log('city reimburse debt')
            infoGameplay.funds -= 1
            infoGameplay.debt -= 1
        }


        // Gestion de la barre des délais
        if(delay > 0 && delay < 80) {
            displayDelayUI.textContent += '****'
        } else {
            displayDelayUI.textContent += ''
        }

        gameplay.makeGameOver()

        //  Display results in UI
        displayDelay.textContent = delay.toString() + ' delai'

        displayPop.textContent = infoGameplay.population.toString()
        displayFood.textContent = infoGameplay.foodAvailable.toString()
        displayNeedFood.textContent = infoGameplay.foodNeeded.toString();
        const fundsNum = Math.round((infoGameplay.funds + Number.EPSILON) * 100) / 100
        const debtsNum = Math.round((infoGameplay.debt + Number.EPSILON) * 100) / 100
        displayFunds.textContent =  fundsNum.toString()
        displayDebt.textContent =  debtsNum.toString() + ' $'

        displayDead.textContent = infoGameplay.deads.toString()

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
        infoGameplay
    }
}