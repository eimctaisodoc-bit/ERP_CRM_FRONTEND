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
  // getAllRecruitment,
  getAllBranch,
  getStaff,
  getStaffById,
  getcompanyOptions,
  getEachRecruitmentDetails,
  GETEACHRECRUITMENTDETAILS,
  GETCOMPANYOPTIONS,
  scheduleUsers,
  GetAllOrganizationDetails,
  getCROSales,
  GetMeDetails,
  GetMeDetails_Admin,
  GetMeDetails_staff,
  getInstallmentsTerms,
  // DMS
  getDMSFiles,
  // clients
  getAllClients,
  // note
  S_GetNote,
  A_GetNote,
  C_GetNote,
  ST_GetNote,
  // all emp for super
  S_GetAllEmployees,
  ByHR_Recruitment_GetAllEmployees

} from "../../api/role.api";
import { userById } from "../../api/auth.api";

export const useGet = ({
  loadCompanyOptions = false,
  currentUser,
  tag,
  isAuthLoading = true,
  locationDetails,
  recruitmentDetailsId,
  staffRecruitmentDetailsId,
  // note

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


  const GetMeDetails_Admin_ = useMutation({
    mutationFn: GetMeDetails_Admin,

    onSuccess: (data, params) => {
      queryClient.setQueryData(["notes", params?.MainID], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });

  const GetMeDetails_staff_ = useMutation({
    mutationFn: GetMeDetails_staff,

    onSuccess: (data, params) => {
      queryClient.setQueryData(["meDetails_staff", params?.MainID], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
  });
  const S_GetNote_ = useMutation({
    mutationFn: S_GetNote,
  });

  const A_GetNote_ = useMutation({ mutationFn: A_GetNote });

  const C_GetNote_ = useMutation({ mutationFn: C_GetNote });


  const ST_GetNote_ = useMutation({ mutationFn: ST_GetNote ,
    onSuccess: (data, params) => {
      console.log("ST_GetNote_ data", data);
    }
  });


  const getDMSFiles_ = useQuery({
    queryKey: ["getDMSFiles"],
    queryFn: getDMSFiles,
    retry: false,
    enabled: !isAuthLoading && currentUser?.role === "super_admin"  && tag === "super_dms",
    refetchOnWindowFocus: false
  });

  const S_GetAllEmployees_ = useQuery({
    queryKey: ["getallEmployees"],
    queryFn: S_GetAllEmployees,
    retry: false,
    enabled: !isAuthLoading && currentUser?.role === "super_admin",
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
    mutationFn: (params) => getStaffCredit(params),
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
  // const getAllRecruitment_ = useMutation({
  //   mutationFn: getAllRecruitment,
  //   onSuccess: (data, params) => {
  //     queryClient.setQueryData(["getAllRecruitment"], data);
  //   },
  //   onError: (err) => {
  //     // console.log("notes error", err);
  //   },
  // });
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
    mutationFn: (params) => getStaff(params),
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

  const provinceName = String(locationDetails?.provinceName || "").trim();
  const districtName = String(locationDetails?.districtName || "").trim();
  const localLevelName = String(locationDetails?.localLevelName || "").trim();
  const getCROSales_ = useQuery({
    queryKey: [
      "getCROSales",
      provinceName,
      districtName,
      localLevelName,
    ],
    queryFn: () =>
      getCROSales({ provinceName, districtName, localLevelName }),
    enabled:
      !isAuthLoading &&
      currentUser?.role === "staff" &&
      Boolean(provinceName && districtName && localLevelName),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const GetAllOrganizationDetails_ = useMutation({
    mutationFn: (params) => GetAllOrganizationDetails(params),
    retry: false,
  });

  const getInstallmentsTerms_ = useMutation({
    mutationFn: getInstallmentsTerms,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["getInstallmentsTerms", variables?.params?.MainID],
        data
      );
    },
  });


  const getAllClients_ = useMutation({
    mutationFn: (params) => {
      return queryClient.fetchQuery({
        queryKey: ["getAllClients", params?.MainID],
        queryFn: () => getAllClients(params),
        staleTime: 0,
      });
    }
  });


  const ByHR_Recruitment_GetAllEmployees_ = useMutation({
    mutationFn: (params) => ByHR_Recruitment_GetAllEmployees(params),
    onSuccess: (data, params) => {
      queryClient.setQueryData(["ByHR_Recruitment_GetAllEmployees"], data);
    },
    onError: (err) => {
      // console.log("notes error", err);
    },
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
    // getAllRecruitment_,
    getAllBranch_,
    getStaff_,
    getStaffById_,
    getEachRecruitmentDetails_,
    GETEACHRECRUITMENTDETAILS_,
    getCompanyOptions_,
    GETCOMPANYOPTIONS_,
    getCROSales_,
    ScheduleUsers_,
    GetMeDetails_,
    GetMeDetails_Admin_,
    GetMeDetails_staff_,
    getInstallmentsTerms_,
    // DMS
    getDMSFiles_,
    // clients
    getAllClients_,
    // note
    S_GetNote_,
    A_GetNote_,
  C_GetNote_,
  ST_GetNote_,
    // FOR SUPER
    S_GetAllEmployees_,
    ByHR_Recruitment_GetAllEmployees_

  };
};
