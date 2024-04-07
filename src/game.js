import { changeMeshMaterial, changeMeshColor, textures, changeBuildingSides } from "./asset.js";
import { createScene } from './scene.js';
import { createCity } from './city.js'; 

export function createGame() {
    let activeToolId = '';
    const scene = createScene();
    const city = createCity(16);
    scene.initialize(city);

    // handler function to extract coordinate of an object I click on (data from asset js and using scene js methods)
    scene.onObjectSelected = (selectedObject) => {
        selectedObject.info = '';
        selectedObject.name = activeToolId;
        console.log('the selected Object: ', selectedObject);

        let { x, y } = selectedObject.userData;
        // location of the tile in the data model
        const tile = city.tiles[x][y];
        console.log('actuel buildingId', tile)
        if(activeToolId === 'bulldoze') {
            // remove building from that location
            tile.buildingId = undefined;
            scene.update(city);
        } else if(activeToolId === "select-object") {
            changeMeshMaterial(selectedObject, textures['roads'])
        } else if(!tile.buildingId) {
            // place building at that location
            tile.buildingId = activeToolId;
            scene.update(city);
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
    
    const game = {
      
        update() { 
            // console.log('game is updated')
            city.update();
            scene.update(city);
        },
        setActiveToolId(toolId) {
            activeToolId = toolId;
        }
    }; 

    setInterval(() => {
         game.update();
    }, 5000);

    scene.start();
    return game;
}