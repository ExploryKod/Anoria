import {deleteDB, openDB} from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';


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
                const housesStore = upgradeDB.createObjectStore('houses', { keyPath: 'name' });
                housesStore.createIndex('name_price', ['name', 'price']);
            }
            if (!upgradeDB.objectStoreNames.contains('game')) {
                upgradeDB.createObjectStore('game', { keyPath: 'name' });
            }
        },
    });
}

export function getStores() {

    async function listAllFromStores() {
        try {
            const tx = db.transaction(['houses', 'game'], 'readonly');
            const housesStore = tx.objectStore('houses');
            const gameStore = tx.objectStore('game');

            const housesData = await housesStore.getAll();
            const gameData = await gameStore.getAll();

            return {
                houses: housesData,
                game: gameData,
            };
        } catch (error) {
            console.error('Error fetching data from stores:', error);
            return { houses: [], game: [] };
        }
    }

    return {
        listAllFromStores
    }

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
 * Retrieves all houses sorted by name and price.
 *
 * @async
 * @returns {Promise<Array>} List of houses sorted by name and price.
 */
async function getAllHousesSortedByNameAndPrice() {
    const tx = db.transaction('houses', 'readonly');
    const store = tx.objectStore('houses');
    const index = store.index('name_price'); // Access the index

    // Retrieve all houses sorted by name and price
    const houses = await index.getAll();
    // Map the result to return only the name and price fields
    return houses.map(house => ({
        name: house.name,
        price: house.price
    }));
}

    /**
     * Retrieves and calculates the total price of each type of house.
     *
     * @async
     * @returns {Promise<Object>} An object where the keys are house types and the values are the total expenses for that type.
     */
    async function getTotalBuildingExpensesByType() {
        const tx = db.transaction('houses', 'readonly');
        const store = tx.objectStore('houses');
        const index = store.index('name_price'); // Access the index

        // Retrieve all houses sorted by name and price
        const houses = await index.getAll();

        // Create an object to store the total expenses by house type
        const expensesByType = {};

        // Iterate over each house and accumulate expenses by type
        houses.forEach(house => {
            if (house && house.name && house.price) {
                // Extract the house type from the name (e.g., "House-Red")
                const houseType = house.name.split('-').slice(0, 2).join('-'); // "House-Red"

                // Accumulate the price for the house type
                if (!expensesByType[houseType]) {
                    expensesByType[houseType] = 0;
                }
                expensesByType[houseType] += house.price;
            }
        });

        return expensesByType;
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
     * Retrieves and calculates the total prices of immobilisations of all buildings in the city.
     *
     * @async
     * @returns {Promise<number>} The total immobilisation paiements of the city.
     */
    async function getGlobalBuildingPrices() {
        try {
            const houses = await listAllHouses();

            if (!houses || houses.length === 0) {
                console.warn("No houses found in the database.");
                return 0; // Return 0 if no houses are found
            }

            const totalImmoExpenses = houses.reduce((total, house) => {

                if (house && typeof house.price === 'number') {
                    console.log(`[store] Adding price ${house.price} to total`)
                    return total + house.price;
                }
                return total;
            }, 0);

            console.log(`[store] Total population of the city: ${totalImmoExpenses}`);
            return totalImmoExpenses;
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
     * Adds a new house to the database and deducts its price from the game funds.
     *
     * @async
     * @param {Object} data - The house data to add.
     * @param {string} data.name - The unique name of the house (used as the key).
     * @param {number} data.price - The price of the house to be deducted from the game funds.
     * @returns {Promise<void>} Resolves when the house is successfully added and funds are deducted.
     * @throws {Error} Throws an error if the house already exists, insufficient funds, or another issue.
     */
    async function addHouseAndPay(data) {
        const tx = db.transaction(['houses', 'game'], 'readwrite'); // Transaction on both houses and game stores
        try {
            // Fetch the current game data (only one entry)
            const gameStore = tx.objectStore('game');
            const gameData = await gameStore.getAll();

            console.log("[STORE - houseandpays] game store data", gameData);

            const gameFunds = gameData[0]?.funds || 0;
            const gameDebt = gameData[0]?.debt || 0;
            const balance = gameFunds - gameDebt

            console.log("[STORE - houseandpays] data price", data.price)
            console.log("[STORE - houseandpays] dataname", data.name)
            console.log("[STORE - houseandpays] gameFunds", gameFunds)
            console.log("[STORE - houseandpays] gameFunds", gameDebt)
            // Check if there are enough funds to build the house
            if (gameFunds < data.price) {
                console.warn(`Not enough funds to build house ${data.name}.`);
                return;
            }

            // Check if there are enough funds to build the house
            if (gameDebt > gameFunds) {
                console.warn(`Not enough funds to build house ${data.name} : too much debt`);
                return;
            }

            gameData[0].funds = gameFunds - data.price;
            gameData[0].debt = gameDebt + data.price;

            await gameStore.put(gameData[0]);

            // Add the new house to the houses store
            const housesStore = tx.objectStore('houses');
            await housesStore.add(data);
            console.log(`[ADDED STORE House ${data.name} added successfully. New game funds: ${gameData[0].funds} debts: ${gameData[0].debts}`);

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
            if(!Object.hasOwn(house, key)) {
                console.warn(`Key ${key} not found in this building.`);
                return false;
            }
            return house[key];
        } else {
            console.warn(`Building ${name} not found.`);
            return false;
        }
    }

    /**
     * Updates specific fields of a house, appending to arrays if specified.
     *
     * @async
     * @param {string} name - The name of the house to update.
     * @param {Object} updates - The updates to apply to the house. Arrays can be appended if specified.
     * @param {boolean} appendToArrays - Whether to append to arrays instead of overwriting them (default: false).
     * @returns {Promise<void>} Resolves when the house is successfully updated.
     */
    async function updateHouseFields(name, updates, appendToArrays = false) {
        const tx = db.transaction('houses', 'readwrite');
        const houseStore = tx.objectStore('houses');

        // Fetch the existing house data
        const house = await houseStore.get(name);
        if (house) {
            for (const key in updates) {
                if (updates[key] !== undefined) {
                    // Append to arrays if specified
                    if (Array.isArray(house[key]) && Array.isArray(updates[key]) && appendToArrays) {
                        house[key] = [...house[key], ...updates[key]];
                    } else {
                        // Overwrite the field
                        house[key] = updates[key];
                    }
                }
            }

            // Save the updated house back to the store
            await houseStore.put(house);
            console.log(`House ${name} updated successfully with updates:`, updates);
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
    async function updateHouseName(oldName, newName, keys = {}) {
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
            if(keys.hasOwnProperty('type') && house.type) {
                house.type = keys.type;
            }

            if(keys.hasOwnProperty('price') && house.price) {
                house.price = keys.price;
            }

            // Add the updated object back into the store
            await houseStore.put(house); // No key parameter needed

            console.log(`House name and price updated from ${oldName} to ${newName}.`);
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
    async function incrementHouseField(entries, condition = false) {
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

    /**
     * Retrieves and calculates the total price and number of houses for each type of house, including a global expense.
     *
     * @async
     * @returns {Promise<Object>} An object where the keys are house types, the values are the total expenses for that type,
     *                             the number of houses for that type, and the global expense for all houses is included.
     */
    async function getEachBuildingsExpenses() {
        const tx = db.transaction('houses', 'readonly');
        const store = tx.objectStore('houses');
        const index = store.index('name_price'); // Access the index

        // Retrieve all houses sorted by name and price
        const houses = await index.getAll();

        // Create an object to store the total expenses and house count by house type
        const expensesByType = {};
        let globalExpense = 0; // Initialize global expense

        // Iterate over each house and accumulate expenses and count by type
        houses.forEach(house => {
            if (house && house.name && house.price && house.type) {
                // Use the house type directly (e.g., "House-Red", "House-Blue")
                const houseType = house.type;

                // Initialize the type if not already in the object
                if (!expensesByType[houseType]) {
                    expensesByType[houseType] = { price: 0, number: 0 };
                }

                // Accumulate the price for the house type
                expensesByType[houseType].price += house.price;

                // Directly increment the number of houses by 1 for each house
                expensesByType[houseType].number += 1;

                // Accumulate the global expense
                globalExpense += house.price;
            }
        });

        // Add the global expense as a key in the result
        expensesByType.globalExpense = globalExpense;

        return expensesByType;
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
        incrementHouseField,
        deleteOneHouse,
        getGlobalPopulation,
        clearHouses,
        updateHouseName,
        getGlobalBuildingPrices,
        getAllHousesSortedByNameAndPrice,
        getTotalBuildingExpensesByType,
        getEachBuildingsExpenses,
        addHouseAndPay
    };
}


export function createGameStore() {

    /**
     * Retrieves all game items from the database.
     *
     * @async
     * @returns {Promise<Array<Object>>} An array of game objects stored in the database.
     */
    async function listAllGameItems() {
        const tx = db.transaction('game', 'readonly');
        const gameStore = tx.objectStore('game');
        return await gameStore.getAll();
    }

    /**
     * Retrieves a game item by its name.
     *
     * @async
     * @param {string} name - The name of the game item to retrieve.
     * @returns {Promise<Object|null>} The game item object if found, or null otherwise.
     */
    async function getGameItem(name) {
        const tx = db.transaction('game', 'readonly');
        return await tx.objectStore('game').get(name) || null;
    }

    /**
     * Retrieves a game item in the lastest row.
     * @async
     * @param {string} fieldName
     * @returns {Promise<Object|null>} The game item object if found, or null otherwise.
     */
    async function getLatestGameItemByField(fieldName) {
        const tx = db.transaction('game', 'readonly');
        const store = tx.objectStore('game');

        // Open a cursor in reverse order
        const cursor = await store.openCursor(null, 'prev');
        while (cursor) {
            if (fieldName in cursor.value) {
                return cursor.value[fieldName]; // Return the first row where the field exists
            }
            await cursor.continue(); // Move to the next (previous in reverse order) row
        }

        return null; // No matching rows found
    }

    /**
     * Retrieves all game items in the latest row.
     *
     * @async
     * @returns {Promise<Object[]>} An array of game items from the latest row.
     */
    async function getLatestGameItems() {
        const tx = db.transaction('game', 'readonly');
        const store = tx.objectStore('game');

        const items = [];
        let cursor = await store.openCursor(null, 'prev'); // Open cursor in reverse order

        while (cursor) {
            items.push(cursor.value); // Collect each item in the latest row
            cursor = await cursor.continue(); // Move to the next (previous in reverse order) row
        }

        return items.length > 0 ? items : null; // Return all items or null if no items found
    }




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

    /**
     * Updates the latest game item with specified changes.
     *
     * @async
     * @param {Object} updates - The updates to apply to the latest game item.
     * @returns {Promise<void>} Resolves when the latest game item is successfully updated.
     */
    async function updateLatestGameItemFields(updates) {
        const tx = db.transaction('game', 'readwrite');
        const gameStore = tx.objectStore('game');

        // Get the latest game item using a cursor in reverse order
        const cursor = await gameStore.openCursor(null, 'prev');
        if (cursor) {
            const gameItem = cursor.value; // Fetch the latest row
            Object.assign(gameItem, updates); // Apply updates
            await gameStore.put(gameItem); // Save the updated item back to the store
            console.log(`Latest game item updated successfully with changes:`, updates);
        } else {
            console.warn('No game items found to update.');
        }
    }


    /**
     * Updates a game item with specified changes.
     *
     * @async
     * @param {string} name - The name of the game item to update.
     * @param {Object} updates - The updates to apply to the game item.
     * @returns {Promise<void>} Resolves when the game item is successfully updated.
     */
    async function updateGameItemFields(name, updates) {
        const tx = db.transaction('game', 'readwrite');
        const gameStore = tx.objectStore('game');

        const gameItem = await gameStore.get(name);
        if (gameItem) {
            Object.assign(gameItem, updates);
            await gameStore.put(gameItem);
            console.log(`Game item ${name} updated successfully.`);
        } else {
            console.warn(`Game item ${name} not found.`);
        }
    }

    /**
     * Updates all game items with specified changes, but only updates keys that have changed.
     *
     * @async
     * @param {Object} updates - The updates to apply to the game items.
     * @returns {Promise<void>} Resolves when the updates are successfully applied.
     */
    async function updateAllGameItems(updates) {
        const tx = db.transaction('game', 'readwrite');
        const gameStore = tx.objectStore('game');
        console.warn(`[STORE] Game object will update all games.`);
        const allGameItems = await gameStore.getAll();

        for (const gameItem of allGameItems) {
            let hasChanges = false;
            for (const key in updates) {
                if (updates.hasOwnProperty(key) && gameItem[key] !== updates[key]) {
                    gameItem[key] = updates[key];
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                await gameStore.put(gameItem);
                console.warn(`[STORE] Game item ${gameItem.name} updated with changes:`, updates);
            } else {
                console.warn(`[STORE] No changes detected for game item ${gameItem.name}.`);
            }
        }

        console.log("All applicable game items have been updated.");
    }


    /**
     * Deletes a game item by its name.
     *
     * @async
     * @param {string} name - The name of the game item to delete.
     * @returns {Promise<void>} Resolves when the game item is successfully deleted.
     */
    async function deleteGameItem(name) {
        const tx = db.transaction('game', 'readwrite');
        await tx.objectStore('game').delete(name);
        console.log(`Game item ${name} deleted successfully.`);
    }

    /**
     * Clears all game items from the database.
     *
     * @async
     * @returns {Promise<void>} Resolves when all game items are successfully cleared.
     */
    async function clearGameItems() {
        const tx = db.transaction('game', 'readwrite');
        await tx.objectStore('game').clear();
        console.log(`All game items cleared.`);
    }

    // Event listener for unhandled rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error(`Unhandled error: ${event.reason.message}`);
    });

    return {
        addGameItems,
        listAllGameItems,
        getGameItem,
        updateGameItemFields,
        clearGameItems,
        deleteGameItem,
        updateAllGameItems,
        getLatestGameItemByField,
        getLatestGameItems,
        updateLatestGameItemFields
    }
    
}


/**
 * https://web.dev/articles/indexeddb
 * import {openDB} from 'idb';
 *
 * async function searchItems (lower, upper) {
 *   if (!lower === '' && upper === '') {
 *     return;
 *   }
 *
 *   let range;
 *
 *   if (lower !== '' && upper !== '') {
 *     range = IDBKeyRange.bound(lower, upper);
 *   } else if (lower === '') {
 *     range = IDBKeyRange.upperBound(upper);
 *   } else {
 *     range = IDBKeyRange.lowerBound(lower);
 *   }
 *
 *   const db = await openDB('test-db4', 1);
 *   const tx = await db.transaction('foods', 'readonly');
 *   const index = tx.store.index('price');
 *
 *   // Open a cursor on the designated object store:
 *   let cursor = await index.openCursor(range);
 *
 *   if (!cursor) {
 *     return;
 *   }
 *
 *   // Iterate on the cursor, row by row:
 *   while (cursor) {
 *     // Show the data in the row at the current cursor position:
 *     console.log(cursor.key, cursor.value);
 *
 *     // Advance the cursor to the next row:
 *     cursor = await cursor.continue();
 *   }
 * }
 *
 * // Get items priced between one and four dollars:
 * searchItems(1.00, 4.00);
 */