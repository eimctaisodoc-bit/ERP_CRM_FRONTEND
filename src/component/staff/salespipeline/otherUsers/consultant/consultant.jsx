import { Schedule } from "../../../../schedule/schedule";
import React, { useEffect, useState } from "react";
import { MainLoader } from "../../../../loader";
import { useGet } from "../../../../hooks/useGet";
import { useSessionAuth } from "../../../../utils";

const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };

export const Consultant_sales = () => {
    const { currentUser, isLoading: isAuthLoading } = useSessionAuth();
    const { GETCOMPANYOPTIONS_, GETEACHRECRUITMENTDETAILS_ } = useGet({
        loadCompanyOptions: currentUser?.role === "staff",
        currentUser,
        isAuthLoading,
        staffRecruitmentDetailsId: currentUser?.id,
    });
    const {
        data: companies = [],
        isLoading: isCompaniesLoading,
        isError: isCompaniesError,
        error: companiesError,
    } = GETCOMPANYOPTIONS_;
    const [jobRole, setJobRole] = useState("");

    useEffect(() => {
        const details = GETEACHRECRUITMENTDETAILS_.data;
        setJobRole(
            details?.branches?.[0]?.jobRole ||
            details?.staffs?.[0]?.jobRole ||
            ""
        );
    }, [GETEACHRECRUITMENTDETAILS_.data]);

    const HOLIDAYS = [
        {
            date: '2083-06-15',
            name: "Sample Office Holiday",
        },
    ];

    if (
        isAuthLoading ||
        isCompaniesLoading ||
        GETEACHRECRUITMENTDETAILS_.isLoading
    ) {
        return (
            <div
                className="flex min-h-screen items-center justify-center"
                aria-busy="true"
                aria-label="Loading schedule"
            >
                <MainLoader />
            </div>
        );
    }

    if (GETEACHRECRUITMENTDETAILS_.isError) {
        return (
            <div role="alert" className="p-6 text-center text-red-600">
                Failed to load schedule role:{" "}
                {GETEACHRECRUITMENTDETAILS_.error?.message || "Unknown error"}
            </div>
        );
    }

    if (isCompaniesError) {
        return (
            <div role="alert" className="p-6 text-center text-red-600">
                Failed to load organizations:{" "}
                {companiesError?.message || "Unknown error"}
            </div>
        );
    }

    const companyOptions = [
        { label: "All", value: "All" },
        ...(Array.isArray(companies) ? companies : []).map(
            ({ _id, organizationName }) => ({
                label: organizationName || "Unnamed Organization",
                value: String(_id),
            })
        ),
    ];

    return (
        <div className="min-h-screen bg-white relative w-full pb-12" style={fontLight}>
            <main className="w-full mx-auto pt-8">
                <Schedule
                    HOLIDAYS={HOLIDAYS}
                    INITIAL_ACTIVITIES={[]}
                    companyOptions={companyOptions}
                    jobRole={jobRole}
                />
            </main>
        </div>
    );
}
