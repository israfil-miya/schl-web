import { Body, Controller, Post, Req } from '@nestjs/common';
import { UserSession } from 'src/common/types/user-session.type';
import { NoticeService } from './notice.service';
import { CreateNoticeBodyDto } from './dto/create-notice.dto';

@Controller('notice')
export class NoticeController {
    constructor(private readonly noticeService: NoticeService) {}

    @Post('create-notice')
    createNotice(
        @Body() noticeData: CreateNoticeBodyDto,
        @Req() req: Request & { user: UserSession },
    ) {
        return this.noticeService.createNotice(noticeData, req.user);
    }
}
