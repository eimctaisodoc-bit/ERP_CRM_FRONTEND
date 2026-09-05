import { useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import { editNote, Editmsg, Editcalls, Updateproposal, SendCredit, EditStatus ,EditStatus_admin, EditBranchStatus, SendBranchCredit} from "../../api/role.api";
import { userById } from "../../api/auth.api";

export const useEdit = () => {
    const queryClient = useQueryClient();

    const editNote_ = useMutation({
        mutationFn: editNote,
        onSuccess: (data, variables) => {
         
            queryClient.invalidateQueries({
                queryKey: ["notes", variables.parms.MainID]
            });

            console.log("Note updated successfully:", data);
        },
    });
    const Editmsg_ = useMutation({
        mutationFn: Editmsg,
        onSuccess: (data, variables) => {
            // INSTANT SYNC: This forces the UI to instantly pull the new edit
            queryClient.invalidateQueries({
                queryKey: ["editMsg", variables.parms.MainID]
            });

            console.log("Note updated successfully:", data);
        },
    });
    const Editcalls_ = useMutation({
        mutationFn: Editcalls,
        onSuccess: (data, variables) => {
            // INSTANT SYNC: This forces the UI to instantly pull the new edit
            queryClient.invalidateQueries({
                queryKey: ["editCall", variables.parms.MainID]
            });

            console.log("Note updated successfully:", data);
        },
    });
    const Updateproposal_ = useMutation({
        mutationFn: Updateproposal,
        onSuccess: (data, variables) => {
            // INSTANT SYNC: This forces the UI to instantly pull the new edit
            queryClient.invalidateQueries({
                queryKey: ["updateproposal", variables.parms.MainID]
            });

            console.log("Note updated successfully:", data);
        },
    });
    const EditStatus_ = useMutation({
        mutationFn: EditStatus,
        onSuccess: (data, variables) => {

            queryClient.invalidateQueries({
                queryKey: ["editStatus"]
            });

            console.log("Note updated successfully:", data);
        },
    });
    const SendCredit_ = useMutation({
        mutationFn: SendCredit,
        onSuccess: (data, variables) => {
            // INSTANT SYNC: This forces the UI to instantly pull the new edit
            queryClient.invalidateQueries({
                queryKey: ["sendCredit"]
            });

            console.log("Note updated successfully:", data);
        },
    });
    const EditStatus_admin_ = useMutation({
        mutationFn: EditStatus_admin,
        onSuccess: (data, variables) => {
            // INSTANT SYNC: This forces the UI to instantly pull the new edit
            queryClient.invalidateQueries({
                queryKey: ["editStatus"]
            });
            console.log("Note updated successfully:", data);
        },
    });
    const EditBranchStatus_ = useMutation({ mutationFn: EditBranchStatus });
    const SendBranchCredit_ = useMutation({ mutationFn: SendBranchCredit });



    return {
        editNote_,
        Editmsg_,
        Editcalls_,
        Updateproposal_,
        EditStatus_,
        SendCredit_,
        EditStatus_admin_,
        EditBranchStatus_,
        SendBranchCredit_
    }
}
