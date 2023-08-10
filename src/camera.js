import * as THREE from 'three';

export function createCamera(gameWindow) { 
    // See the doc to know what numbers here mean > https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    const LEFT_MOUSE_BUTTON = 0;
    const MIDDLE_MOUSE_BUTTON = 1;
    const RIGHT_MOUSE_BUTTON = 2;

    const KEYBOARD_ZOOM_PLUS = '+';
    const KEYBOARD_ZOOM_MINUS = '-';

    // Camera constants for zooming in and out
    const MIN_CAMERA_RADIUS = 10;
    const MAX_CAMERA_RADIUS = 20;

    // Vector 
    const Y_AXIS = new THREE.Vector3(0, 1, 0);

    const camera = new THREE.PerspectiveCamera(75, gameWindow.offsetWidth / gameWindow.offsetHeight, 0.1, 1000);

    camera.position.z = 5;
    let cameraOrigin = new THREE.Vector3();
    let cameraRadius = (MAX_CAMERA_RADIUS + MIN_CAMERA_RADIUS) / 2;
    let cameraElevation = 45;
    let cameraAzimuth = 135;
    let isLeftMouseDown = false;
    let isRightMouseDown = false;
    let isMiddleMouseDown = false;
    let isZoomingMore = false;
    let isZoomingLess = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    updateCameraPosition();

    function onKeyBoardDown(event){
        if(event.key === KEYBOARD_ZOOM_PLUS){
            console.log('zooming +');
            isZoomingMore = true;
        }
        if(event.key === KEYBOARD_ZOOM_MINUS){
            console.log('zooming -');
            isZoomingLess = true;
        }
    }

    function onKeyBoardUp(event){
        if(event.key === KEYBOARD_ZOOM_PLUS){
            console.log('cease +');
            isZoomingMore = false;
        }
        if(event.key === KEYBOARD_ZOOM_MINUS){
            console.log('cease -');
            isZoomingLess = false;
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
        console.log('zooming stay');
        if(isZoomingMore){
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
          const forward = new THREE.Vector3(0,0,1).applyAxisAngle(Y_AXIS, cameraAzimuth * Math.PI / 180);
          const left = new THREE.Vector3(1,0,0).applyAxisAngle(Y_AXIS, cameraAzimuth * Math.PI / 180);
          cameraOrigin.add(forward.multiplyScalar(-deltaY * 0.01));
          cameraOrigin.add(left.multiplyScalar(-deltaX * 0.01));
          updateCameraPosition();
        }

        if(isRightMouseDown) {
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
        camera.position.add(cameraOrigin);
        camera.lookAt(cameraOrigin);
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