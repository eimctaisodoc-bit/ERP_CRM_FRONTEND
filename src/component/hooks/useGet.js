import {
  useQueries,
  useQuery,
  useQueryClient,
  Mutation,
  useMutation,
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import api from "../../api/axios";
import {
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
  getAllBranch,
  getStaff,
  getStaffById,
  getcompanyOptions,
  getEachRecruitmentDetails,
  GETEACHRECRUITMENTDETAILS,
  GETCOMPANYOPTIONS,
  scheduleUsers,
  GetAllOrganizationDetails,
  GetMeDetails,
} from "../../api/role.api";
import { userById } from "../../api/auth.api";

export const useGet = ({
  loadCompanyOptions = false,
  currentUser,
  isAuthLoading = true,
  recruitmentDetailsId,
  staffRecruitmentDetailsId,
} = {}) => {
  const queryClient = useQueryClient();

  const GetMeDetails_ = useMutation({
    mutationFn: GetMeDetails,

    onSuccess: (data, params) => {
      queryClient.setQueryData(["notes", params?.MainID], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });

  const getCompanyOptions_ = useQuery({
    queryKey: ["companyOptions"],
    queryFn: getcompanyOptions,
    retry: false,
    enabled:
      loadCompanyOptions && !isAuthLoading && currentUser?.role === "admin",
  });
  const getEachRecruitmentDetails_ = useQuery({
    queryKey: ["getEachRecruitmentDetails", recruitmentDetailsId],
    queryFn: () =>
      getEachRecruitmentDetails({ params: { id: recruitmentDetailsId } }),
    retry: false,
    enabled: Boolean(recruitmentDetailsId),
  });
  const GETEACHRECRUITMENTDETAILS_ = useQuery({
    queryKey: ["GETEACHRECRUITMENTDETAILS", staffRecruitmentDetailsId],
    queryFn: () =>
      GETEACHRECRUITMENTDETAILS({ params: { id: staffRecruitmentDetailsId } }),
    retry: false,
    enabled: Boolean(staffRecruitmentDetailsId),
  });

  const ScheduleUsers_ = useQuery({
    queryKey: ["scheduleUsers"],
    queryFn: scheduleUsers,
    retry: false,
    enabled: !isAuthLoading && currentUser?.role === "admin",
  });

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
      // console.log("mutation error", err);
    },
  });
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
      queryClient.setQueryData(["get_org_details_only", params?._id], data);
    },

    onError: (err) => {
      // console.log("org details error", err);
    },
  });

  const GetOnlyStage1 = useMutation({
    mutationFn: (params) => {
      return queryClient.fetchQuery({
        queryKey: ["onlyStage1", params?.params?._id],

        queryFn: () => getOnlyStage1Data(params),

        staleTime: 5 * 60 * 1000,
      });
    },

    onSuccess: (data, params) => {
      queryClient.setQueryData(["onlyStage1", params?.params?._id], data);
    },

    onError: (err) => {
      // console.log("org details error", err);
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
      queryClient.setQueryData(["onlyStage2", params?._id], data);
    },

    onError: (err) => {
      // console.log("org details error", err);
    },
  });
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
      queryClient.setQueryData(["onlyStage3", params?._id], data);
    },

    onError: (err) => {
      // console.log("org details error", err);
    },
  });

  // new new new new new
  const getAllActivities_ = useMutation({
    mutationFn: getActivities,

    onSuccess: (data, params) => {
      queryClient.setQueryData(["notes", params?.MainID], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });
  const Getproposal_ = useMutation({
    // FIX: Directly call the API function. Removing fetchQuery and staleTime
    // guarantees it actually asks the database for fresh data instead of returning old cache.
    mutationFn: Getproposal,

    onSuccess: (data, params) => {
      // Update the React Query bucket instantly with the fresh array
      queryClient.setQueryData(["getproposal", params?.MainID], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });

  const getUserCredit_ = useMutation({
    mutationFn: getUserCredit,
    onSuccess: (data, params) => {
      queryClient.setQueryData(["getCredit"], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });
  const getStaffCredit_ = useMutation({
    mutationFn: getStaffCredit,
    onSuccess: (data, params) => {
      queryClient.setQueryData(["getCredit"], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });
  const getLocalStorageFiles_ = useMutation({
    mutationFn: getLocalStorageFiles,
    onSuccess: (data, params) => {
      queryClient.setQueryData(["getFiles"], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });
  const getAllRecruitment_ = useMutation({
    mutationFn: getAllRecruitment,
    onSuccess: (data, params) => {
      queryClient.setQueryData(["getAllRecruitment"], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });
  const getAllBranch_ = useMutation({
    mutationFn: getAllBranch,
    onSuccess: (data, params) => {
      queryClient.setQueryData(["getAllBranch"], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });
  const getStaff_ = useMutation({
    mutationFn: getStaff,
    onSuccess: (data, params) => {
      queryClient.setQueryData(["getStaff"], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });

  const getStaffById_ = useMutation({
    onSuccess: (data, params) => {
      queryClient.setQueryData(["getStaffById", params?.params?._id], data);
    },
    mutationFn: getStaffById,
  });

  const GETCOMPANYOPTIONS_ = useQuery({
    queryKey: ["GETCOMPANYOPTIONS"],
    queryFn: GETCOMPANYOPTIONS,
    enabled:
      loadCompanyOptions && !isAuthLoading && currentUser?.role === "staff",
    retry: false,
  });

  const GetAllOrganizationDetails_ = useQuery({
    queryKey: ["GetAllOrganizationDetails"],
    queryFn: GetAllOrganizationDetails,
    enabled: !isAuthLoading && currentUser?.role === "staff",
    retry: false,
  });

  return {
    getDetails_,
    getOnlyOrgDetails_,
    GetAllOrganizationDetails_,
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
    getAllBranch_,
    getStaff_,
    getStaffById_,
    getEachRecruitmentDetails_,
    GETEACHRECRUITMENTDETAILS_,
    getCompanyOptions_,
    GETCOMPANYOPTIONS_,
    ScheduleUsers_,
    GetMeDetails_,
  };
};
