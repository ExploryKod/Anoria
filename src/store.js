import { openDB, deleteDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';


let db;

/**
 * Initializes the database, creating the object store if it doesn't exist.
 * Deletes the database during initialization for development/testing purposes.
 * 
 * @async
 * @returns {Promise<void>} Resolves when the database is initialized.
 */
export async function initAnoriaDb() {
    await deleteDB('anoriaDb'); // Optional: Only use for development/testing
    db = await openDB('anoriaDb', 1, {
        upgrade(upgradeDB) {
            if (!upgradeDB.objectStoreNames.contains('houses')) {
                upgradeDB.createObjectStore('houses', { keyPath: 'name' });
            }
            if (!upgradeDB.objectStoreNames.contains('game')) {
                upgradeDB.createObjectStore('game', { keyPath: 'name' });
            }
        },
    });
}

/**
 * Creates and manages the IndexedDB store for the application.
 * Provides methods to interact with the database.
 * 
 * @returns {Object} An object containing methods to interact with the IndexedDB store.
 * @property {Function} init - Initializes the database.
 * @property {Function} listAllHouses - Retrieves all houses from the database.
 * @property {Function} addHouse - Adds a new house to the database.
 * @property {Function} getHouse - Retrieves a house by its name.
 * @property {Function} updateHouseFields - Updates a house with specified changes.
 * @property {Function} updateHouseField - Updates a specific field of a house with an optional condition.
 * @property {Function} deleteOneHouse - Deletes a house by its name.
 * @property {Function} clearHouses - Clears all houses from the database.
 */
export function createHouseStore() {


/**
 * Retrieves all houses from the database.
 * 
 * @async
 * @returns {Promise<Array<Object>>} An array of house objects stored in the database.
 */
async function listAllHouses() {
    const tx = db.transaction('houses', 'readonly');
    const houseStore = tx.objectStore('houses');
    return await houseStore.getAll();
}

/**
 * Retrieves and calculates the total population of all houses in the city.
 * 
 * @async
 * @returns {Promise<number>} The total population of the city.
 */
async function getGlobalPopulation() {
    try {
        // Fetch all houses from the IndexedDB
        const houses = await listAllHouses();

        if (!houses || houses.length === 0) {
            console.warn("No houses found in the database.");
            return 0; // Return 0 if no houses are found
        }

        // Sum up the population (`pop` field) of all houses
        const totalPopulation = houses.reduce((total, house) => {
            // Only add if the house has a valid `pop` field
            if (house && typeof house.pop === 'number') {
                console.log('[store] Adding population to total')
                return total + house.pop;
            }
            return total; 
        }, 0);

        console.log(`[store] Total population of the city: ${totalPopulation}`);
        return totalPopulation;
    } catch (error) {
        console.error("Error calculating global population:", error);
        return 0; 
    }
}


    /**
     * Adds a new house to the database.
     * 
     * @async
     * @param {Object} data - The house data to add.
     * @param {string} data.name - The unique name of the house (used as the key).
     * @returns {Promise<void>} Resolves when the house is successfully added.
     * @throws {Error} Throws an error if the house already exists or if there is another issue.
     */
    async function addHouse(data) {
        const tx = db.transaction('houses', 'readwrite');
        try {
            await tx.objectStore('houses').add(data);
            console.log(`House ${data.name} added successfully.`);
        } catch (err) {
            if (err.name === 'ConstraintError') {
                console.error(`House ${data.name} already exists.`);
            } else {
                throw err;
            }
        }
    }

    /**
     * Retrieves a house by its name.
     * 
     * @async
     * @param {string} name - The name of the house to retrieve.
     * @returns {Promise<Object|null>} The house object if found, or null otherwise.
     */
    async function getHouse(name) {
        const tx = db.transaction('houses', 'readonly');
        console.log(`House ${name} is retrieving.`);
        return await tx.objectStore('houses').get(name) || false;
    }

    /**
     * Return a specific field of a house.
     * 
     * @async
     * @param {String} name - Contains the unique name the building
     * @param {String} key - the specific key we want to retrieve the value from a building (as : pop for population number in a house)
     * @returns {Promise<Object|boolean>}
    */
    async function getHouseItem(name, key) {
        const house = await getHouse(name);
        if (house) {
            return house[key];
        } else {
            console.warn(`House ${name} not found.`);
            return false;
        }
    }

    /**
     * Updates a house with specified changes.
     * 
     * @async
     * @param {string} name - The name of the house to update.
     * @param {Object} updates - The updates to apply to the house.
     * @returns {Promise<void>} Resolves when the house is successfully updated.
     */
    async function updateHouseFields(name, updates) {
        const tx = db.transaction('houses', 'readwrite');
        const houseStore = tx.objectStore('houses');

        const house = await houseStore.get(name);
        if (house) {
            Object.assign(house, updates);
            await houseStore.put(house);
            console.log(`House ${name} updated successfully.`);
        } else {
            console.warn(`House ${name} not found.`);
        }
    }

    /**
     * Updates the name of a house in the IndexedDB while preserving all its data.
     * 
     * @async
     * @param {string} oldName - The current name of the house.
     * @param {string} newName - The new name to assign to the house.
     * @returns {Promise<void>} Resolves when the house name is successfully updated.
     */
    async function updateHouseName(oldName, newName) {
        const tx = db.transaction('houses', 'readwrite');
        const houseStore = tx.objectStore('houses');

        if(oldName === newName) {
            console.warn("New name is the same as the old name. No changes made.");
            return
        }

        try {
            // Retrieve the house with the old name
            const house = await houseStore.get(oldName);
            if (!house) {
                console.warn(`House ${oldName} not found.`);
                return;
            }

            // Delete the old entry
            await houseStore.delete(oldName);
            console.log(`House ${oldName} deleted successfully`)

            // Update the name property in the object
            house.name = newName;

            // Add the updated object back into the store
            await houseStore.put(house); // No key parameter needed

            console.log(`House name updated from ${oldName} to ${newName}.`);
        } catch (error) {
            console.error(`Error updating house name from ${oldName} to ${newName}:`, error);
        }
    }


    /**
     * Updates a specific field of a house with a condition.
     * @async
     * @param {Object} entries - Contains the data to update the house.
     * @param {string} entries.name - The name of the house to update.
     * @param {number} entries.increment - The amount to increment the field by.
     * @param {string} entries.field - The field of the house to update (e.g., 'pop').
     * @param {Object | boolean} condition - The condition for updating the field.
     * @param {string} [condition.operator] - The operator to use for the condition ('<=', '>=', '<', '>').
     * @param {number} [condition.limit] - The value to compare the field against when applying the condition.
     * @returns {Promise<void>}
     */
    async function updateHouseField(entries, condition = false) {
        const { name, increment, field } = entries;
        console.info(`Updating house ${name}, field: ${field}, increment: ${increment}`);
        
        const house = await db.get('houses', name); 
        console.info('store js - house updated, data: ', house);

        if (house) {
            if (field in house) {
                // If no condition is provided, apply the increment directly
                if (!condition) {
                    house[field] += increment;
                    await db.put('houses', house);
                    console.info(`House outside condition ${name} field ${field} incremented by ${increment}. New value: ${house[field]}`);
                }

                // If a condition is provided, check if it is met before applying the increment
                if (condition && typeof condition === 'object' && 'operator' in condition && 'limit' in condition) {
                    const { operator, limit } = condition;

                    let isConditionMet = false;

                    // Check the condition based on the operator
                    switch (operator) {
                        case '<':
                            isConditionMet = house[field] < limit;
                            break;
                        case '<=':
                            isConditionMet = house[field] <= limit;
                            break;
                        case '>':
                            isConditionMet = house[field] > limit;
                            break;
                        case '>=':
                            isConditionMet = house[field] >= limit;
                            break;
                        default:
                            console.error(`Invalid operator: ${operator}`);
                            return;
                    }
                    console.log("[before iscondition] la condition est ", isConditionMet);
                    // If the condition is met, increment the field
                    if (isConditionMet) {
                        house[field] += increment;
                        await db.put('houses', house);
                        console.info(`House inside condition ${name} field ${field} incremented by ${increment}. New value: ${house[field]}`);
                    } else {
                        console.warn(`Condition not met for field ${field}. Update skipped.`);
                        return;  // Stop the update if the condition is not met
                    }
                }

                console.info(`House ${name} field ${field} updated in IndexedDB.`);
            } else {
                console.warn(`Field ${field} does not exist in house ${name}`);
            }
        } else {
            console.warn(`House ${name} not found.`);
        }
    }

    /**
     * Deletes a house by its name.
     * 
     * @async
     * @param {string} name - The name of the house to delete.
     * @returns {Promise<void>} Resolves when the house is successfully deleted.
     */
    async function deleteOneHouse(name) {
        const tx = db.transaction('houses', 'readwrite');
        await tx.objectStore('houses').delete(name);
        console.log(`House ${name} deleted successfully.`);
    }

    /**
     * Clears all houses from the database.
     * 
     * @async
     * @returns {Promise<void>} Resolves when all houses are successfully cleared.
     */
    async function clearHouses() {
        const tx = db.transaction('houses', 'readwrite');
        await tx.objectStore('houses').clear();
        console.log(`All houses cleared.`);
    }

    // Event listener for unhandled rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error(`Unhandled error: ${event.reason.message}`);
    });

    return {
        listAllHouses,
        addHouse,
        getHouse,
        getHouseItem,
        updateHouseFields,
        updateHouseField,
        deleteOneHouse,
        getGlobalPopulation,
        clearHouses,
        updateHouseName
    };
}


export function createGameStore() {


    /**
     * Adds a new house to the database.
     * 
     * @async
     * @param {Object} data - The game data to add.
     * @param {string} data.name - The unique name of the game item (used as the key).
     * @returns {Promise<void>} Resolves when the game item is successfully added.
     * @throws {Error} Throws an error if the game item already exists or if there is another issue.
     */
    async function addGameItems(data) {
        const tx = db.transaction('game', 'readwrite');
        try {
            await tx.objectStore('game').add(data);
            console.log(`Game object ${data.name} added successfully.`);
        } catch (err) {
            if (err.name === 'ConstraintError') {
                console.error(`Game object ${data.name} already exists.`);
            } else {
                throw err;
            }
        }
    }

    return {
        addGameItems
    }
    
}