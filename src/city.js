import { createScene } from './scene.js'
export function createCity(size) {
    const tiles = [];
    const neighbors = [];

    initialize();

    function initialize() {
        for(let x = 0; x < size; x++) {
            const column = [];
            for(let y = 0; y < size; y++) {
             const tile = createTile(x,y);
             column.push(tile);
            }
            tiles.push(column);
        }
    }

    function update() {
        for(let x = 0; x < size; x++) {
            for(let y = 0; y < size; y++) {
                tiles[x][y].update();
            }
        }
    }

    return  {
        size,
        tiles,
        update,
    }
}

function createTile(x,y) {

    const simpleHouses = [
        'House-Red',
        'House-Blue'
    ]

    return { 
        x, 
        y, 
        terrainId: 'grass',
        neighbors: [],
        buildingId: undefined,
        buildingData: {},
        food: 0,
        player: "",
        update(){

           if(this.buildingData.hasOwnProperty('neighborS')) {
               if(this.buildingData['neighborS'].buildingId === 'Market-Stall'
                   && simpleHouses.includes(this.buildingId)) {
                  this.buildingId = 'House-2Story'
               }
            }

        }
    };
}

function getTile(x, y, tiles, size) {
    if (x === undefined || y === undefined ||
        x < 0 || y < 0 ||
        x >= size || y >= size) {
        return null;
    } else {
        return tiles[x][y];
    }
}
