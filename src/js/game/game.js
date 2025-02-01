import * as THREE from 'three';
import {  assetsPrices } from '../meshs/buildings.js';
import { createScene } from './scene.js';
import { createCity } from './city.js';
import {getAssetPrice, makeDbItemId, makeInfoBuildingText} from '../utils/utils.js';
import { handleColorOnSelectedObject } from '../utils/meshUtils.js';
import {
    displayTime,
    overOverlay,
    overOverlayMessage,
    infoObjectOverlay,
    infoObjectCloseBtn,
    buildingsObjects,
    infoPanelClock,
    infoPanelClockIcon,
    infoPanelNoClockIcon,
    displaySpeed
} from '../ui/ui.js';
import GameStore from "../stores/gameStore.js";
import HousesStore from "../stores/housesStore.js";
import housesStore from "../stores/housesStore.js";


/* IndexDB initialization using store.js async functions */
//initAnoriaDb()


export function createGame() {
    let activeToolId = '';
    let time = 0;
    let isPause;
    let isOver;
    let infos = {};
    let intervalId = null;
    localStorage.setItem("speed", "4000");
    displayTime.textContent = time.toString() + ' jours';

    /* Scene initialization */
    const scene = createScene(housesStore, GameStore);

    /* City initialization */
    const city = createCity(16);

    scene.initialize(city).then(r => console.log(r));

    // handler function to extract coordinate of an object I click on (data from asset js and using scene js methods)
    scene.onObjectSelected = async (selectedObject) => {
        selectedObject.info = '';
        selectedObject.name = activeToolId !== 'select-object'? activeToolId : selectedObject.name;
        console.log('the selected Object: ', selectedObject);


        let { x, y } = selectedObject.userData;
        // location of the tile in the data model
        const tile = city.tiles[x][y];
        console.log('Objet posé sur ce terrain: ', selectedObject.userData)
        if(activeToolId === 'bulldoze') {
            // remove building from that location
            tile.buildingId = undefined;
            await scene.update(city);
        } else if(activeToolId === "select-object") {
            console.log(`Je sélectionne ${selectedObject.userData.id} à ${x} ${y} >> `, selectedObject.userData)
            infoObjectOverlay.classList.toggle('active');
            makeInfoBuildingText("", true)
            // color of building will become red
            const hexSelected = handleColorOnSelectedObject(selectedObject)
            console.log("Hex ", hexSelected)

            if(!buildingsObjects.includes(selectedObject.userData.id)) {
                console.warn("no building here")
            }


            if(buildingsObjects.includes(selectedObject.userData.id)) {
                console.log('******* SELECTING A BUILDING *********', selectedObject.userData.name)
                let isRoad = false
                const uniqueId = makeDbItemId(selectedObject.userData.id, selectedObject.userData.x, selectedObject.userData.y)
                const buildingPop = await HousesStore.getHouseItem(uniqueId, 'pop')
                const buildingFood = await HousesStore.getHouseItem(uniqueId, 'food')

                /* Check if neighbor */
                let neighbors = false;
                if(selectedObject.userData.neighbors) {
                    neighbors = selectedObject.userData.neighbors;
                }

                makeInfoBuildingText(`Bâtiment: ${selectedObject.userData.id} x: ${selectedObject.userData.x} y: ${selectedObject.userData.y}`, false)
                makeInfoBuildingText(`Nombre d'habitants: ${buildingPop}`, false)
                makeInfoBuildingText(`Nourriture: ${buildingFood} kilos d'aliments`, false)

                if(neighbors) {
                    neighbors.filter(neighbor => neighbor.buildingName !== undefined).map(neighbor => {
                        if(neighbor.buildingName === 'roads') {
                            isRoad = true
                            makeInfoBuildingText(`Routes : ${isRoad ? "oui" : "non"}`, false)
                        } else {
                            isRoad = false
                            makeInfoBuildingText(`Routes : ${isRoad ? "oui" : "non"}`, false)

                        }

                    })
                }
          
            }
           
            if(infoObjectOverlay.classList.contains('active')) {
                window.game.pause()
            } else {
                window.game.play()
            }
            await scene.update(city)
        } else if(!tile.buildingId) {
            // place building at that location
            tile.buildingId = activeToolId;
            console.log(`coordonnées et terrain de l\' objet posé ${tile.buildingId}: `, selectedObject.userData)
            let price = 0

            const houseID = tile.buildingId + '-' + selectedObject.userData.x + '-' + selectedObject.userData.y

            price = getAssetPrice(tile.buildingId, assetsPrices) || 0
            let funds = await GameStore.getLatestGameItemByField('funds') || 0
            const dbHouseData = {
                name: houseID,
                type: tile.buildingId,
                neighbors: [],
                pop: 0,
                stocks : {food: 0, cabbage : 0, wheat: 0, carrot: 0},
                gameTurn: time,
                time: 0,
                isBuilding: true,
                road: 0,
                stage : 0,
                stageName: "",
                price : price ? price : 0,
                cityFunds: funds,
                maintenance: 0,
                worldTime: 0,
                x : selectedObject.userData.x,
                y : selectedObject.userData.y,
            }

            await HousesStore.addHouseAndPay(dbHouseData);
            console.log("GAME - add house and pay complete")
            await scene.update(city);
        }
    }

    //    on onMouse we bind the scene object itself to the handler function onObjectSelected to work with the scene object
    // these event listeners are added to the document object, not the scene object itself - they are call by HTML document so we need to bind the scene object 
    // to the handler function
    document.addEventListener('mousedown', scene.onMouseDown.bind(scene), false);
    document.addEventListener('mouseup', scene.onMouseUp.bind(scene), false);
    document.addEventListener('mousemove', scene.onMouseMove.bind(scene), false);
    document.addEventListener('keydown', scene.onKeyBoardDown.bind(scene), false);
    document.addEventListener('keyup', scene.onKeyBoardUp.bind(scene), false);

    infoObjectCloseBtn.addEventListener('click', () => {
        if(infoObjectOverlay.classList.contains('active')) {
            infoObjectOverlay.classList.remove('active')
            window.game.play()
        }
    })

    const game = {

        update(time) {
            displayTime.textContent = time + ' jours'
            city.update();
            scene.update(city, time);
        },

        pause() {
           isPause = true;
            console.log('--pause--') 
            infoPanelClockIcon.style.display = 'none'
            infoPanelNoClockIcon.style.display = 'block'
            displayTime.textContent = 'pause'
        },

        play() {
            console.log('--play--')
            isPause = false;
            infoPanelClockIcon.style.display = 'block'
            infoPanelNoClockIcon.style.display = 'none'
            displayTime.textContent = 'play'
        },

        gameOver(reason='death', data = {}, key="") {
            overOverlayMessage.innerHTML = ""
            const placeholder = "Des";
            switch(reason) {
                case 'death' :
                    overOverlayMessage.innerHTML = `<p> ${data['deads'] ? data['deads'] : placeholder} personnes sont mortes du fait de votre incompétence!</p><p>Vous êtes viré et ruiné !</p>`
                    break
                case 'money' :
                    overOverlayMessage.innerHTML = `<p>Trop de dettes!</p><p>Vous êtes viré et ruiné !</p>`
                    break
                case 'idle' :
                    overOverlayMessage.innerHTML = `<p>Vous avez cru prendre des vacances au soleil ? Vous n'avez pas améner le moindre habitant ! </p><p>Vous êtes viré !</p>`
                    break
            }
            overOverlay.classList.add('active')

            isOver = true;
        },

        replay() {
            isOver = false;
            overOverlay.classList.remove('active')
            window.location.href = '/'
        },

        setInfo(key, info) {
            if(!infos.key) {
                infos.assign(...infos, {key: info})
            } else {
                console.warn('key already exist in info object')
            }
        },

        getInfo(key) {
            if(infos[key]) {
                return infos[key]
            }
        },

        setActiveToolId(toolId) {
            activeToolId = toolId;
        },

        startInterval() {
            const speed = parseInt(localStorage.getItem('speed')) || 4000;
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
                if (!isPause && !isOver) {
                    time += 1;
                    game.update(time);
                }
            }, speed);
        }
    }; 

    setInterval(() => {
        if(!isPause) {
            if(!isOver) {
                time += 1;
                game.update(time);
            }
        }
    }, parseInt(localStorage.getItem('speed')));

    scene.start();
    return game;
}