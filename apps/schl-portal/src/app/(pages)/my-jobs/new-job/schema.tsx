import { JOB_SHIFTS } from '@repo/common/constants/order.constant';
import { z } from 'zod';

export const validationSchema = z.object({
    client_code: z
        .string({ required_error: "Client code can't be empty" })
        .min(1, "Client code can't be empty"),
    folder: z
        .string({ required_error: "Folder can't be empty" })
        .min(1, "Folder can't be empty"),
    file_names: z.array(z.string()).min(1, 'At least one file is required'),
    is_qc: z.boolean().default(false), // for new job qc is set false
    is_active: z.boolean().default(true), // start now or later
    shift: z.enum(JOB_SHIFTS, {
        required_error: 'Shift is required',
    }),
});
export type NewJobDataType = z.infer<typeof validationSchema>;
