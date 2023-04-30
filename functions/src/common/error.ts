import {error} from "firebase-functions/logger";

enum ErrorCode {
    Unexpected = "Unexpected: %s",
}

class StError extends Error {
    httpCode: number;
    errorCode: ErrorCode;
    redirectToErrorPage: boolean;
    bookingId: string | undefined;

    constructor(
        message: string,
        httpCode: number,
        errorCode: ErrorCode,
        redirectToErrorPage: boolean,
        bookingId?: string
    ) {
        super(message);
        this.httpCode = httpCode;
        this.errorCode = errorCode;
        this.redirectToErrorPage = redirectToErrorPage;
        this.bookingId = bookingId;
    }
}

class StErrorBody {
    api: string;
    message: string;

    constructor(api: string, message: string) {
        this.api = api;
        this.message = message;
    }
}

export const throwJhError = (
    httpCode: number,
    errorCode: ErrorCode,
    redirectToErrorPage?: boolean,
    params?: any,
    bookingId?: string
) => {
    throw new StError(
        errorCode.replace("%s", params),
        httpCode,
        errorCode,
        redirectToErrorPage!,
        bookingId!
    );
};

const assertEqualWithWriteLog = async (
    expected: any,
    happened: any,
    writeLog: () => void,
    redirectToErrorPage: boolean,
    httpCode: number,
    errorCode: ErrorCode,
    params?: any,
    bookingId?: string
) => {
    if (expected != happened) {
        await writeLog();
        throwJhError(httpCode, errorCode, redirectToErrorPage, params, bookingId);
    }
};

const assertNotEqual = (
    expected: any,
    happened: any,
    redirectToErrorPage: boolean,
    httpCode: number,
    errorCode: ErrorCode,
    params?: any,
    bookingId?: string
): void => {
    if (expected === happened)
        throwJhError(httpCode, errorCode, redirectToErrorPage, params, bookingId);
};

const assertNotNull = (
    value: any,
    redirectToErrorPage: boolean,
    httpCode: number,
    errorCode: ErrorCode,
    params?: any,
    bookingId?: string
): void => {
    if (!value || value.toString().trim().isEmpty)
        throwJhError(httpCode, errorCode, redirectToErrorPage, params, bookingId);
};

const assertTypeIsString = (
    value: any,
    redirectToErrorPage: boolean,
    httpCode: number,
    errorCode: ErrorCode,
    params?: any,
    bookingId?: string
): void => {
    if (!(value && typeof value === "string" && value.toString().trim() !== ""))
        throwJhError(httpCode, errorCode, redirectToErrorPage, params, bookingId);
};

const assertTrue = (
    condition: boolean,
    redirectToErrorPage: boolean,
    httpCode: number,
    errorCode: ErrorCode,
    params?: any,
    bookingId?: string
): void => {
    if (!condition) throwJhError(httpCode, errorCode, redirectToErrorPage, params, bookingId);
};

const tryToDoWithRedirection = (
    callback: () => void,
    redirectToErrorPage: boolean,
    errorMessage: string,
    bookingId?: string
): any => {
    return tryToDo(
        callback,
        (e: any) => {
            throwJhError(
                500,
                ErrorCode.Unexpected,
                redirectToErrorPage,
                errorMessage + ": " + e,
                bookingId
            );
        },
        errorMessage,
        bookingId
    );
};

const tryToDo = (
    callback: () => void,
    errorCallback: (e: any) => void,
    errorMessage: string,
    bookingId?: string
) => {
    try {
        return callback();
    } catch (e: any) {
        error(errorMessage + ": " + e, bookingId);
        errorCallback(e);
    }
};

const tryToDoAsync = async (
    callback: () => void,
    errorCallback: (e: any) => void,
    errorMessage: string,
    bookingId?: string
) => {
    try {
        await callback();
    } catch (e: any) {
        error(errorMessage + ": " + e, bookingId);
        await errorCallback(e);
    }
};

export default StErrorBody;
export {
    tryToDoWithRedirection,
    tryToDo,
    tryToDoAsync,
    assertTrue,
    assertTypeIsString,
    assertNotNull,
    assertEqualWithWriteLog,
    assertNotEqual,
    StError,
    ErrorCode,
};
