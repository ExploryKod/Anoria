import { createScene } from './scene.js';
import { createCity } from './city.js'; 

export function createGame() {
    let activeToolId = '';
    let time = 0;
    let isPause;
    let isOver;
    let infos = {};

    const displayTime = document.querySelector('.info-panel .display-time')
    const overOverlay = document.querySelector('#over-overlay');
    const overOverlayMessage = document.querySelector('#over-overlay .over-overlay__text');
    displayTime.textContent = time.toString() + ' jours';

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
            console.log('Je sélectionne ', selectedObject.userData)
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

        update(time) {
            displayTime.textContent = time + ' jours'
            city.update();
            scene.update(city, time);
        },

        pause() {
           isPause = true;
            console.log('--pause--')
           displayTime.textContent = 'pause'
        },

        play() {
            console.log('--play--')
            isPause = false;
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
    }; 

    setInterval(() => {
        if(!isPause) {
            if(!isOver) {
                time += 1;
                game.update(time);
            }
        }
    }, 1000);


    scene.start();
    return game;
}