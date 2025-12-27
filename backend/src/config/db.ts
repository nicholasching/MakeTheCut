import mongoose from "mongoose";
import logger from "./logger.js";

export default function awaitDb() {
    mongoose.connect(process.env.ME_CONFIG_MONGODB_URL as string).then(r => {
        logger.info(`Connected to MongoDB(${r.connection.host})`);
    }).catch(e => {
        logger.error(e);
    });
}