import * as SQLite from 'expo-sqlite';

// Classe con metodi dinamici per la gestione del DB
export default class DBController {

    constructor() {
        this.db = null;
        this.openDB();
    }

    async openDB() {
        //inizializzo e apro il DB
        this.db = await SQLite.openDatabaseAsync('Progetto');
        const query = "CREATE TABLE IF NOT EXISTS MenuImage(mid INTEGER PRIMARY KEY, imageVersion INTEGER, image TEXT);"; //, lat REAL, lng REAL);"; 
        try {
            await this.db.execAsync(query); //execAsync usata per creare tabelle
        } catch (error) {
            console.error("Errore creazione tabella: ", error);
        }
    }

    //inserisco un nuovo menu nel DB
    async insertMenuImage(mid, imageVersion, image) {
        const query = "INSERT INTO MenuImage(mid, imageVersion, image) VALUES (?, ?, ?);";
        try {
            const res = await this.db.runAsync(query, mid, imageVersion, image); //runAsync usata per inserire dati
            console.log(res.lastInsertRowId, res.changes);
        } catch (error) {
            console.error("Errore inserimento menu: ", error);
        }
    }

    //controlla se il menu (mid) è già presente nel DB, altrimenti return null
    async getMenuByMid(mid) {
        const query = "SELECT * FROM MenuImage WHERE mid = ?;";
        try {
            const result = await this.db.getFirstAsync(query, mid);
            return result;
        } catch (error) {
            console.error("Errore recupero menu: ", error);
        }
    }

    //restituisce l'immagine (con la versione specificata) presente nel db, altrimenti return null -- TODO: DA ELIMINARE
    async getImageMenu(mid, imageVersion) {
        const query = "SELECT image FROM MenuImage WHERE mid = ? AND imageVersion = ?;";
        try {
            const result = await this.db.getFirstAsync(query, mid, imageVersion);
            return result;
        } catch (error) {
            console.error("Errore recupero versione immagine: ", error);
        }
    }

    //aggiorno l'immagine del menu
    async updateMenuImage(mid, newImageVersion, newimage) {
        const query = "UPDATE MenuImage SET image = ?, imageVersion = ? WHERE mid = ?;";
        try {
            const result = await this.db.runAsync(query, newimage, newImageVersion, mid);
            console.log(result.lastInsertRowId, result.changes);
        } catch (error) {
            console.error("Errore aggiornamento immagine: ", error);
        }
    }

    async getAllMenus() {
        const query = "SELECT * FROM MenuImage";
        const result = await this.db.getAllAsync(query); //getAllAsync usata per leggere dati
        return result; 
    }

    async getFirstMenu() {
        const query = "SELECT * FROM MenuImage";
        const result = await this.db.getFirstAsync(query);
        return result;
    }
}
