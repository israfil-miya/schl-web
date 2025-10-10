import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
} from '@nestjs/common';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { UserSession } from 'src/common/types/user-session.type';
import { ConvertToClientBodyDto } from './dto/convert-to-client.dto';
import { CreateReportBodyDto } from './dto/create-report.dto';
import {
    ReportStatusesByNameQueryDto,
    ReportStatusesQueryDto,
} from './dto/reports-status.dto';
import {
    SearchReportsBodyDto,
    SearchReportsQueryDto,
} from './dto/search-reports.dto';
import { ReportService } from './services/report/report.service';

@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @Get('call-reports-trend')
    callReportsTrend(@Req() req: Request & { user: UserSession }) {
        return this.reportService.callReportsTrend(req.user);
    }

    @Get('clients-onboard-trend')
    clientsOnboardTrend(@Req() req: Request & { user: UserSession }) {
        return this.reportService.clientsOnboardTrend(req.user);
    }

    @Get('test-orders-trend')
    testOrdersTrend(@Req() req: Request & { user: UserSession }) {
        return this.reportService.testOrdersTrend(req.user);
    }

    @Get('report-statuses')
    reportStatuses(
        @Req() req: Request & { user: UserSession },
        @Query() query: ReportStatusesQueryDto,
    ) {
        return this.reportService.reportStatuses(
            req.user,
            query.fromDate,
            query.toDate,
        );
    }

    @Get('report-statuses/:name')
    reportStatusesByName(
        @Req() req: Request & { user: UserSession },
        @Param('name') name: string,
        @Query() query: ReportStatusesByNameQueryDto,
    ) {
        return this.reportService.reportStatusesByName(
            req.user,
            name,
            query.fromDate,
            query.toDate,
        );
    }

    @Post('search-reports')
    searchReports(
        @Query() query: SearchReportsQueryDto,
        @Body() body: SearchReportsBodyDto,
        @Req() req: Request & { user: UserSession },
    ) {
        const pagination = {
            page: query.page,
            itemsPerPage: query.itemsPerPage,
            filtered: query.filtered,
            paginated: query.paginated,
        };

        return this.reportService.searchReports(body, pagination, req.user);
    }

    @Post('convert-to-client')
    convertToClient(
        @Req() req: Request & { user: UserSession },
        @Body() body: ConvertToClientBodyDto,
    ) {
        return this.reportService.convertToClient(req.user, body);
    }

    @Post('reject-client-request/:id')
    rejectClientRequest(
        @Req() req: Request & { user: UserSession },
        @Param() { id }: IdParamDto,
    ) {
        return this.reportService.rejectClientRequest(req.user, id);
    }

    @Post('mark-duplicate-client-request/:id')
    markDuplicateClientRequest(
        @Req() req: Request & { user: UserSession },
        @Param() { id }: IdParamDto,
    ) {
        return this.reportService.markDuplicateClientRequest(req.user, id);
    }

    @Get('followup-count-for-today/:name')
    followupCountForToday(
        @Req() req: Request & { user: UserSession },
        @Param('name') name: string,
    ) {
        return this.reportService.followupCountForToday(req.user, name);
    }

    @Post('create-report')
    createReport(
        @Req() req: Request & { user: UserSession },
        @Body() reportData: CreateReportBodyDto,
    ) {
        return this.reportService.createReport(req.user, reportData);
    }

    @Put('update-report/:id')
    updateReport(
        @Param() { id }: IdParamDto,
        @Body() reportData: Partial<CreateReportBodyDto>,
        @Req() req: Request & { user: UserSession },
    ) {
        return this.reportService.updateReport(id, reportData, req.user);
    }
}
