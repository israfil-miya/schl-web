import { Employee } from '@repo/common/models/employee.schema';
import { CreateEmployeeBodyDto } from '../dto/create-employee.dto';

export class EmployeeFactory {
    static fromCreateDto(dto: CreateEmployeeBodyDto): Partial<Employee> {
        // We are not currently storing updated_by for employee (schema lacks field)
        return {
            e_id: dto.eId.trim(),
            real_name: dto.realName.trim(),
            joining_date: dto.joiningDate.trim(),
            phone: dto.phone?.trim() || '',
            email: dto.email?.toLowerCase().trim() || '',
            birth_date: dto.birthDate?.trim() || '',
            nid: dto.nid?.trim() || '',
            blood_group: dto.bloodGroup, // enum validated
            designation: dto.designation.trim(),
            department: dto.department.trim(),
            gross_salary: dto.grossSalary,
            bonus_eid_ul_adha: dto.bonusEidUlAdha,
            bonus_eid_ul_fitr: dto.bonusEidUlFitr,
            status: dto.status,
            provident_fund: dto.providentFund ?? 0,
            pf_start_date: dto.pfStartDate || null,
            pf_history: [],
            branch: dto.branch?.trim() || '',
            address: dto.address?.trim() || '',
            division: dto.division?.trim() || '',
            company_provided_name: dto.companyProvidedName?.trim() || null,
            note: dto.note?.trim() || '',
        } as Partial<Employee>;
    }

    static fromUpdateDto(
        dto: Partial<CreateEmployeeBodyDto>,
    ): Partial<Employee> {
        const patch: Partial<Employee> = {};
        const setStr = (v?: string | null) =>
            v === null ? null : v !== undefined ? v.trim() : undefined;
        if (dto.eId !== undefined) patch.e_id = dto.eId.trim();
        if (dto.realName !== undefined) patch.real_name = dto.realName.trim();
        if (dto.joiningDate !== undefined)
            patch.joining_date = dto.joiningDate.trim();
        if (dto.phone !== undefined) patch.phone = dto.phone?.trim() || '';
        if (dto.email !== undefined)
            patch.email = dto.email ? dto.email.toLowerCase().trim() : '';
        if (dto.birthDate !== undefined)
            patch.birth_date = dto.birthDate?.trim() || '';
        if (dto.nid !== undefined) patch.nid = dto.nid?.trim() || '';
        if (dto.bloodGroup !== undefined) patch.blood_group = dto.bloodGroup;
        if (dto.designation !== undefined)
            patch.designation = dto.designation.trim();
        if (dto.department !== undefined)
            patch.department = dto.department.trim();
        if (dto.grossSalary !== undefined) patch.gross_salary = dto.grossSalary;
        if (dto.bonusEidUlAdha !== undefined)
            patch.bonus_eid_ul_adha = dto.bonusEidUlAdha;
        if (dto.bonusEidUlFitr !== undefined)
            patch.bonus_eid_ul_fitr = dto.bonusEidUlFitr;
        if (dto.status !== undefined) patch.status = dto.status;
        if (dto.providentFund !== undefined)
            patch.provident_fund = dto.providentFund;
        if (dto.pfStartDate !== undefined)
            patch.pf_start_date = dto.pfStartDate || null;
        if (dto.branch !== undefined) patch.branch = dto.branch?.trim() || '';
        if (dto.address !== undefined)
            patch.address = dto.address?.trim() || '';
        if (dto.division !== undefined)
            patch.division = dto.division?.trim() || '';
        if (dto.companyProvidedName !== undefined)
            patch.company_provided_name = setStr(
                dto.companyProvidedName,
            ) as any; // null allowed
        if (dto.note !== undefined) patch.note = dto.note?.trim() || '';
        return patch;
    }
}
