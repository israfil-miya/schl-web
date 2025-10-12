import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    Post,
    Query,
    Res,
    StreamableFile,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { Readable } from 'stream';
import { DeleteFileQueryDto } from './dto/delete-file.dto';
import { DownloadFileQueryDto } from './dto/download-file.dto';
import { UploadFileHeadersDto } from './dto/upload-file.dto';
import { FtpService } from './ftp.service';

@Controller('ftp')
export class FtpController {
    constructor(private readonly deleteFileService: FtpService) {}

    @Delete('delete')
    deleteFile(@Query() query: DeleteFileQueryDto) {
        const { fileName, folderName } = query;
        return this.deleteFileService.deleteFile(fileName, folderName);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async uploadFile(
        @UploadedFile()
        file: { buffer: Buffer | Uint8Array; originalname: string },
        @Query() query: UploadFileHeadersDto,
    ) {
        if (!file) throw new BadRequestException('file is required');
        const folderName = query?.folderName || '';
        const buffer = Buffer.from(file.buffer as Uint8Array);
        const fileName = String(file.originalname || '');
        return this.deleteFileService.uploadFile(buffer, fileName, folderName);
    }

    @Get('download')
    async downloadFile(
        @Query() query: DownloadFileQueryDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { fileName, folderName } = query;
        const stream = await this.deleteFileService.downloadFile(
            fileName,
            folderName,
        );
        // stream is a Node Readable stream
        const printableName = encodeURIComponent(fileName);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${printableName}"`,
        );
        return new StreamableFile(stream as unknown as Readable);
    }
}
