import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { ApiInfoResponse } from './types/app.types';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    async getInfo(): Promise<ApiInfoResponse> {
        return await this.appService.getApiInfo();
    }
}
