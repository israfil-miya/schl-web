import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { ApiInfoResponse } from './app.types';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    async getApiInfo(): Promise<ApiInfoResponse> {
        return await this.appService.getApiInfo();
    }
}
