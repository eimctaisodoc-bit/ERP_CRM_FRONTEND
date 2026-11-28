import { useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import {
    editNote, Editmsg, Editcalls, EditMeeting,
    // Updateproposal, 
    SendCredit, EditStatus, EditStatus_admin, EditBranchStatus, EditBranch, EditAdmin, SendBranchCredit,
    EditStaff, SendStaffPasswordReset, EditSalesLead, updateInstallment,
    updateTermsAndConditions,
    // clients
    editClients,
    disabledClients,
    // note 
    S_UpdateNote,
    A_UpdateNote,
    C_UpdateNote,
    ST_UpdateNote,
    // recruitment
    editRecruitmentForSuper,

} from "../../api/role.api";
import { userById } from "../../api/auth.api";

export const useEdit = () => {
    const queryClient = useQueryClient();

    const editNote_ = useMutation({
        mutationFn: editNote,
        onSuccess: (data, variables) => {

            queryClient.invalidateQueries({
                queryKey: ["notes", variables.parms.MainID]
            });

            // console.log("Note updated successfully:", data);
        },
    });
    const Editmsg_ = useMutation({
        mutationFn: Editmsg,
        onSuccess: (data, variables) => {
            // INSTANT SYNC: This forces the UI to instantly pull the new edit
            queryClient.invalidateQueries({
                queryKey: ["editMsg", variables.parms.MainID]
            });

            // console.log("Note updated successfully:", data);
        },
    });
    const Editcalls_ = useMutation({
        mutationFn: Editcalls,
        onSuccess: (data, variables) => {
            // INSTANT SYNC: This forces the UI to instantly pull the new edit
            queryClient.invalidateQueries({
                queryKey: ["editCall", variables.parms.MainID]
            });

            // console.log("Note updated successfully:", data);
        },
    });
    const EditMeeting_ = useMutation({
        mutationFn: EditMeeting,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["notes", variables.parms.MainID]
            });
        },
    });
    // const Updateproposal_ = useMutation({
    //     mutationFn: Updateproposal,
    //     onSuccess: (data, variables) => {
    //         // INSTANT SYNC: This forces the UI to instantly pull the new edit
    //         queryClient.invalidateQueries({
    //             queryKey: ["updateproposal", variables.parms.MainID]
    //         });

    //         // console.log("Note updated successfully:", data);
    //     },
    // });
    const EditStatus_ = useMutation({
        mutationFn: EditStatus,
        onSuccess: (data, variables) => {

            queryClient.invalidateQueries({
                queryKey: ["editStatus"]
            });

            // console.log("Note updated successfully:", data);
        },
    });
    const SendCredit_ = useMutation({
        mutationFn: SendCredit,
        onSuccess: (data, variables) => {
            // INSTANT SYNC: This forces the UI to instantly pull the new edit
            queryClient.invalidateQueries({
                queryKey: ["sendCredit"]
            });

            // console.log("Note updated successfully:", data);
        },
    });
    const EditStatus_admin_ = useMutation({
        mutationFn: EditStatus_admin,
        onSuccess: (data, variables) => {
            // INSTANT SYNC: This forces the UI to instantly pull the new edit
            queryClient.invalidateQueries({
                queryKey: ["editStatus"]
            });
            // console.log("Note updated successfully:", data);
        },
    });
    const EditStaff_ = useMutation({ mutationFn: EditStaff });
    const SendStaffPasswordReset_ = useMutation({ mutationFn: SendStaffPasswordReset });
    const EditBranchStatus_ = useMutation({ mutationFn: EditBranchStatus });
    const EditBranch_ = useMutation({ mutationFn: EditBranch });
    const EditAdmin_ = useMutation({ mutationFn: EditAdmin });
    const SendBranchCredit_ = useMutation({ mutationFn: SendBranchCredit });
    const EditSalesLead_ = useMutation({ mutationFn: EditSalesLead });

    const UpdateInstallment_ = useMutation({ mutationFn: updateInstallment });
    const UpdateTermsAndConditions_ = useMutation({ mutationFn: updateTermsAndConditions });
    const editClients_ = useMutation({ mutationFn: editClients });
    const disabledClients_ = useMutation({ mutationFn: disabledClients });
    const S_UpdateNote_ = useMutation({ mutationFn: S_UpdateNote });
    // const editRecruitmentForAdmin_ = useMutation({ mutationFn: editRecruitmentForAdmin });
    const editRecruitmentForSuper_ = useMutation({ mutationFn: editRecruitmentForSuper });
    const A_UpdateNote_ = useMutation({ mutationFn: A_UpdateNote });


    const C_UpdateNote_ = useMutation({ mutationFn: C_UpdateNote });

    const ST_UpdateNote_ = useMutation({ mutationFn: ST_UpdateNote });


    return {
        editNote_,
        Editmsg_,
        Editcalls_,
        EditMeeting: EditMeeting_,
        // Updateproposal_,
        EditStatus_,
        SendCredit_,
        EditStatus_admin_,
        EditStaff_,
        SendStaffPasswordReset_,
        EditBranchStatus_,
        EditBranch_,
        EditAdmin_,
        SendBranchCredit_,
        EditSalesLead_,
        UpdateInstallment_,
        UpdateTermsAndConditions_,
        // clients
        editClients_,
        disabledClients_,
        // note 
        S_UpdateNote_,
        A_UpdateNote_,
        C_UpdateNote_,
        ST_UpdateNote_,

        // recruitment
        editRecruitmentForSuper_,

    }
}
