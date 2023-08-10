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
                const mesh = createAsset('grass', x, y);
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
            if(newBuildingId !== currentBuildingId) {
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
    }

    function onMouseUp(event){
        camera.onMouseUp(event);
    }

    function onMouseMove(event){
        camera.onMouseMove(event);
    }

    function onKeyBoardDown(event){
        camera.onKeyBoardDown(event);
    }

    function onKeyBoardUp(event){
        camera.onKeyBoardUp(event);
    }

    function onKeyBoardStay(event){
        camera.onKeyBoardStay(event);
    }

    return {
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