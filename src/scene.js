import * as THREE from 'three';
import { createCamera } from './camera.js';

export function createScene() {
    const gameWindow = document.getElementById('game-window');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x79845);

    const camera = createCamera(gameWindow);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
    gameWindow.appendChild(renderer.domElement);

 

    let meshes = [];
    function initialize(city) { 
        scene.clear();
        meshes = [];
        for(let x = 0; x < city.size; x++) {
            let column = [];
            for(let y = 0; y < city.size; y++) {
                // Grass
                const geometry = new THREE.BoxGeometry(1,1,1);
                const material = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x, -0.5, y);
                scene.add(mesh);
                column.push(mesh);

                // Building
                const tile = city.data[x][y];
                if(tile.building === 'building') {
                const buildingGeometry = new THREE.BoxGeometry(1,1,1);
                const materialGeometry = new THREE.MeshLambertMaterial({ color: 0x777777 });
                const meshGeometry = new THREE.Mesh(buildingGeometry, materialGeometry);
                meshGeometry.position.set(x, 0.5, y);
                scene.add(meshGeometry);
                column.push(meshGeometry);
                }
            }
            meshes.push(column);
        }

        setUpLights();
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
        start,
        stop,
        onMouseDown,
        onMouseUp,
        onMouseMove, 
        onKeyBoardDown,
        onKeyBoardUp,
        setUpLights,
        onKeyBoardStay
    }
}