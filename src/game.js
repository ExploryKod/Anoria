import { createScene } from './scene.js';
import { createCity } from './city.js';

export function createGame() {
    let activeToolId = '';
    const scene = createScene();
    const city = createCity(8);
    scene.initialize(city);
    // handler function to extract coordinate of an object I click on (data from asset js and using scene js methods)
    scene.onObjectSelected = (selectedObject) => {
        console.log(selectedObject);
        let { x, y } = selectedObject.userData;
        // location of the tile in the data model
        const tile = city.data[x][y];
        console.log('Tile data--------------------')
        console.log(tile);
    }
    //    on onMouse we bind the scene object itself to the handler function onObjectSelected to work with the scene object
    // these event listeners are added to the document object, not the scene object itself - they are call by HTML document so we need to bind the scene object to the handler function
    document.addEventListener('mousedown', scene.onMouseDown.bind(scene), false);
    document.addEventListener('mouseup', scene.onMouseUp.bind(scene), false);
    document.addEventListener('mousemove', scene.onMouseMove.bind(scene), false);
    document.addEventListener('keydown', scene.onKeyDown, false);
    document.addEventListener('keyup', scene.onKeyUp, false);
    
    const game = {
        update() {
            city.update();
            scene.update(city);
        },
        setActiveToolId(toolId) {
            activeToolId = toolId;
            console.log('+++++++++++ active tool id +++++++++++++');
            console.log(activeToolId);
        }
    }; 

    setInterval(() => {
         game.update();
    }, 3000);

    scene.start();
    return game;
}