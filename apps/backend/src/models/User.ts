import {getModelForClass, prop} from "@typegoose/typegoose";


export class UserCollectionSchema {
    @prop({ required: true })
    public _id!: string;
    @prop({ required: true })
    public email!: string;
    @prop({ required: true })
    public name!: string;
    @prop({ required: true })
    public image!: string;
    @prop()
    public schoolEmail?: string;
    @prop()
    public verifiedEmail?: boolean;
    @prop()
    public authOTP?: number;
    @prop()
    public authOTPExpiresAt?: Date;
    @prop({ required: true })
    public createdAt!: Date;
    @prop({ required: true })
    public updatedAt!: Date;
}

export const User = getModelForClass(UserCollectionSchema, {
    options: {
        customName: 'users'
    }
});