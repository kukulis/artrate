import {Router} from "express";
import {TestController} from "../controllers/TestController";

export  function createTestRoutes() : Router {
    const router = Router()

    const testController = new TestController()

    router.get('/test-log', testController.testLogError)

    return router;
}