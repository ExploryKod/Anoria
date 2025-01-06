

function getBuildingZonesNeighbors(data, area=1) {

    const { city, buildings, x, y, currentBuildingId, terrain } = data;
 
     // South
     const neighborSouth = city.tiles[x]?.[y + area];
     const terrainS = terrain[x]?.[y + area];
 
     // North-East
     const neighborNorthEast = city.tiles[x + area]?.[y - 1];
     const terrainNE = terrain[x + area]?.[y - area];
   
     // East
     const neighborEast = city.tiles[x + area]?.[y];
     const terrainE = terrain[x + area]?.[y];
 
 
     // South-East
     const neighborSouthEast = city.tiles[x + area]?.[y + area];
     const terrainSE = terrain[x + area]?.[y + area];
 
 
     // North
     const neighborNorth = city.tiles[x]?.[y - area];
     const terrainN = terrain[x]?.[y - area];
 
 
     // South-West
     const neighborSouthWest = city.tiles[x - area]?.[y + area];
     const terrainSW = terrain[x - area]?.[y + area];
  
 
     // West
     const neighborWest = city.tiles[x - area]?.[y];
     const terrainW = terrain[x - area]?.[y];
    
 
     // North-West
     const neighborNorthWest = city.tiles[x - area]?.[y - area];
     const terrainNW = terrain[x - area]?.[y - area];

     return {
        neighborSouth,
        neighborNorthEast,
        neighborEast,
        neighborSouthEast,
        neighborNorth,
        neighborSouthWest,
        neighborWest,
        neighborNorthWest,
        terrainS,
        terrainNE,
        terrainE,
        terrainSE,
        terrainN,
        terrainSW,
        terrainW,
        terrainNW,
        currentBuildingId,
        terrain,
     }
}

/**
 * Updates the neighbor data for a building in the city grid.
 * @param {Object} params - Parameters for updating the building neighbors.
 * @param {Object} params.city - The city object containing tiles and their respective buildings.
 * @param {Array<Array<Object>>} params.city.tiles - The grid of city tiles.
 * @param {Object} params.buildings - The grid of buildings corresponding to the city tiles.
 * @param {number} params.x - The x-coordinate of the current building in the grid.
 * @param {number} params.y - The y-coordinate of the current building in the grid.
 * @param {string} params.currentBuildingId - The ID of the current building.
 * @returns {void}
 */
export function updateBuildingNeighbors(buildingData, area=1, time=0) {

    const { city, buildings, x, y, currentBuildingId, terrain } = buildingData;
    console.log("Terrain mesh > ", terrain)
    
    const neighbors =  getBuildingZonesNeighbors(buildingData, area)
    const areaKey = 'area' + '_' + area.toString();
    const allTerrainMeshInZone = [
        neighbors.terrainN,
        neighbors.terrainNW,
        neighbors.terrainNE,
        neighbors.terrainE,
        neighbors.terrainSE,
        neighbors.terrainSW,
        neighbors.terrainS,
        neighbors.terrainW
    ]

    const allBuildingsInZone = allTerrainMeshInZone.filter((mesh) => mesh.name !== 'grass')

    const areaObject = {areaKey : areaKey, time: time, allTerrainMeshInZone : allTerrainMeshInZone}

    if (!Object.hasOwn(buildings[x][y].userData, 'neighborZones')) {
        buildings[x][y].userData.neighborZones = {};
    }

    Object.assign(buildings[x][y].userData, { neighborS: neighbors.neighborSouth?.buildingId });
    Object.assign(buildings[x][y].userData, { neighborE: neighbors.neighborEast?.buildingId });
    Object.assign(buildings[x][y].userData, { neighborNE: neighbors.neighborNorthEast?.buildingId });
    Object.assign(buildings[x][y].userData, { neighborSE: neighbors.neighborSouthEast?.buildingId });
    Object.assign(buildings[x][y].userData, { neighborN: neighbors.neighborNorth?.buildingId });
    Object.assign(buildings[x][y].userData, { neighborSW: neighbors.neighborSouthWest?.buildingId });
    Object.assign(buildings[x][y].userData, { neighborW: neighbors.neighborWest?.buildingId });
    Object.assign(buildings[x][y].userData, { neighborNW: neighbors.neighborNorthWest?.buildingId });

 

  
    // Add all neighbors to a single array for convenience
    Object.assign(buildings[x][y].userData, {
        neighbors: [
            neighbors.neighborNorth,
            neighbors.neighborNorthWest,
            neighbors.neighborNorthEast,
            neighbors.neighborEast,
            neighbors.neighborSouthEast,
            neighbors.neighborSouthWest,
            neighbors.neighborSouth,
            neighbors.neighborWest,
        ],
    });

      // Add all neighbors to a single array for convenience
      Object.assign(buildings[x][y].userData, {
        neighborsNames: [
            neighbors.neighborNorth.buildingId,
            neighbors.neighborNorthWest.buildingId,
            neighbors.neighborNorthEast.buildingId,
            neighbors.neighborEast.buildingId,
            neighbors.neighborSouthEast.buildingId,
            neighbors.neighborSouthWest.buildingId,
            neighbors.neighborSouth.buildingId,
            neighbors.neighborWest.buildingId,
        ],
    });

    Object.assign(buildings[x][y].userData, {
        neighborsMeshs: [
            neighbors.terrainN,
            neighbors.terrainNW,
            neighbors.terrainNE,
            neighbors.terrainE,
            neighbors.terrainSE,
            neighbors.terrainSW,
            neighbors.terrainS,
            neighbors.terrainW
        ]
    });

    if(Object.hasOwn(buildings[x][y].userData, `neighborZones`)) {
        const buildingZones = buildings[x][y].userData.neighborZones
        if(!Object.hasOwn(buildingZones, areaKey)) {

            Object.assign(buildings[x][y].userData.neighborZones, {
                [areaKey]: areaObject       
            });

            console.log(`Building zones for area key on time ${time}: ` + areaKey, buildingZones);
            const areaKeyObj = buildings[x][y].userData.neighborZones[areaKey]
            console.log(`Area key obj `, areaKeyObj)
            if(areaKeyObj && Object.hasOwn(areaKeyObj, 'time') && areaKeyObj.time === time) {
                console.warn(`time for area key on time ${time}`)
            }   
            
           
           
        }
    } 

    Object.assign(buildings[x][y].userData, {
        neighborsTerrainNames: [
            neighbors.terrainN.name,
            neighbors.terrainNW.name,
            neighbors.terrainNE.name,
            neighbors.terrainE.name,
            neighbors.terrainSE.name,
            neighbors.terrainSW.name,
            neighbors.terrainS.name,
            neighbors.terrainW.name
        ]
    });

    Object.assign(buildings[x][y].userData, {
        neighborsUserDataIds: [
            neighbors.terrainN?.userData?.id,
            neighbors.terrainNW?.userData?.id,
            neighbors.terrainNE?.userData?.id,
            neighbors.terrainE?.userData?.id,
            neighbors.terrainSE?.userData?.id,
            neighbors.terrainSW?.userData?.id,
            neighbors.terrainS?.userData?.id,
            neighbors.terrainW?.userData?.id
        ]
    });


    console.log(
        `Building in zones ${area.toString()} on day ${time} for ${currentBuildingId} at x: ${x}, y: ${y} ==> `,
        buildings[x][y].userData.neighborZones 
    );

    console.log(
        `Building neighbors of ${currentBuildingId} at x: ${x}, y: ${y} ==> `,
        buildings[x][y].userData.neighbors
    );

    console.log(
        `Terrain neighbors of ${currentBuildingId} at x: ${x}, y: ${y} ==> `,
        buildings[x][y].userData.neighborsMeshs
    );

    console.log(
        `Neighbors Terrain ids of ${currentBuildingId} at x: ${x}, y: ${y} ==> `,
        buildings[x][y].userData.neighborsUserDataIds
    );

    console.log(
        `Neighbors Terrain Names of ${currentBuildingId} at x: ${x}, y: ${y} ==> `,
        buildings[x][y].userData.neighborsTerrainNames
    );


    console.log(
        `Building neighbors Names of ${currentBuildingId} at x: ${x}, y: ${y} ==> `,
        buildings[x][y].userData.neighborsNames
    );

}

export const IsInZoneLimits = (zoneLimit, city) => {

    if(!zoneLimit) {
        console.warn('[IsInZoneLimits] Zone limits must not be undefined');
        return false;
    }

    if(zoneLimit < 0) {
        console.warn('[IsInZoneLimits] Zone limits must be a positive integer');
        return false;
    }

    if(zoneLimit > city.size) {
        console.warn('[IsInZoneLimits] Zone limits must be less than or equal to city size');
        return false;
    }

    return x+1 < zoneLimit && y+1 < zoneLimit && x-1 > 0 && y-1 > 0
}

export const zoneBordersBuildings = (zoneLength, buildingData) => {
    const { city, x, y } = buildingData;

    if (!zoneLength) {
        console.warn('[zoneBordersBuildings] Zone length must not be undefined');
        return false;
    }

    if (zoneLength < 0) {
        console.warn('[zoneBordersBuildings] Zone length must be a positive integer');
        return false;
    }

    if (x == null || y == null) {
        console.warn('[zoneBordersBuildings] y and x coordinates have wrong values');
        return false;
    }

    // Helper function to safely get buildingId
    const getBuildingId = (tile) => tile?.buildingId || null;

    // Retrieve neighboring tiles and their buildingId
    const allImmediateNeighbors = [
        getBuildingId(city.tiles[x]?.[y + zoneLength]),      // South
        getBuildingId(city.tiles[x + zoneLength]?.[y + zoneLength]), // North-East
        getBuildingId(city.tiles[x + zoneLength]?.[y]),     // East
        getBuildingId(city.tiles[x + zoneLength]?.[y - zoneLength]), // South-East
        getBuildingId(city.tiles[x]?.[y - zoneLength]),     // North
        getBuildingId(city.tiles[x - zoneLength]?.[y - zoneLength]), // South-West
        getBuildingId(city.tiles[x - zoneLength]?.[y]),     // West
        getBuildingId(city.tiles[x - zoneLength]?.[y + zoneLength]), // North-West
    ];

    // Filter out null values
    return allImmediateNeighbors.filter(Boolean);
};

export function getBuildingsInZone(area, buildingData, buildingTarget="") {
    let buildingsInArea = [];

    if (!area) {
        console.warn('[getBuildingsInZone] Zone length must not be undefined');
        return false;
    }

    if (!buildingData) {
        console.warn('[getBuildingsInZone] buildingData must not be undefined');
        return false;
    }

    for (let i = 0; i < area; i++) {
        const zoneBuildings = zoneBordersBuildings(i, buildingData); 

        if (Array.isArray(zoneBuildings)) {
            buildingsInArea.push(...zoneBuildings.filter(value => value !== undefined));
        } else {
            console.warn(`[getBuildingsInZone] zoneBordersBuildings returned non-array at index ${i}`);
        }
    }

    if(buildingTarget) {
        return buildingsInArea.filter(buildingId => buildingId === buildingTarget);
    } 

    return buildingsInArea;
}



/**
 * Get a neighbor buildingId by its geographical position
 * @param {Object} building - The building object building[x][y]
 * @param {string} neighbor - The geographical position of the neighbor building
 */
export function getBuildingNeighbors(building, neighbors=[]) {
    if(!building.userData || !building.userData.neighborsNames || neighbors.length <= 0) {
        return false
    }
    const neighborNameFound = building.userData.neighborsNames.find((neighborName) => neighbors.includes(neighborName));
    return neighborNameFound ? neighborNameFound : false;
}

/**
 * create a suitable object to store as the database primary key or IndexDB unique keypath
 * @param {String} currentBuildingId - The game name of building id
 * @param {number} x - The x-coordinate of the current building in the grid.
 * @param {number} y - The y-coordinate of the current building in the grid.
 * @return {String} - The formatted unique key for indexDB or another database as buildingId-x-y
 */
export function makeDbItemId(currentBuildingId, x, y) {

    if(!currentBuildingId) {
        console.warn('there is no current building suitable id', currentBuildingId);
        return false;
    }

    if(x && y && currentBuildingId.length > 0) {
        return currentBuildingId + '-' + x + '-' + y;
    } else {
        console.warn('there is no current building suitable id or x/y suitable coordinates')
        return false
    }
}

/*
 * Function to create a building info text
 * @param {String} textContent - The text content to be displayed in the info building
 * @param {Boolean} isHTMLReset - Whether to reset the current info building text or not
 */
export function makeInfoBuildingText(textContent, isHTMLReset=true) {
    const infoObjectContent = document.querySelector('.info-building__body');
    
    if(!infoObjectContent) {
        console.warn('there is no info objects content wrapper div with class info-building__body');
        return false;
    }

    if(isHTMLReset) {
        infoObjectContent.innerHTML = ""
    }
    const buildingText = document.createElement('p');
    buildingText.classList.add('anoria-text');
    buildingText.classList.add('info-building-item');
    buildingText.textContent = textContent
    infoObjectContent.appendChild(buildingText);
}