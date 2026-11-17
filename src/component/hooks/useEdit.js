import { useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import { editNote, Editmsg, Editcalls, EditMeeting, Updateproposal, SendCredit, EditStatus ,EditStatus_admin, EditBranchStatus, EditBranch, EditAdmin, SendBranchCredit, EditStaff, SendStaffPasswordReset, EditSalesLead} from "../../api/role.api";
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
    const Updateproposal_ = useMutation({
        mutationFn: Updateproposal,
        onSuccess: (data, variables) => {
            // INSTANT SYNC: This forces the UI to instantly pull the new edit
            queryClient.invalidateQueries({
                queryKey: ["updateproposal", variables.parms.MainID]
            });

            // console.log("Note updated successfully:", data);
        },
    });
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



    return {
        editNote_,
        Editmsg_,
        Editcalls_,
        EditMeeting: EditMeeting_,
        Updateproposal_,
        EditStatus_,
        SendCredit_,
        EditStatus_admin_,
        EditStaff_,
        SendStaffPasswordReset_,
        EditBranchStatus_,
        EditBranch_,
        EditAdmin_,
        SendBranchCredit_,
        EditSalesLead_
    }
}
