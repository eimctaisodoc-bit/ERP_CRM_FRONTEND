import React from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import {
    // Delete_Stage1_ScheduleOnly,
    Deleteadmin, DeleteBranch, DeleteMeetings_, deleteNote, deletecalls, deletmsg, DeleteStaff, Deleteproposal, DeleteSalesLead
} from "../../api/role.api";
export const UseDelete = () => {

    const queryClient = useQueryClient();

    // const delete_stage1_scheduleOnly = useMutation({
    //     mutationFn: Delete_Stage1_ScheduleOnly,
    //     onSuccess: (data) => {
    //         queryClient.setQueryData(["delete_stage1_scheduleOnly"], data.user);
    //     }
    // })

    const deleteNote_ = useMutation({
        mutationFn: deleteNote,
        // 'variables' contains the payload/params you passed to the mutation function
        onSuccess: (data, variables) => {
            // INSTANT SYNC: Tell React Query to immediately refetch the specific list
            queryClient.invalidateQueries({
                queryKey: ["notes", variables.parms.MainID]
            });

            // console.log("Deleted successfully!");
        },
        onError: (err) => {
            console.error("Delete failed", err);
        }
    });
    const deletecalls_ = useMutation({
        mutationFn: deletecalls,
        // 'variables' contains the payload/params you passed to the mutation function
        onSuccess: (data, variables) => {
            // INSTANT SYNC: Tell React Query to immediately refetch the specific list
            queryClient.invalidateQueries({
                queryKey: ["deleteCall", variables.parms.MainID]
            });

            // console.log("Deleted successfully!");
        },
        onError: (err) => {
            console.error("Delete failed", err);
        }
    });
    const deletmsg_ = useMutation({
        mutationFn: deletmsg,
        // 'variables' contains the payload/params you passed to the mutation function
        onSuccess: (data, variables) => {
            // INSTANT SYNC: Tell React Query to immediately refetch the specific list
            queryClient.invalidateQueries({
                queryKey: ["deleteMsg", variables.parms.MainID]
            });

            // console.log("Deleted successfully!");
        },
        onError: (err) => {
            console.error("Delete failed", err);
        }
    });
    const Deleteproposal_ = useMutation({
        mutationFn: Deleteproposal,
        // 'variables' contains the payload/params you passed to the mutation function
        onSuccess: (data, variables) => {
            // INSTANT SYNC: Tell React Query to immediately refetch the specific list
            queryClient.invalidateQueries({
                queryKey: ["deleteproposal", variables.parms.MainID]
            });

            // console.log("Deleted successfully!");
        },
        onError: (err) => {
            console.error("Delete failed", err);
        }
    });
    const DeleteMeeting = useMutation({
        mutationFn: DeleteMeetings_,
        // 'variables' contains the payload/params you passed to the mutation function
        onSuccess: (data, variables) => {
            // INSTANT SYNC: Tell React Query to immediately refetch the specific list
            queryClient.invalidateQueries({
                queryKey: ["deleteMeet", variables.parms.MainID]
            });

            // console.log("Deleted successfully!");
        },
        onError: (err) => {
            console.error("Delete failed", err);
        }
    });
    const Deleteadmin_ = useMutation({
        mutationFn: Deleteadmin,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["deleteadmin"]
            });

            // console.log("Deleted successfully!");
        },
        onError: (err) => {
            console.error("Delete failed", err);
        }
    });
    const DeleteBranch_ = useMutation({
        mutationFn: DeleteBranch, onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["deletebranch"]
            });

            // console.log("Deleted successfully!");
        }
    });

    const DeleteStaff_ = useMutation({
        mutationFn: DeleteStaff,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["deletestaff"]
            });

            // console.log("Deleted successfully!");
        },
        onError: (err) => {
            console.error("Delete failed", err);
        }
    });

    const DeleteSalesLead_ = useMutation({ mutationFn: DeleteSalesLead });

    return {
        // delete_stage1_scheduleOnly,
        deleteNote_,
        deletecalls_,
        deletmsg_,
        Deleteproposal_,
        DeleteMeeting,
        Deleteadmin_,
        DeleteBranch_,
        DeleteStaff_,
        DeleteSalesLead_
    }
}    