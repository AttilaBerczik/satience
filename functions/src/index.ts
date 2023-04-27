import * as functions from "firebase-functions";
import {debug} from "firebase-functions/logger";

const helloWorld = functions.https.onRequest((request, response) => {
    debug("Hello logs!");
    response.send("Hello from Firebase!");
});

export {helloWorld};
