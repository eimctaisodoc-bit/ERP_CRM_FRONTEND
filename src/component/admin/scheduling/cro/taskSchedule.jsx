import React from "react";
import { Schedule } from "../../../schedule/schedule";
import { useEffect, useState } from "react";
import { MainLoader } from "../../../loader";
import { useGet } from "../../../hooks/useGet";
import { useSessionAuth } from "../../../utils";

export const TaskSchedule = () => {
    const { currentUser, isLoading: isAuthLoading } = useSessionAuth();
    const { getCompanyOptions_, getEachRecruitmentDetails_ } = useGet({
        loadCompanyOptions: currentUser?.role === "admin",
        currentUser,
        isAuthLoading,
        recruitmentDetailsId: currentUser?.id,
    });
    const {
        data: companies = [],
        isLoading,
        isError,
        error,
    } = getCompanyOptions_;
    const [jobRole, setJobRole] = useState("");
    const details = getEachRecruitmentDetails_.data;
    const authoritative = details?.branches?.[0]?._id || details?.staffs?.[0]?._id || {};

    useEffect(() => {
        setJobRole(
            details?.branches?.[0]?.jobRole ||
            details?.staffs?.[0]?.jobRole ||
            ""
        );
    }, [getEachRecruitmentDetails_.data]);


    // console.log("jobRole", jobRole);
    if (isAuthLoading || isLoading || getEachRecruitmentDetails_.isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center" aria-busy="true" aria-label="Loading schedule">
                <MainLoader />
            </div>
        );
    }

    if (getEachRecruitmentDetails_.isError) {
        return (
            <div role="alert" className="p-6 text-center text-red-600">
                Failed to load schedule role: {getEachRecruitmentDetails_.error.message}
            </div>
        );
    }

    if (isError) {
        return (
            <div role="alert" className="p-6 text-center text-red-600">
                Failed to load organizations: {error.message}
            </div>
        );
    }

    const AdminCompany = [
        { label: "All", value: "All" },
        ...(Array.isArray(companies) ? companies : []).map(({ _id, organizationName }) => ({
            label: organizationName || "Unnamed Organization",
            value: String(_id),
        })),
    ];


    // console.log('running....')
    return (
        <Schedule
            INITIAL_ACTIVITIES={[]}
            HOLIDAYS={[]}
            companyOptions={AdminCompany}
            jobRole={jobRole}
            authoritative={authoritative}
        />
    );
};

export const Admin_sales = TaskSchedule;
