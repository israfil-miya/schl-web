import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import moment from 'moment-timezone';
import { Model } from 'mongoose';
import { UserSession } from 'src/common/types/user-session.type';
import { getTodayDate } from 'src/common/utils/date-helpers';
import {
    addBooleanField,
    addIfDefined,
    buildOrRegex,
    createRegexQuery,
} from 'src/common/utils/filter-helpers';
import { hasPerm } from 'src/common/utils/permission-check';
import { Client } from 'src/models/client.schema';
import { Report } from 'src/models/report.schema';
import { User } from 'src/models/user.schema';
import { ConvertToClientBodyDto } from '../../dto/convert-to-client.dto';
import { CreateReportBodyDto } from '../../dto/create-report.dto';
import {
    SearchReportsBodyDto,
    SearchReportsQueryDto,
} from '../../dto/search-reports.dto';
import { ReportFactory } from '../../factories/report.factory';

@Injectable()
export class ReportService {
    constructor(
        @InjectModel(Report.name) private readonly reportModel: Model<Report>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Client.name)
        private readonly clientModel: Model<Client>,
    ) {}

    async callReportsTrend(userSession: UserSession) {
        try {
            if (!hasPerm('crm:view_crm_stats', userSession.permissions)) {
                throw new ForbiddenException(
                    'You do not have permission to view CRM stats',
                );
            }

            const now = moment().tz('Asia/Dhaka');
            const startDate = now
                .clone()
                .subtract(12, 'months')
                .startOf('month')
                .toDate();
            const endDate = now.clone().endOf('month').toDate();

            // Aggregate counts per month for last 12 months (including current)
            interface AggRow {
                _id: { month: number; year: number };
                count: number;
            }

            const reports = (await this.reportModel
                .aggregate([
                    {
                        $match: {
                            is_lead: false,
                            createdAt: { $gte: startDate, $lte: endDate },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                month: { $month: '$createdAt' },
                                year: { $year: '$createdAt' },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } },
                ])
                .exec()) as AggRow[];

            const result: Record<string, number> = {};
            for (let i = 0; i <= 12; i++) {
                const key = now
                    .clone()
                    .subtract(i, 'months')
                    .format('MMMM_YYYY')
                    .toLowerCase();
                result[key] = 0;
            }

            for (const r of reports) {
                const key = moment()
                    .month(Number(r._id.month) - 1)
                    .year(Number(r._id.year))
                    .format('MMMM_YYYY')
                    .toLowerCase();
                result[key] = r.count;
            }

            const sorted: Record<string, number> = {};
            const keys = Object.keys(result).sort((a, b) =>
                moment(a, 'MMMM_YYYY').diff(moment(b, 'MMMM_YYYY')),
            );
            for (const k of keys) {
                sorted[k] = result[k];
            }

            return sorted;
        } catch {
            throw new InternalServerErrorException(
                'Unable to retrieve reports count',
            );
        }
    }

    async clientsOnboardTrend(userSession: UserSession) {
        try {
            if (!hasPerm('crm:view_crm_stats', userSession.permissions)) {
                throw new ForbiddenException(
                    'You do not have permission to view CRM stats',
                );
            }

            const now = moment().tz('Asia/Dhaka');
            const startWindow = now
                .clone()
                .subtract(12, 'months')
                .startOf('month')
                .format('YYYY-MM-DD');
            const endWindow = now.clone().endOf('month').format('YYYY-MM-DD');

            const buckets: Record<string, number> = {};
            for (let i = 0; i <= 12; i++) {
                const key = now
                    .clone()
                    .subtract(i, 'months')
                    .format('MMMM_YYYY')
                    .toLowerCase();
                buckets[key] = 0;
            }

            const rows = await this.reportModel
                .aggregate([
                    {
                        $match: {
                            is_lead: false,
                            client_status: 'approved',
                            onboard_date: {
                                $gte: startWindow,
                                $lte: endWindow,
                            },
                        },
                    },
                    // onboard_date is a string; convert to Date for month/year grouping
                    {
                        $addFields: {
                            onboardDate: {
                                $dateFromString: {
                                    dateString: '$onboard_date',
                                    format: '%Y-%m-%d',
                                },
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                month: { $month: '$onboardDate' },
                                year: { $year: '$onboardDate' },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } },
                ])
                .allowDiskUse(true)
                .exec();

            for (const r of rows as Array<{
                _id: { month: number; year: number };
                count: number;
            }>) {
                const key = moment()
                    .month(Number(r._id.month) - 1)
                    .year(Number(r._id.year))
                    .format('MMMM_YYYY')
                    .toLowerCase();
                buckets[key] = r.count;
            }

            const out: Record<string, number> = {};
            const keys = Object.keys(buckets).sort((a, b) =>
                moment(a, 'MMMM_YYYY').diff(moment(b, 'MMMM_YYYY')),
            );
            for (const k of keys) out[k] = buckets[k];
            return out;
        } catch {
            throw new InternalServerErrorException(
                'Unable to retrieve clients onboard count',
            );
        }
    }

    async testOrdersTrend(userSession: UserSession) {
        try {
            if (!hasPerm('crm:view_crm_stats', userSession.permissions)) {
                throw new ForbiddenException(
                    'You do not have permission to view CRM stats',
                );
            }

            const now = moment().tz('Asia/Dhaka');
            const startDate = now
                .clone()
                .subtract(12, 'months')
                .startOf('month');
            const endDate = now.clone().endOf('month');

            const result: Record<string, number> = {};
            for (let i = 0; i <= 12; i++) {
                const key = now
                    .clone()
                    .subtract(i, 'months')
                    .format('MMMM_YYYY')
                    .toLowerCase();
                result[key] = 0;
            }

            const rows = await this.reportModel
                .aggregate([
                    { $match: { is_lead: false } },
                    { $unwind: '$test_given_date_history' },
                    // Convert string to Date then match by window
                    {
                        $addFields: {
                            testDate: {
                                $dateFromString: {
                                    dateString: '$test_given_date_history',
                                    format: '%Y-%m-%d',
                                },
                            },
                        },
                    },
                    {
                        $match: {
                            testDate: {
                                $gte: startDate.toDate(),
                                $lte: endDate.toDate(),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                month: { $month: '$testDate' },
                                year: { $year: '$testDate' },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } },
                ])
                .allowDiskUse(true)
                .exec();

            for (const r of rows as Array<{
                _id: { month: number; year: number };
                count: number;
            }>) {
                const key = moment()
                    .month(Number(r._id.month) - 1)
                    .year(Number(r._id.year))
                    .format('MMMM_YYYY')
                    .toLowerCase();
                result[key] = r.count;
            }

            const sorted: Record<string, number> = {};
            const keys = Object.keys(result).sort((a, b) =>
                moment(a, 'MMMM_YYYY').diff(moment(b, 'MMMM_YYYY')),
            );
            for (const k of keys) sorted[k] = result[k];
            return sorted;
        } catch {
            throw new InternalServerErrorException(
                'Unable to retrieve test orders trend',
            );
        }
    }

    async reportStatuses(
        userSession: UserSession,
        fromDate: string,
        toDate: string,
    ) {
        try {
            if (!hasPerm('crm:view_crm_stats', userSession.permissions)) {
                throw new ForbiddenException(
                    'You do not have permission to view CRM stats',
                );
            }

            // Normalize date bounds
            const hasFrom = !!fromDate;
            const hasTo = !!toDate;
            const mFrom = hasFrom
                ? moment(fromDate, 'YYYY-MM-DD', true)
                : moment('0000-01-01', 'YYYY-MM-DD', true);
            const mTo = hasTo
                ? moment(toDate, 'YYYY-MM-DD', true)
                : moment('9999-12-31', 'YYYY-MM-DD', true);

            if (!mFrom.isValid() || !mTo.isValid()) {
                throw new BadRequestException('Invalid date input');
            }

            // Build range for $elemMatch and string-date fields
            const callingRange: { $gte?: string; $lte?: string } = {};
            const onboardRange: { $gte?: string; $lte?: string } = {};
            if (hasFrom) {
                callingRange.$gte = fromDate;
                onboardRange.$gte = fromDate;
            }
            if (hasTo) {
                callingRange.$lte = toDate;
                onboardRange.$lte = toDate;
            }

            // Get marketer names from users (provided_name not null)
            const marketerNamesRaw = (await this.userModel
                .distinct('provided_name', { provided_name: { $ne: null } })
                .exec()) as (string | null | undefined)[];
            const marketerNames = marketerNamesRaw
                .filter((n): n is string => typeof n === 'string')
                .map(n => n.trim())
                .filter(n => n.length > 0);
            // Build aggregation pipelines for each metric and run in a single aggregate via $facet
            const callsPipeline: any[] = [
                { $match: { is_lead: false } },
                { $unwind: '$calling_date_history' },
            ];
            if (hasFrom || hasTo) {
                callsPipeline.push({
                    $match: { calling_date_history: callingRange },
                });
            }
            callsPipeline.push({
                $group: { _id: '$marketer_name', count: { $sum: 1 } },
            });

            const testsPipeline: any[] = [
                { $match: { is_lead: false } },
                { $unwind: '$test_given_date_history' },
            ];
            if (hasFrom || hasTo) {
                testsPipeline.push({
                    $match: { test_given_date_history: callingRange },
                });
            }
            testsPipeline.push({
                $group: { _id: '$marketer_name', count: { $sum: 1 } },
            });

            const leadsPipeline: any[] = [{ $match: { is_lead: true } }];
            if (hasFrom || hasTo) {
                leadsPipeline.push({
                    $match: {
                        calling_date_history: { $elemMatch: callingRange },
                    },
                });
            }
            leadsPipeline.push({
                $group: { _id: '$marketer_name', count: { $sum: 1 } },
            });

            const prospectsPipeline: any[] = [
                { $match: { is_lead: false, is_prospected: true } },
            ];
            if (hasFrom || hasTo) {
                prospectsPipeline.push({
                    $match: {
                        calling_date_history: { $elemMatch: callingRange },
                    },
                });
            }
            prospectsPipeline.push({
                $group: { _id: '$marketer_name', count: { $sum: 1 } },
            });

            const clientsPipeline: any[] = [
                { $match: { is_lead: false, client_status: 'approved' } },
            ];
            if (hasFrom || hasTo) {
                clientsPipeline.push({
                    $match: { onboard_date: onboardRange },
                });
            }
            clientsPipeline.push({
                $group: { _id: '$marketer_name', count: { $sum: 1 } },
            });

            const facetResult = (await this.reportModel
                .aggregate([
                    {
                        $facet: {
                            calls: callsPipeline,
                            tests: testsPipeline,
                            leads: leadsPipeline,
                            prospects: prospectsPipeline,
                            clients: clientsPipeline,
                        },
                    },
                ])
                .exec()) as Array<{
                calls: Array<{ _id: string; count: number }>;
                tests: Array<{ _id: string; count: number }>;
                leads: Array<{ _id: string; count: number }>;
                prospects: Array<{ _id: string; count: number }>;
                clients: Array<{ _id: string; count: number }>;
            }>;

            const [stats] = facetResult;
            const toMap = (arr: Array<{ _id: string; count: number }>) => {
                const m = new Map<string, number>();
                for (const it of arr) m.set((it._id || '').trim(), it.count);
                return m;
            };
            const callsMap = toMap(stats.calls || []);
            const testsMap = toMap(stats.tests || []);
            const leadsMap = toMap(stats.leads || []);
            const prospectsMap = toMap(stats.prospects || []);
            const clientsMap = toMap(stats.clients || []);

            const data: Record<
                string,
                {
                    totalCalls: number;
                    totalLeads: number;
                    totalClients: number;
                    totalTests: number;
                    totalProspects: number;
                }
            > = {};
            for (const name of marketerNames) {
                data[name] = {
                    totalCalls: callsMap.get(name) || 0,
                    totalLeads: leadsMap.get(name) || 0,
                    totalClients: clientsMap.get(name) || 0,
                    totalTests: testsMap.get(name) || 0,
                    totalProspects: prospectsMap.get(name) || 0,
                };
            }

            return data;
        } catch {
            throw new InternalServerErrorException(
                'Unable to retrieve report statuses',
            );
        }
    }

    async reportStatusesByName(
        userSession: UserSession,
        marketerName: string,
        fromDate?: string,
        toDate?: string,
    ) {
        try {
            if (!hasPerm('crm:view_crm_stats', userSession.permissions)) {
                throw new ForbiddenException(
                    'You do not have permission to view CRM stats',
                );
            }

            const hasFrom = !!fromDate;
            const hasTo = !!toDate;
            const mFrom = hasFrom
                ? moment(fromDate, 'YYYY-MM-DD', true)
                : moment('0000-01-01', 'YYYY-MM-DD', true);
            const mTo = hasTo
                ? moment(toDate, 'YYYY-MM-DD', true)
                : moment('9999-12-31', 'YYYY-MM-DD', true);

            if (!mFrom.isValid() || !mTo.isValid()) {
                throw new BadRequestException('Invalid date input');
            }

            const callingRange: { $gte?: string; $lte?: string } = {};
            const onboardRange: { $gte?: string; $lte?: string } = {};
            if (hasFrom) {
                callingRange.$gte = fromDate!;
                onboardRange.$gte = fromDate!;
            }
            if (hasTo) {
                callingRange.$lte = toDate!;
                onboardRange.$lte = toDate!;
            }

            // Total calls: unwind calling_date_history and count in range
            const callsPipeline: any[] = [
                { $match: { is_lead: false, marketer_name: marketerName } },
                { $unwind: '$calling_date_history' },
            ];
            if (hasFrom || hasTo) {
                callsPipeline.push({
                    $match: { calling_date_history: callingRange },
                });
            }
            callsPipeline.push({ $count: 'count' });

            // Total tests: unwind test_given_date_history
            const testsPipeline: any[] = [
                { $match: { is_lead: false, marketer_name: marketerName } },
                { $unwind: '$test_given_date_history' },
            ];
            if (hasFrom || hasTo) {
                testsPipeline.push({
                    $match: { test_given_date_history: callingRange },
                });
            }
            testsPipeline.push({ $count: 'count' });

            // Leads
            const leadsPipeline: any[] = [
                { $match: { is_lead: true, marketer_name: marketerName } },
            ];
            if (hasFrom || hasTo) {
                leadsPipeline.push({
                    $match: {
                        calling_date_history: { $elemMatch: callingRange },
                    },
                });
            }
            leadsPipeline.push({ $count: 'count' });

            // Prospects
            const prospectsPipeline: any[] = [
                {
                    $match: {
                        is_lead: false,
                        is_prospected: true,
                        marketer_name: marketerName,
                    },
                },
            ];
            if (hasFrom || hasTo) {
                prospectsPipeline.push({
                    $match: {
                        calling_date_history: { $elemMatch: callingRange },
                    },
                });
            }
            prospectsPipeline.push({ $count: 'count' });

            // Clients
            const clientsPipeline: any[] = [
                {
                    $match: {
                        is_lead: false,
                        client_status: 'approved',
                        marketer_name: marketerName,
                    },
                },
            ];
            if (hasFrom || hasTo) {
                clientsPipeline.push({
                    $match: { onboard_date: onboardRange },
                });
            }
            clientsPipeline.push({ $count: 'count' });

            const [facet] = (await this.reportModel
                .aggregate([
                    {
                        $facet: {
                            calls: callsPipeline,
                            tests: testsPipeline,
                            leads: leadsPipeline,
                            prospects: prospectsPipeline,
                            clients: clientsPipeline,
                        },
                    },
                    {
                        $project: {
                            totalCalls: {
                                $ifNull: [
                                    { $arrayElemAt: ['$calls.count', 0] },
                                    0,
                                ],
                            },
                            totalTests: {
                                $ifNull: [
                                    { $arrayElemAt: ['$tests.count', 0] },
                                    0,
                                ],
                            },
                            totalLeads: {
                                $ifNull: [
                                    { $arrayElemAt: ['$leads.count', 0] },
                                    0,
                                ],
                            },
                            totalProspects: {
                                $ifNull: [
                                    { $arrayElemAt: ['$prospects.count', 0] },
                                    0,
                                ],
                            },
                            totalClients: {
                                $ifNull: [
                                    { $arrayElemAt: ['$clients.count', 0] },
                                    0,
                                ],
                            },
                        },
                    },
                ])
                .exec()) as Array<{
                totalCalls: number;
                totalTests: number;
                totalLeads: number;
                totalProspects: number;
                totalClients: number;
            }>;

            return (
                facet || {
                    totalCalls: 0,
                    totalTests: 0,
                    totalLeads: 0,
                    totalProspects: 0,
                    totalClients: 0,
                }
            );
        } catch {
            throw new InternalServerErrorException(
                'Unable to retrieve report statuses by name',
            );
        }
    }

    async searchReports(
        filters: SearchReportsBodyDto,
        pagination: SearchReportsQueryDto,
        userSession: UserSession,
    ) {
        // Basic permission: viewing reports stats also gates report list search
        if (!hasPerm('crm:view_reports', userSession.permissions)) {
            throw new ForbiddenException(
                'You do not have permission to view reports',
            );
        }

        const { page, itemsPerPage, filtered, paginated } = pagination;
        const {
            country,
            companyName,
            category,
            marketerName,
            fromDate,
            toDate,
            test,
            prospect,
            onlyLead,
            followupDone,
            regularClient,
            staleClient,
            prospectStatus,
            generalSearchString,
        } = filters;

        interface QueryShape {
            country?: ReturnType<typeof createRegexQuery>;
            company_name?: ReturnType<typeof createRegexQuery>;
            category?: ReturnType<typeof createRegexQuery>;
            marketer_name?:
                | ReturnType<typeof createRegexQuery>
                | { [k: string]: string | ReturnType<typeof createRegexQuery> };
            is_prospected?: boolean;
            is_lead?: boolean;
            followup_done?: boolean;
            client_status?: string | { $in: string[] };
            calling_date_history?: Record<string, any>;
            test_given_date_history?: Record<string, any>;
            prospect_status?: ReturnType<typeof createRegexQuery>;
            $or?: Record<string, ReturnType<typeof createRegexQuery>>[];
        }

        const query: QueryShape = {};

        // Regex/string fields
        addIfDefined(query, 'country', createRegexQuery(country));
        addIfDefined(query, 'company_name', createRegexQuery(companyName));
        addIfDefined(query, 'category', createRegexQuery(category));
        addIfDefined(
            query,
            'marketer_name',
            createRegexQuery(marketerName, { exact: false, flexible: true }),
        );
        addIfDefined(
            query,
            'prospect_status',
            createRegexQuery(prospectStatus, { exact: false, flexible: true }),
        );

        // Booleans
        addBooleanField(query, 'is_prospected', prospect);
        query.is_lead = onlyLead || false;
        addIfDefined(query, 'followup_done', followupDone);

        // Client status
        if (regularClient) {
            query.client_status = 'pending';
        } else if (regularClient === false) {
            query.client_status = { $in: ['none', 'pending'] };
        }

        // Stale client: no calls in the last 2 months
        if (staleClient) {
            const twoMonthsAgo = moment()
                .tz('Asia/Dhaka')
                .subtract(2, 'months')
                .format('YYYY-MM-DD');
            query.calling_date_history = {
                $not: { $elemMatch: { $gte: twoMonthsAgo } },
            };
        }

        // Date range on calling_date_history
        if (fromDate || toDate) {
            query.calling_date_history = query.calling_date_history || {};
            query.calling_date_history.$elemMatch = {
                ...(fromDate && { $gte: fromDate }),
                ...(toDate && { $lte: toDate }),
            };
        }

        if (!fromDate && !toDate && !staleClient) {
            delete query.calling_date_history;
        }

        // If test filter true, convert calling_date_history condition to test_given_date_history
        if (test === true) {
            if (query.calling_date_history) {
                query.test_given_date_history = query.calling_date_history;
                delete query.calling_date_history;
            } else {
                query.test_given_date_history = {
                    $exists: true,
                    $ne: [],
                };
            }
        }

        const searchQuery: QueryShape = { ...query };

        // Sorting defaults
        let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
        if (
            followupDone === false &&
            regularClient === false &&
            searchQuery.is_lead === false
        ) {
            sortQuery = {
                hasFollowupDate: 1,
                followup_date: 1,
                createdAt: -1,
            };
        }

        if (
            filtered &&
            !country &&
            !companyName &&
            !category &&
            !marketerName &&
            !prospectStatus &&
            !generalSearchString &&
            !fromDate &&
            !toDate &&
            !test &&
            prospect !== true &&
            followupDone === undefined &&
            regularClient === undefined &&
            staleClient !== true &&
            onlyLead !== true
        ) {
            throw new BadRequestException('No filter applied');
        }

        // General search
        if (generalSearchString) {
            const ors = buildOrRegex(generalSearchString, [
                'country',
                'company_name',
                'category',
                'marketer_name',
                'designation',
                'website',
                'contact_person',
                'contact_number',
                'calling_status',
                'email_address',
                'linkedin',
            ]);
            if (ors.length > 0) searchQuery.$or = ors;
        }

        const skip = (page - 1) * itemsPerPage;
        if (paginated) {
            const count = await this.reportModel.countDocuments(
                searchQuery as Record<string, unknown>,
            );
            const pipeline: any[] = [
                { $match: searchQuery },
                {
                    $addFields: {
                        hasFollowupDate: {
                            $cond: {
                                if: { $eq: ['$followup_date', ''] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                },
                { $sort: sortQuery },
                { $skip: skip },
                { $limit: itemsPerPage },
                { $project: { hasFollowupDate: 0 } },
            ];
            const items = await this.reportModel.aggregate(pipeline).exec();
            if (!items) {
                throw new InternalServerErrorException(
                    'Unable to retrieve reports',
                );
            }
            return {
                pagination: {
                    count,
                    pageCount: Math.ceil(count / itemsPerPage),
                },
                items,
            };
        }

        // Unpaginated: simple find
        const items = await this.reportModel
            .find(searchQuery as Record<string, unknown>)
            .lean()
            .exec();
        if (!items) {
            throw new InternalServerErrorException(
                'Unable to retrieve reports',
            );
        }
        return items;
    }

    async createReport(userSession: UserSession, body: CreateReportBodyDto) {
        if (!hasPerm('crm:create_report', userSession.permissions)) {
            throw new ForbiddenException(
                'You do not have permission to create report',
            );
        }

        try {
            // Resolve marketer name
            const user = await this.userModel
                .findById(userSession.db_id)
                .lean();
            const marketerName = (
                user?.provided_name ||
                user?.real_name ||
                user?.name ||
                ''
            ).trim();
            if (!marketerName) {
                throw new BadRequestException(
                    'Marketer name is missing for this user',
                );
            }

            const isLead = body.newLead === true;

            // If creating a lead, check duplicate by flexible company name
            if (isLead && body.company) {
                const dup = await this.reportModel.findOne({
                    company_name: createRegexQuery(body.company, {
                        exact: false,
                        flexible: true,
                    }),
                });
                if (dup) {
                    throw new ConflictException(
                        'This lead already exists in database',
                    );
                }
            }

            const doc = ReportFactory.fromCreateDto(
                body,
                userSession,
                marketerName,
            );

            const created = await this.reportModel.create(doc);
            if (!created) {
                throw new InternalServerErrorException(
                    'Failed to create a new report',
                );
            }
            return created;
        } catch (e) {
            if (
                e instanceof BadRequestException ||
                e instanceof ForbiddenException ||
                e instanceof InternalServerErrorException
            )
                throw e;
            throw new InternalServerErrorException('Unable to create report');
        }
    }

    async updateReport(
        id: string,
        body: Partial<CreateReportBodyDto>,
        userSession: UserSession,
    ) {
        if (!hasPerm('crm:create_report', userSession.permissions)) {
            throw new ForbiddenException(
                'You do not have permission to update report',
            );
        }

        try {
            const update = ReportFactory.fromUpdateDto(body, userSession);

            const updated = await this.reportModel
                .findByIdAndUpdate(id, update)
                .exec();

            if (!updated) {
                throw new BadRequestException('Failed to update report');
            }
            return updated;
        } catch (e) {
            if (
                e instanceof BadRequestException ||
                e instanceof ForbiddenException ||
                e instanceof InternalServerErrorException
            )
                throw e;
            throw new InternalServerErrorException('Unable to update report');
        }
    }

    async convertToClient(
        userSession: UserSession,
        body: ConvertToClientBodyDto,
    ) {
        // Permission gate: who can convert a report/company into a client
        if (!hasPerm('crm:send_client_request', userSession.permissions)) {
            throw new ForbiddenException(
                'You do not have permission to convert to client',
            );
        }

        // Start a transaction
        const session = await this.clientModel.db.startSession();
        session.startTransaction();
        try {
            // 1) Ensure unique client_code
            const existingCount = await this.clientModel.countDocuments(
                { client_code: body.client_code },
                { session },
            );
            if (existingCount > 0) {
                await session.abortTransaction();
                await session.endSession();
                throw new ConflictException(
                    'Client with the same code already exists',
                );
            }

            // 2) Create client
            const created = await this.clientModel.create([body], { session });
            if (!created || created.length === 0) {
                await session.abortTransaction();
                await session.endSession();
                throw new InternalServerErrorException(
                    'Unable to create new client',
                );
            }

            // 3) Update corresponding report: find one non-lead with company_name == client_name
            const updatedReport = await this.reportModel.findOneAndUpdate(
                { company_name: body.client_name, is_lead: false },
                { client_status: 'approved', onboard_date: getTodayDate() },
                { new: true, session },
            );

            if (!updatedReport) {
                await session.abortTransaction();
                await session.endSession();
                throw new InternalServerErrorException(
                    'Unable to change the status of the report',
                );
            }

            await session.commitTransaction();
            // Extract plain client object for response
            const createdClientDoc = created[0] as any;
            const client: Client =
                typeof createdClientDoc?.toObject === 'function'
                    ? createdClientDoc.toObject()
                    : createdClientDoc;
            await session.endSession();
            return { message: 'Added the client successfully', client };
        } catch (e) {
            // Ensure transaction cleanup
            try {
                await session.abortTransaction();
                await session.endSession();
            } catch {
                // ignore cleanup errors
            }
            // Re-throw known http exceptions, otherwise wrap
            if (
                e instanceof BadRequestException ||
                e instanceof ForbiddenException ||
                e instanceof InternalServerErrorException
            )
                throw e;
            throw new InternalServerErrorException('An error occurred');
        }
    }

    async rejectClientRequest(userSession: UserSession, id: string) {
        if (!hasPerm('crm:check_client_request', userSession.permissions)) {
            throw new ForbiddenException(
                'You do not have permission to reject client requests',
            );
        }

        try {
            const updated = await this.reportModel
                .findByIdAndUpdate(id, { client_status: 'none' }, { new: true })
                .exec();

            if (!updated) {
                throw new BadRequestException(
                    'Unable reject regular client request',
                );
            }

            return { message: 'Rejected regular client request' };
        } catch (e) {
            if (
                e instanceof BadRequestException ||
                e instanceof ForbiddenException ||
                e instanceof InternalServerErrorException
            )
                throw e;
            throw new InternalServerErrorException('An error occurred');
        }
    }

    async markDuplicateClientRequest(
        userSession: UserSession,
        reportId: string,
    ) {
        if (!hasPerm('crm:check_client_request', userSession.permissions)) {
            throw new ForbiddenException(
                'You do not have permission to mark duplicate client requests',
            );
        }

        try {
            const updated = await this.reportModel
                .findByIdAndUpdate(
                    reportId,
                    { client_status: 'approved' },
                    { new: true },
                )
                .exec();

            if (!updated) {
                throw new BadRequestException(
                    'Failed to mark the request as duplicate',
                );
            }

            return 'Marked the request as duplicate client';
        } catch (e) {
            if (
                e instanceof BadRequestException ||
                e instanceof ForbiddenException ||
                e instanceof InternalServerErrorException
            )
                throw e;
            throw new InternalServerErrorException(
                'Unable to mark the request as duplicate',
            );
        }
    }

    async followupCountForToday(
        userSession: UserSession,
        marketerName: string,
    ) {
        if (!hasPerm('crm:view_reports', userSession.permissions)) {
            throw new ForbiddenException(
                'You do not have permission to view reports',
            );
        }

        try {
            const today = getTodayDate();
            const count = await this.reportModel.countDocuments({
                marketer_name: marketerName,
                followup_date: { $lte: today, $ne: '', $exists: true },
                followup_done: false,
                is_lead: false,
            });
            return count;
        } catch (e) {
            if (
                e instanceof BadRequestException ||
                e instanceof ForbiddenException ||
                e instanceof InternalServerErrorException
            )
                throw e;
            throw new InternalServerErrorException(
                'Unable to fetch follow-up count',
            );
        }
    }
}
