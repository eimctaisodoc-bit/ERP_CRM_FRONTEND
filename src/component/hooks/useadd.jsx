import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postAdminOrgDetails,
  updateOnlyOrgDetails,
  Send_Contract_Mail,

  nOtes,
  Meetings_,
  msg,
  calls,
  proposal,
  ClientCredit,
  Createadmin,
  Createstaff,
  getOfficeHoliday,
  postOfficeHoliday,
} from "../../api/role.api";

export const UseAdd = ({ isEnabled = false } = {}) => {
  const queryClient = useQueryClient();

  const addOrgLeadDetails = useMutation({
    mutationFn: postAdminOrgDetails,
    onSuccess: (data) => {
      queryClient.setQueryData(["addOrgLead"], data.user);
    },
  });

  const Office_uploadHoliday = useQuery({
    queryKey: ["OfficeUploadHoliday"],
    queryFn: getOfficeHoliday,
    retry: false,
    enabled: isEnabled,
  });

  const saveOfficeHoliday = useMutation({
    mutationFn: postOfficeHoliday,
    onSuccess: (data) => {
      queryClient.setQueryData(["OfficeUploadHoliday"], data);
    },
  });
  const update_Only_OrgDetails = useMutation({
    mutationFn: updateOnlyOrgDetails,
    onSuccess: (data) => {
      queryClient.setQueryData(["update_org_details_only"], data);
    },
  });
  const SendTO_Contract = useMutation({
    mutationFn: Send_Contract_Mail,
    onSuccess: (data) => {
      queryClient.setQueryData(["uploadContract"], data.user);
      // console.log("Data after  mutation:", data);
    },
  });

  const nOtes_ = useMutation({
    mutationFn: nOtes,
    onSuccess: (data) => {
      queryClient.setQueryData(["nOtes"], data.user);
      // console.log("Data after  mutation:", data);
    },
  });

  const Meetings = useMutation({
    mutationFn: Meetings_,
    onSuccess: (data) => {
      queryClient.setQueryData(["vMeetKC"], data.user);
      // console.log("vMeetKC:", data);
    },
  });
  const calls_ = useMutation({
    mutationFn: calls,
    onSuccess: (data) => {
      queryClient.setQueryData(["vMeetKC"], data.user);
      // console.log("vMeetKC:", data);
    },
  });
  const msg_ = useMutation({
    mutationFn: msg,
    onSuccess: (data) => {
      queryClient.setQueryData(["messages"], data.user);
      // console.log("vMeetKC:", data);
    },
  });
  const proposal_ = useMutation({
    mutationFn: proposal,
    onSuccess: (data) => {
      console.log("proposal:", data);
      queryClient.setQueryData(["proposal"], data);
    },
  });
  const ClientCredit_ = useMutation({
    mutationFn: ClientCredit,
    onSuccess: (data) => {
      queryClient.setQueryData(["proposal"], data.user);
      // console.log("proposal:", data);
    },
  });
  const Createadmin_ = useMutation({
    mutationFn: Createadmin,
    onSuccess: (data) => {
      queryClient.setQueryData(["Createadmin"], data.user);
      // console.log("proposal:", data);
    },
  });
  const Createstaff_ = useMutation({
    mutationFn: Createstaff,
    onSuccess: (data) => {
      queryClient.setQueryData(["createstaff"], data.user);
      // console.log("proposal:", data);
    },
  });
  return {
    addOrgLeadDetails,
    // addMsg_call_sch,
    // add_sch_Only,
    update_Only_OrgDetails,
    SendTO_Contract,

    nOtes_,
    Meetings,
    calls_,
    msg_,
    // accurate Meetings, msg_, calls_ ,nOtes_
    proposal_,
    ClientCredit_,
    Createadmin_,
    Createstaff_,
    Office_uploadHoliday,
    saveOfficeHoliday,
  };
};
