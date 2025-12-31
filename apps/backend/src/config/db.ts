import mongoose from "mongoose";
import logger from "./logger.js";

export default function awaitDb() {
    mongoose.connect(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@db:27017/${process.env.DB_NAME}?authSource=admin&retryWrites=true`).then(r => {
        logger.info(`Connected to MongoDB(${r.connection.name})`);
    }).catch(e => {
        logger.error(e);
    });
}