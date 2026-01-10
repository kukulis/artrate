import {Request, Response} from "express";
import {getLogger} from "../logging";
const logger = getLogger()

export class TestController {

    testLogError= async (_req: Request, res: Response): Promise<void> => {
        // const loggerType = typeof logger
        console.log('the logger is ', logger)
        logger.error('TestController.testLogerror: Testing error')

        res.json('error tested')
    }
}