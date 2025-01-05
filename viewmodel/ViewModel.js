import StorageManager from "../model/StorageManager";
import DBController from "../model/DBController";
import CommunicationController from "../model/CommunicationController";

export class ViewModel {
    
    static sid = null;
    static uid = null;
    static firstRun = null;
    /*constructor() {
        this.db = new DBController();
        this.sid = null,
        this.uid = null,
        this.firstRun = null
    }*/

    async info() {
        console.log("\tuid:", this.uid);
        const alldbentry = await this.db.getAllMenus();
        console.log("Menus:", alldbentry.length);
    }

    static async initializeApp() {
        const result = await StorageManager.isFirstRun(); //forse meglio await
       
        if (result) { 
            console.log("primo avvio");
            //this.firstRun = true;
            await ViewModel.firstLaunch(); 
            
        } else {
            console.log("secondo avvio");
            //this.firstRun = false;
            await ViewModel.otherLaunch();
        }
   }

    static async firstLaunch() {
        console.log("Registrazione...");
        try {
            const sessionKeys = await CommunicationController.registerUser();
            await StorageManager.saveSessionKeysInLocalStorage(sessionKeys.sid, sessionKeys.uid);
            
            ViewModel.sid = sessionKeys.sid;
            ViewModel.uid = sessionKeys.uid;
            ViewModel.firstRun = true;
            console.log("\tRegistrato! sid:", ViewModel.sid, "\n\t\t\tuid:", ViewModel.uid, "\n\t\t\tfirstRun:", ViewModel.first);
        } catch (err) {
            console.log("Errore durante la registrazione!", err);
        }
    }

    static async otherLaunch() {
        console.log("Recupero dati utente dal DB...");

        ViewModel.sid =  await StorageManager.getSID();
        ViewModel.uid = await StorageManager.getUID();
        ViewModel.firstRun = false;
        console.log("\tLogin! sid:", ViewModel.sid, "\n\t\t\tuid:", ViewModel.uid, "\n\t\t\tfirstRun:", ViewModel.firstRun);
    }

    static async getUserSession() {
        if (!ViewModel.sid || !ViewModel.uid) {
            console.log("ViewModel.js - Sessione non inizializzata...");
            await ViewModel.initializeApp();
        }
        console.log("ViewModel.js - Sessione inizializzata return dati...");
        return {
            sid: ViewModel.sid,
            uid: ViewModel.uid,
            firstRun: ViewModel.firstRun,
        };
    }

    static async fetchMenuData(mid) { //49 
        console.log("Richiesta dati menu...", ViewModel.uid);
        try {
            //Richiesta di DETAILS di un menu: mid, name, price, location, imageVersion, shortDescription, deliveryTime, longDescription
            const menuFromServer = await CommunicationController.getMenuDetails(mid, ViewModel.sid);
            const menuFromDB = await DBController.getMenuByMid(menuFromServer.mid); 
            // se non esite nel db -> return null, altrimenti menuFromDB = { mid, imageVersion e image }

            if (menuFromDB) {  
                //se esiste il menu nel db
                console.log("Menu esiste nel db...");//, menuFromDB);

                if (menuFromDB.imageVersion === menuFromServer.imageVersion) {
                    //se le versioni sono uguali, restituisco il menu dal db
                    console.log("\t...Versioni immagini uguali")
                    return {
                        ...menuFromServer,
                        image: menuFromDB.image,
                    }
                } else {
                    //se le versioni sono diverse, aggiorno l'immagine nel db
                    console.log("\t...Versioni immagini diverse")
                    //scarico dal server l'immagine aggiornata
                    const imageFromServer = await CommunicationController.getMenuImage(menuFromServer.mid, ViewModel.sid); 
                    //aggiorno l'immagine e la versione nel db
                    const imageWithPrefix = "data:image/png;base64," + imageFromServer.base64;
                    await DBController.updateMenuImage(mid, menuFromServer.imageVersion, imageWithPrefix);

                    return {
                        ...menuFromServer,
                        image: imageWithPrefix,
                    }
                } 
            } else {
                //se il menu non è presente nel db, lo aggiungo
                console.log("Inserimento menu nel db...")
                const imageFromServer = await CommunicationController.getMenuImage(menuFromServer.mid, ViewModel.sid); //ottengo l'immagine del menu
                //console.log("ImmagineFromServer", imageFromServer);
                const imageWithPrefix = "data:image/png;base64," + imageFromServer.base64;

                await DBController.insertMenuImage(menuFromServer.mid, menuFromServer.imageVersion, imageWithPrefix); //salvo nel db

                return {
                    ...menuFromServer,
                    image: imageWithPrefix,
                }
            }

        } catch (err) {
            console.error("Errore nel recupero dei dati del menu", err);
        }
    }
      
}