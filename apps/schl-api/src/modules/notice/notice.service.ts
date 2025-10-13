import {
    ConflictException,
    ForbiddenException,
    HttpException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSession } from 'src/common/types/user-session.type';
import { createRegexQuery } from 'src/common/utils/filter-helpers';
import { hasPerm } from 'src/common/utils/permission-check';
import { Notice } from 'src/models/notice.schema';
import { CreateNoticeBodyDto } from './dto/create-notice.dto';
import { NoticeFactory } from './factories/notice.factory';

@Injectable()
export class NoticeService {
    constructor(
        @InjectModel(Notice.name)
        private readonly noticeModel: Model<Notice>,
    ) {}

    async createNotice(body: CreateNoticeBodyDto, user: UserSession) {
        // Permission checks per channel
        if (
            body.channel === 'production' &&
            !hasPerm('notice:send_notice_production', user.permissions)
        ) {
            throw new ForbiddenException(
                "You don't have permission to send notices to production channel",
            );
        }
        if (
            body.channel === 'marketers' &&
            !hasPerm('notice:send_notice_marketers', user.permissions)
        ) {
            throw new ForbiddenException(
                "You don't have permission to send notices to marketers channel",
            );
        }

        try {
            // prevent duplicate notice number
            const exists = await this.noticeModel.countDocuments({
                notice_no: createRegexQuery(body.notice_no, { exact: true }),
            });
            if (exists > 0) {
                throw new ConflictException(
                    'Notice with the same notice number already exists',
                );
            }

            const doc = NoticeFactory.fromCreateDto(body);
            const created = await this.noticeModel.create(doc);
            if (!created) {
                throw new InternalServerErrorException(
                    'Unable to create notice',
                );
            }
            return created;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('An error occurred');
        }
    }
}
