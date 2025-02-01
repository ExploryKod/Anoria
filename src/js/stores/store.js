import {deleteDB, openDB} from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';
import db  from './db.js';

// let db;
//
// /**
//  * Initializes the database, creating the object store if it doesn't exist.
//  * Deletes the database during initialization for development/testing purposes.
//  *
//  * @async
//  * @returns {Promise<void>} Resolves when the database is initialized.
//  */
// export async function initAnoriaDb() {
//     await deleteDB('anoriaDb'); // Optional: Only use for development/testing
//     db = await openDB('anoriaDb', 1, {
//         upgrade(upgradeDB) {
//             if (!upgradeDB.objectStoreNames.contains('houses')) {
//                 const housesStore = upgradeDB.createObjectStore('houses', { keyPath: 'name' });
//                 housesStore.createIndex('name_price', ['name', 'price']);
//             }
//             if (!upgradeDB.objectStoreNames.contains('game')) {
//                 upgradeDB.createObjectStore('game', { keyPath: 'name' });
//             }
//         },
//     });
// }

export function createHouseStore() {

    // List all houses
    async function listAllHouses() {
        return await db.houses.toArray();
    }

    // Get all houses sorted by name and price
    async function getAllHousesSortedByNameAndPrice() {
        return await db.houses.orderBy(['name', 'price']).toArray();
    }

    // Get total expenses by type
    async function getTotalBuildingExpensesByType() {
        const houses = await db.houses.toArray();
        const expensesByType = {};

        houses.forEach(house => {
            const houseType = house.name.split('-').slice(0, 2).join('-'); // Example: "House-Red"
            if (!expensesByType[houseType]) {
                expensesByType[houseType] = 0;
            }
            expensesByType[houseType] += house.price;
        });

        return expensesByType;
    }

    // Get global population (sum of population of all houses)
    async function getGlobalPopulation() {
        const houses = await listAllHouses();
        return houses.reduce((total, house) => total + (house.pop || 0), 0);
    }

    // Get global building prices (sum of all house prices)
    async function getGlobalBuildingPrices() {
        const houses = await listAllHouses();
        return houses.reduce((total, house) => total + (house.price || 0), 0);
    }

    // Add a new house
    async function addHouse(data) {
        try {
            await db.houses.add(data);
            console.log(`House ${data.name} added successfully.`);
        } catch (err) {
            console.error(`Error adding house: ${err.message}`);
        }
    }

    // Add a new house and deduct funds from the game store
    async function addHouseAndPay(data) {
        const gameData = await db.game.toArray();
        const gameFunds = gameData[0]?.funds || 0;
        const gameDebt = gameData[0]?.debt || 0;
        const balance = gameFunds - gameDebt;

        if (gameFunds < data.price) {
            console.warn(`Not enough funds to build house ${data.name}.`);
            return;
        }

        // Deduct funds and add debt
        gameData[0].funds = gameFunds - data.price;
        gameData[0].debt = gameDebt + data.price;
        await db.game.put(gameData[0]);

        // Add house to the houses store
        await addHouse(data);
    }

    // Get house by name
    async function getHouse(name) {
        return await db.houses.get(name);
    }

    // Get a specific field of a house
    async function getHouseItem(name, key) {
        const house = await getHouse(name);
        if (house && key in house) {
            return house[key];
        }
        console.warn(`Key ${key} not found in house ${name}`);
        return false;
    }

    // Update specific fields of a house
    async function updateHouseFields(name, updates, appendToArrays = false) {
        const house = await db.houses.get(name);
        if (house) {
            for (const key in updates) {
                if (updates[key] !== undefined) {
                    if (Array.isArray(house[key]) && appendToArrays) {
                        house[key] = [...house[key], ...updates[key]];
                    } else {
                        house[key] = updates[key];
                    }
                }
            }
            await db.houses.put(house);
        }
    }

    // Update house name
    async function updateHouseName(oldName, newName, keys = {}) {
        const house = await db.houses.get(oldName);
        if (house) {
            house.name = newName;
            if (keys.type) house.type = keys.type;
            if (keys.price) house.price = keys.price;
            await db.houses.put(house);
            await db.houses.delete(oldName);
        }
    }

    // Increment a house field by a given amount
    async function incrementHouseField(entries, condition = false) {
        const { name, increment, field } = entries;
        const house = await db.houses.get(name);
        if (house && house[field] !== undefined) {
            if (!condition || (house[field] < condition.limit)) {
                house[field] += increment;
                await db.houses.put(house);
            }
        }
    }

    // Delete one house
    async function deleteOneHouse(name) {
        await db.houses.delete(name);
    }

    // Clear all houses from the database
    async function clearHouses() {
        await db.houses.clear();
    }

    // Get each building's expenses, grouped by type
    async function getEachBuildingsExpenses() {
        const houses = await db.houses.toArray();
        const expensesByType = {};
        let globalExpense = 0;

        houses.forEach(house => {
            const houseType = house.type;
            if (!expensesByType[houseType]) {
                expensesByType[houseType] = { price: 0, number: 0 };
            }

            expensesByType[houseType].price += house.price;
            expensesByType[houseType].number += 1;
            globalExpense += house.price;
        });

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
        return await db.game.toArray();
    }

    /**
     * Retrieves a game item by its name.
     *
     * @async
     * @param {string} name - The name of the game item to retrieve.
     * @returns {Promise<Object|null>} The game item object if found, or null otherwise.
     */
    async function getGameItem(name) {
        return await db.game.get(name) || null;
    }

    /**
     * Retrieves a game item in the lastest row.
     * @async
     * @param {string} fieldName
     * @returns {Promise<Object|null>} The game item object if found, or null otherwise.
     */
    async function getLatestGameItemByField(fieldName) {
        const items = await db.game.toArray();
        for (let i = items.length - 1; i >= 0; i--) {
            if (fieldName in items[i]) {
                return items[i][fieldName]; // Return the first row where the field exists
            }
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
        const items = await db.game.toArray();
        return items.length > 0 ? items.reverse() : null; // Return all items in reverse order, or null if no items
    }

    /**
     * Adds a new game item to the database.
     *
     * @async
     * @param {Object} data - The game data to add.
     * @param {string} data.name - The unique name of the game item (used as the key).
     * @returns {Promise<void>} Resolves when the game item is successfully added.
     * @throws {Error} Throws an error if the game item already exists or if there is another issue.
     */
    async function addGameItems(data) {
        try {
            await db.game.add(data);
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
        const items = await db.game.toArray();
        if (items.length > 0) {
            const gameItem = items[items.length - 1]; // Get the latest game item
            Object.assign(gameItem, updates); // Apply updates
            await db.game.put(gameItem); // Save the updated item
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
        const gameItem = await db.game.get(name);
        if (gameItem) {
            Object.assign(gameItem, updates);
            await db.game.put(gameItem);
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
        const allGameItems = await db.game.toArray();

        for (const gameItem of allGameItems) {
            let hasChanges = false;
            for (const key in updates) {
                if (updates.hasOwnProperty(key) && gameItem[key] !== updates[key]) {
                    gameItem[key] = updates[key];
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                await db.game.put(gameItem);
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
        await db.game.delete(name);
        console.log(`Game item ${name} deleted successfully.`);
    }

    /**
     * Clears all game items from the database.
     *
     * @async
     * @returns {Promise<void>} Resolves when all game items are successfully cleared.
     */
    async function clearGameItems() {
        await db.game.clear();
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
        updateLatestGameItemFields,
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