export function createCity(size) {
    const data = [];

    initialize();

    function initialize() {
        for(let x = 0; x < size; x++) {
            const column = [];
            for(let y = 0; y < size; y++) {
             const tile = { 
                x, 
                y, 
                building: undefined,
                update(){
                    console.log(`Updating tile at ${x}, ${y}`)
                }
            };
             if(Math.random() > 0.9) {
                 tile.building = 'building';
             }
             column.push(tile);
            }
            data.push(column);
        }
    }

    function update() {
            for(let x = 0; x < size; x++) {
                for(let y = 0; y < size; y++) {
                    data[x][y].update();
                }
        }
    }

    return  {
        size,
        data,
        update,
    }
}
