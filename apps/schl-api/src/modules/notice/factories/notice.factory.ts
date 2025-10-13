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

    static fromUpdateDto(body: Partial<CreateNoticeBodyDto>) {
        const patch: Record<string, unknown> = {};
        if (typeof body.channel === 'string') patch.channel = body.channel;
        if (typeof body.notice_no === 'string')
            patch.notice_no = body.notice_no.trim();
        if (typeof body.title === 'string') patch.title = body.title.trim();
        if (typeof body.description === 'string')
            patch.description = body.description.trim();
        if (body.file_name !== undefined)
            patch.file_name = body.file_name ?? null;
        return patch;
    }
}
