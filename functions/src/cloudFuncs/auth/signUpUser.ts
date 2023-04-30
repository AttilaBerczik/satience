import {https, Request, Response} from "firebase-functions";
import {debug} from "firebase-functions/logger";
import {handleRequest} from "../../common/util";

const signUpUser = https.onRequest((request, response) => {
    handleRequest(
        "signUpUser",
        true,
        request,
        response,
        async () => await signUpUserImpl(request, response)
    );
});

const signUpUserImpl = async (request: Request, response: Response) => {
    debug("started sign up user cloud function", {request, response});
};

export {signUpUser};
