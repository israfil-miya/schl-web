'use client';
import { toastFetchError, useAuthedFetchApi } from '@/lib/api-client';
import { EmployeeDocument } from '@repo/common/models/employee.schema';
import { PopulatedByRoleUser } from '@repo/common/types/populated-user.type';
import { formatDate } from '@repo/common/utils/date-helpers';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const DailyStatusTable = () => {
    const authedFetchApi = useAuthedFetchApi();
    const [marketers, setMarketers] = useState<EmployeeDocument[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const { data: session } = useSession();

    const getAllMarketers = useCallback(async () => {
        try {
            setLoading(true);

            const response = await authedFetchApi(
                {
                    path: '/v1/user/search-users',
                    query: {
                        paginated: false,
                        // filtered: true
                    },
                },
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        department: 'Marketing',
                        employee_expanded: true,
                    }),
                },
            );

            if (response.ok) {
                const userData = response.data as PopulatedByRoleUser[];

                // Reduce user results to an array of employee documents
                const onlyEmployeeData = Array.isArray(userData)
                    ? userData.reduce<EmployeeDocument[]>((acc, item) => {
                          const employee = (item as PopulatedByRoleUser)
                              .employee;
                          if (employee)
                              acc.push(employee as unknown as EmployeeDocument);
                          return acc;
                      }, [])
                    : [];

                setMarketers(onlyEmployeeData);
            } else {
                toastFetchError(response);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while retrieving marketers data');
        } finally {
            setLoading(false);
        }
    }, [authedFetchApi]);

    useEffect(() => {
        getAllMarketers();
    }, [getAllMarketers]);

    if (loading) {
        return <p className="text-center">Loading...</p>;
    }

    return (
        <div className="table-responsive text-lg px-2">
            {marketers?.length !== 0 ? (
                <table className="table table-hover border table-bordered">
                    <thead>
                        <tr className="bg-gray-50">
                            <th>S/N</th>
                            <th>Marketer Name</th>
                            <th>Real Name</th>
                            <th>Joining Date</th>
                            <th>Phone</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody className="text-base">
                        {marketers?.map((marketer, index) => (
                            <tr key={marketer.e_id}>
                                <td>{index + 1}</td>
                                <td>{marketer.company_provided_name}</td>
                                <td>{marketer.real_name}</td>
                                <td>
                                    {marketer.joining_date
                                        ? formatDate(marketer.joining_date)
                                        : null}
                                </td>
                                <td>
                                    {marketer.phone ? marketer.phone : 'N/A'}
                                </td>
                                <td>
                                    {marketer.email ? marketer.email : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <table className="table border table-bordered table-striped">
                    <tbody>
                        <tr key={0}>
                            <td className="align-center text-center text-wrap">
                                No Marketers To Show.
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DailyStatusTable;
