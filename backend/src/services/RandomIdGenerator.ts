import {IdGenerator} from "./IdGenerator";
import {randomBytes} from "crypto";

export class RandomIdGenerator implements IdGenerator {
    nextId(): string {
        return randomBytes(16).toString('hex');
    }
}