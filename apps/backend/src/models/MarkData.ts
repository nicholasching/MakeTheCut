import {getModelForClass, modelOptions, prop} from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { _id: false }})
export class MarkSchema {
    @prop({
        required: true,
        uppercase: true,
        trim: true,
        // Follow course code format
        match: /^[A-Z]{2,4}\d{3}$/
    })
    public code!: string;

    @prop({ required: true, min: 1, max: 12 })
    public mark!: number;
}

export class MarkDataSchema {
    // This will be the person's generated uuidv4
    @prop({ required: true })
    public _id!: string;
    @prop()
    public entryYear?: number;
    @prop()
    public freeChoice?: boolean;
    @prop({ type: () => [MarkSchema], default: [] })
    public marks?: MarkSchema[];
}

export const MarkData = getModelForClass(MarkDataSchema, {
    options: {
        customName: "mark_data",
    }
});

