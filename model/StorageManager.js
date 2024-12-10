import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
    FIRSTRUN: 'firstRun',
    SID: 'sid',
    UID: 'uid',
    //lastscreen: 'home'
}

export default class StorageManager {

    static async isFirstRun() {
        try {
            const firstRun = await AsyncStorage.getItem(KEYS.FIRSTRUN);
            if (firstRun == null) {
                await AsyncStorage.setItem(KEYS.FIRSTRUN, JSON.stringify(false));
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log("Errore primo avvio: ", error);
        }
    
    }
    static async setItemByKey(key, value) {
        try {
            console.log("Salvataggio: ", key, "->", value);
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Errore nel salvataggio dell'item: ", error);
            throw error;
        }
    }  
    
    static async getItemByKey(key) {
        try {
            //console.log("Recupero di:", key);
            const value = await AsyncStorage.getItem(key);
            return JSON.parse(value);
        } catch (error) {
            console.error("Errore nel recupero dell'item: ", error);
            throw error;
        }
    }

    static async getSID() {
        return await this.getItemByKey(KEYS.SID);
    }

    static async getUID() {
        return await this.getItemByKey(KEYS.UID);
    }

    static async saveSessionKeysInLocalStorage(sid, uid) {
        await this.setItemByKey(KEYS.SID, sid);
        await this.setItemByKey(KEYS.UID, JSON.stringify(uid)); //salvare come string
    }
}