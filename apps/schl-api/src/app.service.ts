import {
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService implements OnModuleInit {
    private readonly logger = new Logger(AppService.name);

    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly config: ConfigService,
    ) {}

    onModuleInit() {
        this.connection.once('open', () => {
            this.logger.log('Connected to MongoDB!');
        });

        this.connection.on('error', err => {
            this.logger.error('MongoDB connection error:', err);
        });
    }

    async getHealthz() {
        const start = Date.now();

        let db_status = 'disconnected';
        try {
            // A small query to check DB responsiveness
            const db = this.connection.db;
            if (!db) {
                throw new InternalServerErrorException(
                    'MongoDB connection is not initialized',
                );
            }
            await db.admin().ping();
            db_status = 'connected';
        } catch (e) {
            db_status = 'error';
            this.logger.error('Error pinging MongoDB:', e);
        }

        const ping_ms = Date.now() - start;

        return {
            ok: db_status === 'connected',
            name: 'SCHL API',
            version: 'v1',
            docs: this.config.get<string>('BASE_URL') + '/docs',
            dbStatus: db_status,
            pingMs: ping_ms,
        };
    }
}
