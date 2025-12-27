import {getModelForClass, prop} from "@typegoose/typegoose";


export class UserCollectionSchema {
    @prop({ required: true })
    public uuid!: string;
    @prop()
    public entryYear?: number;
    @prop()
    public freeChoice?: boolean;
    // TODO: add stream and mark data
}

export const UserCollection = getModelForClass(UserCollectionSchema, {
    options: {
        customName: 'users'
    }
});