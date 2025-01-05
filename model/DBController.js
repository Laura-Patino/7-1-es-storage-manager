import * as SQLite from 'expo-sqlite';

// Classe con metodi dinamici per la gestione del DB
export default class DBController {

    static db = null;

    static async openDB() {
        if (DBController.db) return;

        //inizializzo e apro il DB
        DBController.db = await SQLite.openDatabaseAsync('ProgettoDB');
        const query = "CREATE TABLE IF NOT EXISTS MenuImage(mid INTEGER PRIMARY KEY, imageVersion INTEGER, image TEXT);"; //, lat REAL, lng REAL);"; 
        try {
            await DBController.db.execAsync(query); //execAsync usata per creare tabelle
        } catch (error) {
            console.error("Errore creazione tabella: ", error);
        }
    }

    //inserisco un nuovo menu nel DB
    static async insertMenuImage(mid, imageVersion, image) {
        if (!DBController.db) await this.openDB();

        const query = "INSERT INTO MenuImage(mid, imageVersion, image) VALUES (?, ?, ?);";
        try {
            const res = await DBController.db.runAsync(query, mid, imageVersion, image); //runAsync usata per inserire dati
            console.log(res.lastInsertRowId, res.changes);
        } catch (error) {
            console.error("Errore inserimento menu: ", error);
        }
    }

    //controlla se il menu (mid) è già presente nel DB, altrimenti return null
    static async getMenuByMid(mid) {
        if (!DBController.db) await this.openDB();

        const query = "SELECT * FROM MenuImage WHERE mid = ?;";
        try {
            const result = await DBController.db.getFirstAsync(query, mid);
            return result;
        } catch (error) {
            console.error("Errore recupero menu: ", error);
        }
    }

    //restituisce l'immagine (con la versione specificata) presente nel db, altrimenti return null -- TODO: DA ELIMINARE
    static async getImageMenu(mid, imageVersion) {
        if (!DBController.db) await this.openDB();

        const query = "SELECT image FROM MenuImage WHERE mid = ? AND imageVersion = ?;";
        try {
            const result = await DBController.db.getFirstAsync(query, mid, imageVersion);
            return result;
        } catch (error) {
            console.error("Errore recupero versione immagine: ", error);
        }
    }

    //aggiorno l'immagine del menu
    static async updateMenuImage(mid, newImageVersion, newimage) {
        if (!DBController.db) await this.openDB();

        const query = "UPDATE MenuImage SET image = ?, imageVersion = ? WHERE mid = ?;";
        try {
            const result = await DBController.db.runAsync(query, newimage, newImageVersion, mid);
            console.log(result.lastInsertRowId, result.changes);
        } catch (error) {
            console.error("Errore aggiornamento immagine: ", error);
        }
    }

    async getAllMenus() {
        const query = "SELECT * FROM MenuImage";
        const result = await DBController.db.getAllAsync(query); //getAllAsync usata per leggere dati
        return result; 
    }

    async getFirstMenu() {
        const query = "SELECT * FROM MenuImage";
        const result = await DBController.db.getFirstAsync(query);
        return result;
    }
}
