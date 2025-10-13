import { CreateNoticeBodyDto } from '../dto/create-notice.dto';

export class NoticeFactory {
    static fromCreateDto(body: CreateNoticeBodyDto) {
        return {
            channel: body.channel,
            notice_no: body.notice_no.trim(),
            title: body.title.trim(),
            description: body.description.trim(),
            file_name: body.file_name ?? null,
        };
    }
}
