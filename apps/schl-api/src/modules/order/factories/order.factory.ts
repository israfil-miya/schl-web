import { Order } from 'src/models/order.schema';
import { CreateOrderBodyDto } from '../dto/create-order.dto';

export class OrderFactory {
    static fromCreateDto(dto: CreateOrderBodyDto): Partial<Order> {
        return {
            client_code: dto.clientCode.trim(),
            client_name: dto.clientName.trim(),
            folder: dto.folder?.trim(),
            rate: dto.rate ?? null,
            quantity: dto.quantity ?? 0,
            download_date: dto.downloadDate,
            delivery_date: dto.deliveryDate ?? '',
            delivery_bd_time: dto.deliveryBdTime ?? '',
            task: dto.task.trim(),
            et: dto.et ?? 0,
            production: dto.production ?? 0,
            qc1: dto.qc1 ?? 0,
            qc2: dto.qc2 ?? 0,
            comment: dto.comment ?? '',
            type: dto.type ?? 'general',
            status: dto.status ?? 'running',
            folder_path: dto.folderPath ?? '',
            priority: dto.priority ?? 'medium',
            updated_by: null,
        };
    }
}
