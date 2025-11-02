import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
    timestamps: true,
})
export class User {
    @Prop({
        required: [true, 'Username is required'],
        unique: true,
    })
    username: string;

    @Prop({ required: [true, 'Password is required'] })
    password: string;

    @Prop({
        required: [true, 'Role has not been assigned'],
        ref: 'Role',
        type: mongoose.Schema.Types.ObjectId,
    })
    role: mongoose.Types.ObjectId;

    @Prop({
        required: [true, 'Employee has not been assigned'],
        ref: 'Employee',
        type: mongoose.Schema.Types.ObjectId,
    })
    employee: mongoose.Types.ObjectId;

    @Prop({ default: '' })
    comment: string;

    @Prop({ type: Date })
    readonly createdAt: Date;

    @Prop({ type: Date })
    readonly updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
