import {Response} from "express";
import {z} from "zod";

export class ControllerHelper {
    public static handleZodError(error: any, res: Response): boolean {
        if (error instanceof z.ZodError) {
            // If there's only one error (like from .refine()), use it as the main error
            const errorMessage = error.issues.length === 1 && error.issues[0].path.length === 0
                ? error.issues[0].message
                : 'Validation failed';

            res.status(400).json({
                error: errorMessage,
                details: error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
            return true;
        }

        return false;
    }
}