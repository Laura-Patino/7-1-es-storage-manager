export default class CommunicationController {
    static BASE_URL = "https://develop.ewlab.di.unimi.it/mc/2425";

    static async genericRequest(endpoint, verb, queryParams, bodyParams) {
        console.log("(1)genetic Request called");
        const queryParamsFormatted = new URLSearchParams(queryParams).toString();
        const url = this.BASE_URL + endpoint + "?" + queryParamsFormatted;
        console.log("\tsending " + verb + "request to " + url);

        let fetchData = {
            method: verb,
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json'
            }
        };
        if (verb != "GET") 
            fetchData.body = JSON.stringify(bodyParams);

        let httpResponse; 
        try {
            httpResponse = await fetch(url, fetchData);
        } catch (error) {
            console.log("(1)Error during fetch request: ", error);
            throw error;
        }

        const status = httpResponse.status;
        console.log("\tStatus: ", status);
        if (status === 204) {
            console.log("(0) OK, no content to return");
            return;
        } else if (status >= 200 && status < 300) {
            let deserializedObj = await httpResponse.json();
            return deserializedObj; //return una Promise
        } else {
            const errorObj = await httpResponse.json();
            console.log("(0) Errore dal server:", errorObj);
            throw errorObj;
        }
    }

    static async registerUser() {
        let endpoint = "/user";
        return await this.genericRequest(endpoint, 'POST', {}, {});
    }

    static async getMenuDetails(mid, sid, latitude=45.4642, longitude=9.19) {
        // TODO: lat e lng riguardano la posizione dell'utente (per ora generici lat=45.4642, lng=9.19)
        let endpoint = "/menu/" + mid; //es. mid = 49
        let queryParams = {
            lat: latitude, 
            lng: longitude,
            sid: sid
        };
        return await this.genericRequest(endpoint, 'GET', queryParams, {});
    }

    static async getMenuImage(mid, sid) {
        let endpoint = "/menu/" + mid + "/image";
        let queryParams = {
            sid: sid
        };
        return await this.genericRequest(endpoint, 'GET', queryParams, {});
    }
}