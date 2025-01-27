import * as THREE from 'three';

export function createGameplay(infoGameplay) {

    function makeGameOver(condition=null, data= {reason: "", obj: {}, objKey: ""}) {

        // if(time > 10 && delay === 0 && population === 0 && food <= 0) {
        //     window.game.gameOver('idle')
        // }

        if(infoGameplay.funds < 0) {
             // ASK for debt
        }

        if(infoGameplay.debt > 500) {
            window.game.gameOver('debt', {'debt': infoGameplay.deads}, 'debt')
        }

        // On perd si plus de 10 morts
        if(infoGameplay.deads > 10) {
            window.game.gameOver('death', {'deads': infoGameplay.deads}, 'deads')
        }

        if(condition) {
            window.game.gameOver(data.reason, data.obj, data.objKey)
        }
    }

    return {
        makeGameOver
    }
}

