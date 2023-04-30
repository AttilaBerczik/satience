import StErrorBody, {ErrorCode, StError} from "./error";
import {Response, Request} from "firebase-functions";
import {error} from "firebase-functions/logger";
const cors = require("cors")({origin: true});

const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;

const isUrl = (value: any) => {
    if (!value) return false;
    if (typeof value != "string") return false;
    const url: string = value.toString();
    return url.startsWith("http://") || url.startsWith("https://");
};

const redirectTo = (res: Response, url: string, api: string) => {
    res.append("hello", "world");
    if (api === "redirectToRegistration" || api === "guestPortal") res.redirect(url);
    else res.status(300).send(url);
};

const handleRequest = (
    api: string,
    redirectAsDefault: boolean,
    req: Request,
    res: Response,
    callback: (req: Request, res: Response) => any
): void => {
    cors(req, res, async (req1: Request, res1: Response) => {
        try {
            const result = await callback(req, res);
            if (isUrl(result)) redirectTo(res, result, api);
            else res.status(200).send(result ? result : "Successful request");
        } catch (e) {
            if (e instanceof StError) {
                if (e.redirectToErrorPage) await redirectToErrorPage(api, res, e);
                else sendErrorCode(api, res, e);
            } else if (e instanceof Error) {
                if (redirectAsDefault) await redirectToErrorPage(api, res, e);
                else sendErrorCode(api, res, e);
            } else {
                error("Unexpected error type: %s", e);
                const stError = new StError(
                    "Unexpected fatal error of unknown type:" + e,
                    500,
                    ErrorCode.Unexpected,
                    redirectAsDefault
                );
                sendErrorCode(api, res, stError);
                e = stError;
            }
            error(e);
        }
    });
};

const calculateBaseFrontendUrl = async () => {
    // TODO return frontend url dynamically
    return "http://localhost:3000/";
};

const redirectToErrorPage = async (api: string, res: Response, error: StError | any) => {
    let url: string =
        (await calculateBaseFrontendUrl()) +
        "error?ref=" +
        encodeURIComponent(api) +
        "&text=" +
        encodeURIComponent(error.message);
    if (error.bookingId) url += "&bookingId=" + error.bookingId;
    redirectTo(res, url, api);
};

const sendErrorCode = (api: string, res: Response, error: Error) => {
    const httpCode = error instanceof StError ? error.httpCode : 500;
    const errorMessage =
        error instanceof StError ? error.message : "Unexpected error occurred: " + error;
    res.status(httpCode).send(new StErrorBody(api, errorMessage));
};

const isForwardingEmail = (email: string): boolean => {
    if (!email.includes("airbnb") && !email.includes("booking")) return true;
    else return false;
};

export {handleRequest, calculateBaseFrontendUrl, isForwardingEmail, projectId};
