import * as THREE from 'three';

export function createCamera(gameWindow) { 
    // See the doc to know what numbers here mean > https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    const LEFT_MOUSE_BUTTON = 0;
    const MIDDLE_MOUSE_BUTTON = 1;
    const RIGHT_MOUSE_BUTTON = 2;

    const KEYBOARD_ZOOM_PLUS = '+';
    const KEYBOARD_ZOOM_MINUS = '-';

    // Camera constants for zooming in and out
    const MIN_CAMERA_RADIUS = 2;
    const MAX_CAMERA_RADIUS = 10;

    const camera = new THREE.PerspectiveCamera(75, gameWindow.offsetWidth / gameWindow.offsetHeight, 0.1, 1000);

    camera.position.z = 5;
    let cameraRadius = 4;
    let cameraElevation = 0;
    let cameraAzimuth = 0;
    let isLeftMouseDown = false;
    let isRightMouseDown = false;
    let isMiddleMouseDown = false;
    let isKeyboardZooming = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    updateCameraPosition();

    function onKeyBoardDown(event){
        if(event.key === KEYBOARD_ZOOM_PLUS){
            console.log('zooming +');
            isKeyboardZooming = true;
        }
        if(event.key === KEYBOARD_ZOOM_MINUS){
            console.log('zooming -');
            isKeyboardZooming = true;
        }
    }

    function onKeyBoardUp(event){
        if(event.key === KEYBOARD_ZOOM_PLUS){
            console.log('cease +');
            isKeyboardZooming = false;
        }
        if(event.key === KEYBOARD_ZOOM_MINUS){
            console.log('cease -');
            isKeyboardZooming = false;
        }
    }

    function onMouseDown(event){
        console.log('mouse down');
        if(event.button === LEFT_MOUSE_BUTTON){
            isLeftMouseDown = true;
        }
        if(event.button === RIGHT_MOUSE_BUTTON){
            isRightMouseDown = true;
        }
        if(event.button === MIDDLE_MOUSE_BUTTON){
            isMiddleMouseDown = true;
        }
    }

    function onMouseUp(event){
        console.log('mouse up');
        if(event.button === LEFT_MOUSE_BUTTON){
            isLeftMouseDown = false;
        }
        if(event.button === RIGHT_MOUSE_BUTTON){
            isRightMouseDown = false;
        }
        if(event.button === MIDDLE_MOUSE_BUTTON){
            isMiddleMouseDown = false;
        }
    }

    function onKeyBoardStay(event){ 
        if(isKeyboardZooming){
            cameraRadius += deltaY * 0.02;
            cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, cameraRadius));
            updateCameraPosition();
        }
    }

    function onMouseMove(event){
        console.log('mouse move');
        const deltaY = event.clientY - prevMouseY;
        const deltaX = event.clientX - prevMouseX;

        // Rotation of the camera
        if(isLeftMouseDown) {
            cameraAzimuth += -((deltaX) * 0.5);
            cameraElevation += deltaY * 0.5;
            cameraElevation = Math.min(90, Math.max(-90, cameraElevation));
            updateCameraPosition();
        }

        // zoom in and out
        if(isMiddleMouseDown) { 
            console.log('zooming');
            // 0.01 controls the speed of zooming
            cameraRadius += deltaY * 0.02;
            cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, cameraRadius));
            updateCameraPosition();
        }

        prevMouseX = event.clientX;
        prevMouseY = event.clientY;
    }

    function updateCameraPosition(){
        const thetaAzimuth = cameraAzimuth * Math.PI / 180;
        const phiElevation = cameraElevation * Math.PI / 180;
        camera.position.x = cameraRadius * Math.sin(thetaAzimuth) * Math.cos(phiElevation);
        camera.position.y = cameraRadius * Math.sin(phiElevation);
        camera.position.z = cameraRadius * Math.cos(thetaAzimuth) * Math.cos(phiElevation);
        camera.lookAt(0,0,0);
        camera.updateMatrix();
    }

    return {
        camera,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onKeyBoardDown,
        onKeyBoardUp,
        onKeyBoardStay

    }
}