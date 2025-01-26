import { openDB, deleteDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';

/**
 * Class representing a database store for managing houses.
 */
export class Store {
    /**
     * Initializes the database instance.
     */
    constructor() {
        this.db = null;
    }

    /**
     * Initializes the database, creating the object store if it doesn't exist.
     * @async
     * @returns {Promise<void>}
     */
    async init() {
        await deleteDB('anoriaDb'); // Optional: Only use for development/testing
        this.db = await openDB('anoriaDb', 1, {
            upgrade(upgradeDB) {
                if (!upgradeDB.objectStoreNames.contains('houses')) {
                    upgradeDB.createObjectStore('houses', { keyPath: 'name' });
                }
            },
        });
        console.log('Database initialized.');
    }

    /**
     * Retrieves all houses from the database.
     * @async
     * @returns {Promise<Array<Object>>} An array of house objects.
     */
    async listAllHouses() {
        const tx = this.db.transaction('houses', 'readonly');
        const houseStore = tx.objectStore('houses');
        return await houseStore.getAll();
    }

    /**
     * Adds a new house to the database.
     * @async
     * @param {Object} data - The house data to add.
     * @returns {Promise<void>}
     */
    async addHouse(data) {
        const tx = this.db.transaction('houses', 'readwrite');
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
     * @async
     * @param {string} name - The name of the house to retrieve.
     * @returns {Promise<Object|null>} The house object or null if not found.
     */
    async getHouse(name) {
        const tx = this.db.transaction('houses', 'readonly');
        return await tx.objectStore('houses').get(name);
    }

    /**
     * Updates a house with specified changes passing a whole object.
     * @async
     * @param {string} name - The name of the house to update.
     * @param {Object} updates - The updates to apply to the house.
     * @returns {Promise<void>}
     */
    async updateHouseFields(name, updates) {
        const tx = this.db.transaction('houses', 'readwrite');
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
    async updateHouseField(entries, condition = false) {
        const { name, increment, field } = entries;
        console.info(`Updating house ${name}, field: ${field}, increment: ${increment}`);
        
        const house = await this.db.get('houses', name); 
        if (house) {
            if (field in house) {
                if (!condition) {
                    house[field] += increment;
                    await this.db.put('houses', house);
                } else if (condition && typeof condition === 'object' && 'operator' in condition && 'limit' in condition) {
                    const { operator, limit } = condition;
                    let isConditionMet = false;

                    switch (operator) {
                        case '<': isConditionMet = house[field] < limit; break;
                        case '<=': isConditionMet = house[field] <= limit; break;
                        case '>': isConditionMet = house[field] > limit; break;
                        case '>=': isConditionMet = house[field] >= limit; break;
                        default: console.error(`Invalid operator: ${operator}`); return;
                    }

                    if (isConditionMet) {
                        house[field] += increment;
                        await this.db.put('houses', house);
                    } else {
                        console.warn(`Condition not met for field ${field}. Update skipped.`);
                        return;
                    }
                }
            } else {
                console.warn(`Field ${field} does not exist in house ${name}`);
            }
        } else {
            console.warn(`House ${name} not found.`);
        }
    }

    /**
     * Deletes a house by its name.
     * @async
     * @param {string} name - The name of the house to delete.
     * @returns {Promise<void>}
     */
    async deleteOneHouse(name) {
        const tx = this.db.transaction('houses', 'readwrite');
        await tx.objectStore('houses').delete(name);
        console.log(`[DELETION SUCCEED] House or building ${name} deleted successfully.`);
    }

    /**
     * Clears all houses from the database.
     * @async
     * @returns {Promise<void>}
     */
    async clearHouses() {
        const tx = this.db.transaction('houses', 'readwrite');
        await tx.objectStore('houses').clear();
        console.log(`All houses cleared.`);
    }
}
