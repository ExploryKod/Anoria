import * as THREE from 'three';
import {createCamera} from './camera.js';
import {createAsset} from './asset.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {fetchPlayer, freePromises, playerMesh} from "./fetchPlayer.js";
import {applyHoverColor, resetHoveredObject, resetObjectColor} from './meshUtils.js';
import {getBuildingNeighbors, getBuildingsNamesInZone, makeDbItemId, updateBuildingNeighbors} from "./utils.js";
import {
    bulldozeSelected,
    commerce,
    delayBox,
    displayDead,
    displayDebt,
    displayDelay,
    displayDelayUI,
    displayFood,
    displayFunds,
    displayNeedFood,
    displayPop,
    firstHouses,
    gameWindow,
    houses
} from './ui.js';
import {assetsPrices} from "./buildings.js";

const SKY_URL = './resources/textures/skies/plain_sky.jpg';

export function createScene(buildingStore, gameStore, allStores) {

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
    let zones = [];

    // Variables de gameplay
    let maxPop = 5;
    let delay = 0;
    // const gameplay = createGameplay();

    async function initialize(city) {
        scene.clear();
        terrain = [];
        buildings = [];
        zones = [];
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
            setUpLights(city.size);
        }

        displayPop.textContent = '0'
        displayFood.textContent = '0'
        displayNeedFood.textContent = '0'
        displayDead.textContent = '0'
        displayFunds.textContent = '0'
        displayDelay.textContent = '0'
        displayDebt.textContent = '0'
    }

    async function update(city, time=0) {

        console.log('=================== TIME TURN ====================== ', time)
        const gamePlayVersion = 'gameplay_' + time
        const totalPop = await buildingStore.getGlobalPopulation();
        let totalImmoExpenses = 0;
        let funds = await gameStore.getLatestGameItemByField('funds') || 300;

            let debts = await gameStore.getLatestGameItemByField('debt') || 0;
            totalImmoExpenses = await buildingStore.getGlobalBuildingPrices() || 0
            const allhousesPrices = await buildingStore.getEachBuildingsExpenses();
            const stores = await allStores.listAllFromStores()
            console.log(`[SCENE PRICE] debt on turn ${time} :`, debts)
            console.log("[SCENE PRICE] total immo expenses is ", totalImmoExpenses)
            console.log("[SCENE PRICE] all houses prices are", allhousesPrices)

            console.log("[SCENE STORES] all stores are", stores)

            const infoGameplay = {
                name: time === 0 ? 'gameplay_init' : gamePlayVersion,
                turn: time,
                population: totalPop ? totalPop : 0,
                maxPop: 5000,
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
                lastImmoExpense: totalImmoExpenses ? totalImmoExpenses : 0,
                debt: debts ? debts : 0,
                funds: funds ? funds : 300
            }

            console.log("[SCENE] latest game items", infoGameplay || "no game items found");
            await gameStore.clearGameItems();
            await gameStore.addGameItems(infoGameplay);

        // --- BOUCLE SUR LA VILLE ----
        let infoBuildings = []

        for(let x = 0; x < city.size; x++) {
            for(let y = 0; y < city.size; y++) {
                // console.log(`the city at y ${y}- x ${x} : >>`, city)
              let currentBuildingId = buildings[x][y]?.userData?.id;
              const currentBuilding = buildings[x][y];
              const newBuildingId = city.tiles[x][y].buildingId;
              const buildingInfo =  city.tiles[x][y];

              const isInCityLimits = x+1 < city.size && y+1 < city.size && x-1 > 0 && y-1 > 0

              if(currentBuildingId && isInCityLimits) {
                const currentUniqueID = makeDbItemId(currentBuildingId, x, y);
                await buildingStore.updateHouseFields(currentUniqueID, {worldTime: time})

                /* update userData in indexDB === real userData state from three mesh */
                const currentUserData = buildings[x][y].userData

                await buildingStore.updateHouseFields(currentUniqueID, {})

                console.log(`*************** CURRENT BUILDING ID (type) ${currentBuildingId} ***** UniqueId: ${currentUniqueID}********************`)
                const buildingData = {
                    city,
                    buildings,
                    x,
                    y,
                    currentBuildingId,
                    currentUniqueID,
                    terrain
                };

                updateBuildingNeighbors(buildingData, 1, time);

              /** ALl buildings : create a neighbors array in indexDB **/
              const allNeighborsWithinZone = getBuildingsNamesInZone(buildingData, time, {buildingTarget: "", zones:[1,2]})
              const allMarketsInZone = getBuildingsNamesInZone(buildingData, time, {buildingTarget: "Market-Stall", zones:[1,2]})
              await buildingStore.updateHouseFields(currentUniqueID, {neighbors: allNeighborsWithinZone})
              await buildingStore.updateHouseFields(currentUniqueID, {markets: allMarketsInZone})

                if(buildingInfo.buildingId) {
                    infoBuildings.push(buildingInfo)
                }

                //  Remove a building from the scene if a player remove a building
                if(bulldozeSelected.classList.contains('selected')) {
                    const currentUniqueIDToDestroy = makeDbItemId(currentBuildingId, x, y);
                    if(!newBuildingId && currentBuildingId) {
                        buildingStore.deleteOneHouse(currentUniqueIDToDestroy)
                        scene.remove(buildings[x][y]);
                        buildings[x][y] = undefined;
                    }
                }

                  /* utils for scene updates */
                  function calculateNetStocks(houseFood, housePop) {
                      if(houseFood > 0 && housePop > 0) {
                          const netFood = houseFood - housePop
                          return netFood > 0 ? netFood : 0;
                      }
                      return houseFood;
                  }


                /* Only for commerce buildings */
                if(commerce.includes(currentBuildingId)) {
                    const marketTime = { name: currentUniqueID, increment: 1, field: 'time' };
                    buildingStore.incrementHouseField(marketTime, false)

                    const currentMarket = await buildingStore.getHouse(currentUniqueID);
                    let marketHouses = [];

                    if(currentMarket) {
                        console.log("[SCENE HOUSE] current market from db", currentMarket);
                        console.log("[SCENE HOUSE] current market from db houses red - neighbors", currentMarket?.neighbors.filter(neighbor => neighbor.name.includes("House")));
                        marketHouses = currentMarket?.neighbors.filter(neighbor => neighbor.name.includes("House"))
                        /* Distribute food to house around */
                        for (const house of marketHouses) {
                            console.log("[scene] [market] [house] ", house, buildings[house.x][house.y])
                            //await buildingStore.updateHouseFields(house.id, {stocks: { food: 1, carrot: 1, cabbage: 0, wheat: 0}})
                            const buildingsUserData = buildings[house.x][house.y].userData
                            buildings[house.x][house.y].userData = {...buildingsUserData, stocks: {food: 8, carrot: 8, cabbage: 0, wheat: 0}};
                            console.log("[scene] [market] [house] userData", buildingsUserData)
                            console.log("[scene] [market] [house] userData new", buildings[house.x][house.y].userData)
                        }
                    }




                }

                //  only update if current building is a house
                if(houses.includes(currentBuildingId)) {

                    const valuesFromUserData = {
                        stocks: {food: buildings[x][y].userData.stocks.food,
                            carrot: buildings[x][y].userData.stocks.carrot,
                            cabbage: buildings[x][y].userData.stocks.cabbage,
                            wheat: buildings[x][y].userData.stocks.wheat}
                    }

                    await buildingStore.updateHouseFields(currentUniqueID, valuesFromUserData)
                    const currentHouse = await buildingStore.getHouse(currentUniqueID);

                    if(currentHouse) {
                        console.log("[SCENE HOUSE] current house from db", currentHouse);
                    }

                    if(time > 0) {
                        const HouseTime = { name: currentUniqueID, increment: 1, field: 'time' };
                        await buildingStore.incrementHouseField(HouseTime, false)
                    }

                    const housePop = { name: currentUniqueID, increment: 1, field: 'pop' };
                    await buildingStore.incrementHouseField(housePop, {operator: '<=', limit: 2})

                    const houseTime = await buildingStore.getHouseItem(currentUniqueID, 'time');
                    console.log('+++ current house time: ', houseTime)

                    const neighborRoadFound = getBuildingNeighbors(currentBuilding, ['roads'])

                    if(neighborRoadFound) {
                        const HouseRoad = { name: currentUniqueID, increment: 1, field: 'road' };
                        await buildingStore.incrementHouseField(HouseRoad, {operator: '<=', limit: 4})
                    }

                    /* house evolution to stage 2 */
                    const houseStocks = await buildingStore.getHouseItem(currentUniqueID, 'stocks')
                    const houseFood = houseStocks.food;
                    if(houseTime > 3 && houseFood > 5 && firstHouses.includes(currentBuildingId)) {
                        scene.remove(buildings[x][y]);
                        const newUniqueBuildingId = makeDbItemId('House-2Story', x, y);
                        console.log('new unique building ', newUniqueBuildingId)
                        const keys = { type : "House-2Story", price: assetsPrices["House-2Story"].price}
                        await buildingStore.updateHouseName(currentUniqueID, newUniqueBuildingId, keys);
                        await buildingStore.deleteOneHouse(currentUniqueID);
                        buildings[x][y] = createAsset('House-2Story', x, y);
                        console.log('[2Story added] >> old and new', currentUniqueID, newUniqueBuildingId)

                        scene.add(buildings[x][y]);

                    }

                }
          
              }

                  // if data model has changed as user add a new building, update the mesh 
            if(newBuildingId && (newBuildingId !== currentBuildingId)) {
                //remove the initial building if needed
                const currentBuildingIdDb = makeDbItemId(currentBuildingId, x, y);
                let isExistingBuilding;
                if(currentBuildingIdDb) {
                    isExistingBuilding = buildingStore.getHouse(currentBuildingIdDb);
                }

                console.log(`Building is existing`, isExistingBuilding)
                if(!isExistingBuilding) {
                    scene.remove(buildings[x][y]);
                    buildings[x][y] = createAsset(newBuildingId, x, y);
                    scene.add(buildings[x][y]);
                }

                // Add the new building
                console.log(`[scenejs update] Building ${newBuildingId} added to map`);

                console.log(`current building caracteristics >>>`, buildings[x][y].userData)
                console.log(`current building neighbors est >>>`, buildings[x][y].userData.neighborE)
  
                }

              // -- FIN DE LA SOUS-BOUCLE Y ----
            }

        }
        // --- FIN BOUCLE SUR LA VILLE X ET Y----

        // Gestion de la barre des délais
        if(delay > 0 && delay < 80) {
            delayBox.style.opacity = 1
            displayDelayUI.textContent += '****'
        } else {
            delayBox.style.opacity = 0.5
            displayDelayUI.textContent += ''
        }

        //  Display results in UI
        displayDelay.textContent = delay.toString() + ' delai'
        const gameItems = await gameStore.listAllGameItems()

        gameItems.filter(item => item).forEach((item) => {
            console.log(`[SCENE] new item at ${time} `, item.funds)
            const {
                name,
                turn,
                population,
                maxPop,
                deads,
                foodAvailable,
                foodNeeded,
                salaries,
                salesTax,
                citizenTax,
                markets,
                foodMarkets,
                goodsMarkets,
                goodsNeeded,
                goodsAvailable,
                foodSales,
                goodSales,
                lastImmoExpense,
                debt,
                funds
            } = item;

            // Updating the appropriate HTML elements with the data from each item
            displayPop.textContent = population.toString();
            displayFood.textContent = foodAvailable.toString();
            displayFunds.textContent = funds.toString();
            displayDebt.textContent = debt.toString() + " $";
            displayDead.textContent = deads.toString();
        })

        console.log('=================== END TURN ====================== ', time)

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
   

    function setUpLights(citySize) {
        console.log("City size:", citySize);

        // Use the derived formula for light intensity
        const b = Math.log10(0.1) / Math.log10(2); // Exponent
        const a = 0.03 / Math.pow(16, b); // Coefficient
        const c = 0.05 / Math.pow(16, b);

        const AmbientLightIntensity = a * Math.pow(citySize, b);
        const DirectionalLightIntensity = c * Math.pow(citySize, b);

        console.log("Ambient light intensity:", AmbientLightIntensity);
        console.log("Directional light intensity:", DirectionalLightIntensity);
        const lights = [
            new THREE.AmbientLight(0xffffff, AmbientLightIntensity),
            new THREE.DirectionalLight(0x999999, DirectionalLightIntensity),
            new THREE.DirectionalLight(0x999999, DirectionalLightIntensity),
            new THREE.DirectionalLight(0x999999, DirectionalLightIntensity),
        ];

        // Set up directional lights
        lights[1].position.set(0, 1, 0);
        lights[2].position.set(0, 1, 0);
        lights[3].position.set(0, 1, 0);

        // Configure shadows for the first directional light
        lights[1].shadow.camera.left = -10;
        lights[1].shadow.camera.right = 10;
        lights[1].shadow.camera.top = 0;
        lights[1].shadow.camera.bottom = -10;
        lights[1].shadow.mapSize.width = 1024;
        lights[1].shadow.mapSize.height = 1024;
        lights[1].shadow.camera.near = 0.5;
        lights[1].shadow.camera.far = 50;

        // Add lights to the scene
        scene.add(...lights);

        // Add a hemisphere light
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

    let hoveredObject = null
    let hoveredObjectName = null
    const objectsNames = ['grass', 'roads', 'House-Red', 'House-Purple', 'House-Blue', 'Market-Stall']

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
            console.log('intersection', intersections);
            console.log('intersection', intersections[0]);
            // if(selectedObject) selectedObject.material.emissive.setHex(0);
            selectedObject = intersections[0].object;
            // if(selectedObject.material.length !== undefined) {
               
            // }
            console.log('selected object scene onMouseD ==>', selectedObject.material)
            // console.log('selected object scene is an array ? ==>', selectedObject.material.length)
            //selectedObject.material.emissive.setHex(0xff0000);

            if(this.onObjectSelected) {
                this.onObjectSelected(selectedObject);
            }
        }
    }

    function onMouseUp(event){
        camera.onMouseUp(event);
    }

function onMouseMove(event) {
    camera.onMouseMove(event);

    // Update the mouse coordinates for raycasting
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    // Perform raycasting
    raycaster.setFromCamera(mouse, camera.camera);
    const intersections = raycaster.intersectObjects(scene.children, false);

    if(intersections.length) {
        console.log("interections on mouse move ", intersections[0].object.name)
        hoveredObjectName = intersections[0]?.object?.name || ""
    }
}


 function handleHover(intersections, hexColor, objectName="roads") {
    if (intersections.length > 0) {
        const intersectedObject = intersections[0].object;

        // Check if the intersected object is the one we want to interact with
        if (intersectedObject.name === objectName) {

            // If the hovered object has changed
            if (hoveredObject !== intersectedObject) {
                console.log("[handleHover] hovered object", hoveredObject)
                if (hoveredObject) {
                    resetObjectColor(hoveredObject);
                }

                hoveredObject = intersectedObject;
                applyHoverColor(hoveredObject, hexColor, objectName);
            }
        } else {
            resetHoveredObject(hoveredObject);
        }


    } else {
        resetHoveredObject(hoveredObject);
    }
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
            const selected = intersections[0].object;
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