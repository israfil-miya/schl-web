import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/auth/public.decorator';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Public()
    @Get('/ping')
    getPing() {
        return 'pong';
    }

    @Get('/healthz')
    getHealthz() {
        return this.appService.getHealthz();
    }
}
