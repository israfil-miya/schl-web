import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    QnapSession,
    QnapSessionDocument,
} from '@repo/common/models/qnap-session.schema';
import { Model } from 'mongoose';
import { QnapSessionStore } from './session-store.interface';

@Injectable()
export class AtlasSessionStore implements QnapSessionStore {
    constructor(
        @InjectModel(QnapSession.name)
        private readonly model: Model<QnapSessionDocument>,
    ) {}

    async getSid(): Promise<string | null> {
        // Get the most recent session
        const newest = (await this.model
            .findOne()
            .sort({ createdAt: -1 })
            .lean()) as QnapSession | null;
        return newest?.sid ?? null;
    }

    async setSid(sid: string | null): Promise<void> {
        if (!sid) {
            // Clear session on logout
            await this.model.deleteMany({});
            return;
        }

        // Replace the single document with the new session
        // The empty filter {} ensures we match any existing doc
        // upsert: true creates it if it doesn't exist
        await this.model.replaceOne(
            {},
            { sid, createdAt: new Date() },
            { upsert: true },
        );
    }
}
