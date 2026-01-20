declare module 'paysera-nodejs' {
    interface PayseraConfig {
        projectid: string;
        sign_password: string;
        accepturl: string;
        cancelurl: string;
        callbackurl: string;
        test?: number;
    }

    interface PayseraRequestParams {
        orderid: string;
        p_email: string;
        amount: number;
        currency: string;
        [key: string]: any;
    }

    interface PayseraCallbackRequest {
        data: string;
        ss1: string;
        ss2: string;
    }

    interface PayseraDecodedData {
        orderid: string;
        status: string;
        requestid?: string;
        [key: string]: any;
    }

    class Paysera {
        constructor(config: PayseraConfig);
        buildRequestUrl(params: PayseraRequestParams): string;
        checkCallback(request: PayseraCallbackRequest): boolean;
        decode(data: string): PayseraDecodedData;
    }

    export = Paysera;
}
