// HouseStore.js
import db from './db.js';

class HousesStore {
    /**
     * Retrieves all houses from the database.
     * @async
     * @returns {Promise<Array<Object>>} An array of house objects stored in the database.
     */
    async listAllHouses() {
        try {
            return await db.houses.toArray();
        } catch (error) {
            console.error('Failed to fetch houses:', error);
            throw error;
        }
    }

    /**
     * Adds a new house to the database.
     * @param {Object} data - The house data to add.
     * @param {string} data.name - The unique name of the house.
     * @returns {Promise<void>} Resolves when the house is successfully added.
     * @throws {Error} Throws an error if the house already exists or if there is another issue.
     */
    async addHouse(data) {
        try {
            await db.houses.add(data);
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
     * @param {Object} data - The house data to add.
     * @param {string} data.name - The unique name of the house.
     * @param {number} data.price - The price of the house to be deducted from the game funds.
     * @returns {Promise<void>} Resolves when the house is successfully added and funds are deducted.
     * @throws {Error} Throws an error if the house already exists, insufficient funds, or another issue.
     */
    async addHouseAndPay(data) {
        try {
            await db.transaction('rw', db.houses, db.game, async () => {
                const gameData = await db.game.toCollection().first();

                const gameFunds = gameData?.funds || 0;
                const gameDebt = gameData?.debt || 0;

                if (gameFunds < data.price) {
                    console.warn(`Not enough funds to build house ${data.name}.`);
                    return;
                }

                if (gameDebt > gameFunds) {
                    console.warn(`Not enough funds to build house ${data.name}: too much debt.`);
                    return;
                }

                gameData.funds = gameFunds - data.price;
                gameData.debt = gameDebt + data.price;

                await db.game.put(gameData);
                await db.houses.add(data);

                console.log(`House ${data.name} added successfully. New game funds: ${gameData.funds}, debts: ${gameData.debt}`);
            });
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
     * @param {Object} data - The house data to add.
     * @param {string} data.name - The unique name of the house.
     * @param {number} data.price - The price of the house to be deducted from the game funds.
     * @param {number} data.turn - The game turn associated with the house.
     * @returns {Promise<void>} Resolves when the house is successfully added and funds are deducted.
     * @throws {Error} Throws an error if the house already exists, insufficient funds, or another issue.
     */
    async addHouseAndPayUsingTurn(data) {
        try {
            await db.transaction('rw', db.houses, db.gameStates, async () => {
                const gameData = await db.gameStates.get(data.turn);

                if (!gameData) {
                    console.warn(`Game state for turn ${data.turn} not found.`);
                    return;
                }

                const gameFunds = gameData.funds || 0;
                const gameDebt = gameData.debt || 0;

                if (gameFunds < data.price) {
                    console.warn(`Not enough funds to build house ${data.name}.`);
                    return;
                }

                if (gameDebt > gameFunds) {
                    console.warn(`Not enough funds to build house ${data.name}: too much debt.`);
                    return;
                }

                gameData.funds = gameFunds - data.price;
                gameData.debt = gameDebt + data.price;

                await db.gameStates.put(gameData);
                await db.houses.add(data);

                console.log(`House ${data.name} added successfully. New game funds: ${gameData.funds}, debts: ${gameData.debt}`);
            });
        } catch (err) {
            if (err.name === 'ConstraintError') {
                console.error(`House ${data.name} already exists.`);
            } else {
                throw err;
            }
        }
    }


    /**
     * Retrieves all houses for a specific game turn.
     * @param {number} turn - The game turn to filter houses by.
     * @returns {Promise<Array<Object>>} An array of house objects for the specified turn.
     */
    async getHousesByTurn(turn) {
        try {
            return await db.houses.where('turn').equals(turn).toArray();
        } catch (error) {
            console.error(`Failed to fetch houses for turn ${turn}:`, error);
            throw error;
        }
    }

    /**
     * Retrieves the game state and associated houses for a specific turn.
     * @param {number} turn - The game turn to retrieve data for.
     * @returns {Promise<Object>} An object containing the game state and an array of associated houses.
     */
    async getGameStateWithHouses(turn) {
        try {
            // Fetch the game state for the specified turn
            const gameState = await db.gameStates.get(turn);

            // Fetch all houses associated with the specified turn
            const houses = await db.houses.where('turn').equals(turn).toArray();

            return { gameState, houses };
        } catch (error) {
            console.error(`Failed to fetch game state and houses for turn ${turn}:`, error);
            throw error;
        }
    }

}

export default HousesStore;
