import {
    JOB_SHIFTS,
    ORDER_PRIORITIES,
    ORDER_STATUSES,
    ORDER_TYPES,
} from '@repo/common/constants/order.constant';
import mongoose from 'mongoose';
import { z } from 'zod';

const OrderFilesTrackingSchema = z.object({
    file_name: z.string({ required_error: 'File name is required' }),
    start_timestamp: z.coerce.date({
        required_error: 'Start timestamp is required',
    }),
    end_timestamp: z.coerce.date().nullable().default(null),
    is_paused: z.boolean().default(false),
    total_pause_duration: z.number().default(0),
    pause_start_timestamp: z.coerce.date().nullable().default(null),
    is_completed: z.boolean().default(false),
});

const OrderProgressSchema = z
    .object({
        employee: z
            .string({ required_error: 'Employee has not been assigned' })
            .refine(val => mongoose.Types.ObjectId.isValid(val), {
                message: 'Invalid employee ID',
            }),
        shift: z.enum(JOB_SHIFTS, {
            required_error: 'Shift is required',
        }),
        is_qc: z.boolean().default(false),
        qc_step: z.number().nullable().default(0),
        files_tracking: z.array(OrderFilesTrackingSchema).default([]),
    })
    .superRefine((data, ctx) => {
        if (data.is_qc) {
            if (data.qc_step === null || data.qc_step <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        'QC step must be greater than 0 when QC is enabled',
                    path: ['qc_step'],
                });
            }
        }
    });

export const validationSchema = z.object({
    client_code: z
        .string({ invalid_type_error: "Client code can't be empty" })
        .min(1, "Client code can't be empty"),
    client_name: z
        .string({ invalid_type_error: "Client name can't be empty" })
        .min(1, "Client name can't be empty"),
    folder: z.string().default(''),
    rate: z.coerce
        .number({ invalid_type_error: "Rate can't be empty" })
        .min(0, "Rate can't be negative")
        .nullable()
        .default(null),
    quantity: z.coerce
        .number({ invalid_type_error: "Quantity can't be empty" })
        .min(0, "Quantity can't be negative")
        .default(0),
    download_date: z.string({
        invalid_type_error: "Download date can't be empty",
    }),
    delivery_date: z.string().default(''),
    delivery_bd_time: z.string().default(''),
    task: z
        .string({ invalid_type_error: "Task can't be empty" })
        .min(1, "Task can't be empty"),
    et: z.coerce
        .number({ invalid_type_error: "ET can't be empty" })
        .min(0, "ET can't be less than 0")
        .default(0),
    production: z.coerce.number().default(0),
    qc1: z.coerce.number().default(0),
    qc2: z.coerce.number().default(0),
    comment: z.string().default(''),
    type: z.enum(ORDER_TYPES).default('general'),
    status: z.enum(ORDER_STATUSES).default('running'),
    folder_path: z.string().default(''),
    priority: z.enum(ORDER_PRIORITIES).default('medium'),
    progress: z.array(OrderProgressSchema).default([]),
    updated_by: z.string().nullable().default(null),
    _id: z.optional(
        z.string().refine(val => {
            return mongoose.Types.ObjectId.isValid(val);
        }),
    ),
    createdAt: z.optional(z.union([z.date(), z.string()])),
    updatedAt: z.optional(z.union([z.date(), z.string()])),
    __v: z.optional(z.number()),
});

export type OrderDataType = z.infer<typeof validationSchema>;
