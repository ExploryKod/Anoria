// db.js
import Dexie from 'dexie';

const db = new Dexie('anoriaDb');
db.version(1).stores({
    // 'houses' store:
    // - 'name' is the primary key
    // - 'turn' is an indexed property
    // - '[name+turn]' creates a compound index for 'name' and 'turn'
    houses: 'name, [name+price]',
    // 'game' store:
    // - 'turn' is the primary key
    game: 'name',
});

export default db;

