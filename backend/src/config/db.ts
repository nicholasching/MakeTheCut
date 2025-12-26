import mongoose from "mongoose";

mongoose.connect(`mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@db:27017/`)