import { Module } from '@nestjs/common';
import { FtpController } from './ftp.controller';
import { FtpService } from './ftp.service';

@Module({
    controllers: [FtpController],
    providers: [FtpService],
})
export class FtpModule {}
