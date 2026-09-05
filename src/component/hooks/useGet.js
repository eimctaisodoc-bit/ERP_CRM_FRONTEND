import { useQueries, useQueryClient, Mutation, useMutation, QueryClientProvider, QueryClient, } from "@tanstack/react-query";
import api from "../../api/axios";
import {
    // Get_schedule_only, 
    getDetails, 
    Get_Org_Details_Only,
    getActivities,
    getOnlyStage1Data, 
    getOnlyStage2Data, 
    getOnlyStage3Data, 
    Getproposal, 
    getUserCredit,
    getStaffCredit,
    getLocalStorageFiles,
    getAllRecruitment,
    getAllBranch
} from "../../api/role.api";
import { userById } from "../../api/auth.api";

export const useGet = () => {
    const queryClient = useQueryClient();

    const getUser = useMutation({
        mutationFn: userById,
        onSuccess: (data) => {
            queryClient.setQueryData(["getUser", data._id], data);
        },
    });
    const getDetails_ = useMutation({
        mutationFn: getDetails,
        onSuccess: (data) => {
            // console.log('from postman', data.user)
            queryClient.setQueryData(["getdetails"], data?.user);
        },
        onError: (err) => {
            console.log("mutation error", err);
        }
    })
    // const getScheduleOnly_ = useMutation({
    //     mutationFn: Get_schedule_only,
    //     onSuccess: (data) => {
    //         queryClient.setQueryData(["get_scheduleonly"], data);
    //     },
    //     onError: () => {
    //         console.log("erro")
    //     }
    // })
    const getOnlyOrgDetails_ = useMutation({
        mutationFn: (params) => {
            return queryClient.fetchQuery({
                queryKey: ["get_org_details_only", params?._id],
                queryFn: () => Get_Org_Details_Only(params),
                staleTime: 5 * 60 * 1000, // 5 minutes
            });
        },
        // mutationFn: Get_Org_Details_Only,
        onSuccess: (data, params) => {
            queryClient.setQueryData(
                ["get_org_details_only", params?._id],
                data
            );
        },

        onError: (err) => {
            console.log("org details error", err);
        },
    })


    const GetOnlyStage1 = useMutation({
        mutationFn: (params) => {
            return queryClient.fetchQuery({
                queryKey: ["onlyStage1", params?.params?._id],

                queryFn: () => getOnlyStage1Data(params),

                staleTime: 5 * 60 * 1000,
            });
        },

        onSuccess: (data, params) => {
            queryClient.setQueryData(
                ["onlyStage1", params?.params?._id],
                data
            );
        },

        onError: (err) => {
            console.log("org details error", err);
        },
    });
    const GetOnlyStage2 = useMutation({
        mutationFn: (params) => {
            return queryClient.fetchQuery({
                queryKey: ["onlyStage2", params?._id],
                queryFn: () => getOnlyStage2Data(params),
                staleTime: 5 * 60 * 1000, // 5 minutes
            });
        },
        // mutationFn: Get_Org_Details_Only,
        onSuccess: (data, params) => {
            queryClient.setQueryData(
                ["onlyStage2", params?._id],
                data
            );
        },

        onError: (err) => {
            console.log("org details error", err);
        },
    })
    const GetOnlyStage3 = useMutation({
        mutationFn: (params) => {
            return queryClient.fetchQuery({
                queryKey: ["onlyStage3", params?._id],
                queryFn: () => getOnlyStage3Data(params),
                staleTime: 5 * 60 * 1000, // 5 minutes
            });
        },
        // mutationFn: Get_Org_Details_Only,
        onSuccess: (data, params) => {
            queryClient.setQueryData(
                ["onlyStage3", params?._id],
                data
            );
        },

        onError: (err) => {
            console.log("org details error", err);
        },
    })



    // new new new new new
    const getAllActivities_ = useMutation({
        mutationFn: getActivities,

        onSuccess: (data, params) => {
            // Update the React Query bucket instantly with the fresh array
            queryClient.setQueryData(
                ["notes", params?.MainID],
                data
            );
        },
        onError: (err) => {
            console.log("notes error", err);
        }
    });
    const Getproposal_ = useMutation({
        // FIX: Directly call the API function. Removing fetchQuery and staleTime 
        // guarantees it actually asks the database for fresh data instead of returning old cache.
        mutationFn: Getproposal,

        onSuccess: (data, params) => {
            // Update the React Query bucket instantly with the fresh array
            queryClient.setQueryData(
                ["getproposal", params?.MainID],
                data
            );
        },
        onError: (err) => {
            console.log("notes error", err);
        }
    });

    const getUserCredit_ = useMutation({
        mutationFn: getUserCredit,
        onSuccess: (data, params) => {
            queryClient.setQueryData(
                ["getCredit"],
                data
            );
        },
        onError: (err) => {
            console.log("notes error", err);
        }
    });
    const getStaffCredit_ = useMutation({
        mutationFn: getStaffCredit,
        onSuccess: (data, params) => {
            queryClient.setQueryData(
                ["getCredit"],
                data
            );
        },
        onError: (err) => {
            console.log("notes error", err);
        }
    });
    const getLocalStorageFiles_ = useMutation({
        mutationFn: getLocalStorageFiles,
        onSuccess: (data, params) => {
            queryClient.setQueryData(
                ["getFiles"],
                data
            );
        },
        onError: (err) => {
            console.log("notes error", err);
        }
    });
    const getAllRecruitment_ = useMutation({
        mutationFn: getAllRecruitment,
        onSuccess: (data, params) => {
            queryClient.setQueryData(
                ["getAllRecruitment"],
                data
            );
        },
        onError: (err) => {
            console.log("notes error", err);
        }
    });
    const getAllBranch_ = useMutation({
        mutationFn: getAllBranch,
        onSuccess: (data, params) => {
            queryClient.setQueryData(
                ["getAllBranch"],
                data
            );
        },
        onError: (err) => {
            console.log("notes error", err);
        }
    });

    return {
        getDetails_,
        // getScheduleOnly_,
        getOnlyOrgDetails_,
        getUser,
        GetOnlyStage1,
        GetOnlyStage2,
        GetOnlyStage3,
        // new new new new new
        getAllActivities_,
        Getproposal_,
        getUserCredit_,
        getStaffCredit_,
        getLocalStorageFiles_,
        getAllRecruitment_,
        getAllBranch_
    }
}
