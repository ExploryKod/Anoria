import { createScene } from './scene.js';
import { createCity } from './city.js';

export function createGame() {
    let activeToolId = '';
    const scene = createScene();
    const city = createCity(16);
    scene.initialize(city);
    // handler function to extract coordinate of an object I click on (data from asset js and using scene js methods)
    scene.onObjectSelected = (selectedObject) => {
        console.log('the selected Object', selectedObject.name);
        selectedObject.name = activeToolId;
        console.log('the selected Object new name', selectedObject.name);
        let { x, y } = selectedObject.userData;
        // location of the tile in the data model
        const tile = city.data[x][y];
  
        if(activeToolId === 'bulldoze') {
            // remove building from that location
            tile.buildingId = undefined;
            scene.update(city);
        } else if(!tile.buildingId) {
            // place building at that location
            tile.buildingId = activeToolId;
            console.log('active tool id >>>', activeToolId)
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