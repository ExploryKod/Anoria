import * as THREE from 'three';
import { createCamera } from './camera.js';
import { createAsset } from './asset.js';

export function createScene() {
    const gameWindow = document.getElementById('game-window');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x79845);

    const camera = createCamera(gameWindow);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
    gameWindow.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedObject = undefined;
    // a reference to a function that will be called when an object is selected
    let onObjectSelected = undefined;

    let terrain = [];
    let buildings = [];

    function initialize(city) { 
        scene.clear();
        terrain = [];
        buildings = [];
        for(let x = 0; x < city.size; x++) {
            let column = [];
            for(let y = 0; y < city.size; y++) {
                // Grass
                const terrainId = city.data[x][y].terrainId;
                const mesh = createAsset(terrainId, x, y);
                scene.add(mesh);
                column.push(mesh);
            }
            terrain.push(column);
            // create empty array for buildings : an array of undefined values
            buildings.push([...Array(city.size)]);
            setUpLights();
        }
    }

    function update(city) {
        for(let x = 0; x < city.size; x++) {
            for(let y = 0; y < city.size; y++) {
              const currentBuildingId = buildings[x][y]?.userData.id;
              const newBuildingId = city.data[x][y].buildingId;
            //  Remove a building from the scene if a player remove a building
            if(!newBuildingId && currentBuildingId) {
                scene.remove(buildings[x][y]);
                buildings[x][y] = undefined;
            }
            // if data model has changed, update the mesh
            if(newBuildingId && (newBuildingId !== currentBuildingId)) {
                scene.remove(buildings[x][y]);
                buildings[x][y] = createAsset(newBuildingId, x, y);
                scene.add(buildings[x][y]);
                }
            }
        }
    }

    function setUpLights() {
        const lights = [
            new THREE.AmbientLight(0xffffff, 0.2),
            new THREE.DirectionalLight(0xffffff, 0.3),
            new THREE.DirectionalLight(0xffffff, 0.3),
            new THREE.DirectionalLight(0xffffff, 0.3)
        ];

        lights[1].position.set(0, 1, 0);
        lights[2].position.set(0, 1, 0);
        lights[3].position.set(0, 1, 0);
        scene.add(...lights);
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
            console.log(intersections[0]);
            if(selectedObject) selectedObject.material.emissive.setHex(0);
            selectedObject = intersections[0].object;
            selectedObject.material.emissive.setHex(0xff0000);
            console.log('-------- Selected Object data --------')
            console.log(selectedObject.userData)
            console.log('-------- Selected Object id --------')
             // print the id of the selected object found in asset.js (ex: 'grass')
            console.log(selectedObject.userData.id)

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
                selected.material.emissive.setHex(0x000000);
            }
            selected.material.emissive.setHex(0xff0000);
            console.log(selectedObject);
        }
    }

    function onKeyBoardUp(event){
        camera.onKeyBoardUp(event);
    }

    function onKeyBoardStay(event){
        camera.onKeyBoardStay(event);
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
        onKeyBoardStay,
    }
}