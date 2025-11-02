import { CreateClientBodyDto } from '../../client/dto/create-client.dto';

// Reuse the Client creation DTO shape for converting a report/company into a client
export class ConvertToClientBodyDto extends CreateClientBodyDto {}
