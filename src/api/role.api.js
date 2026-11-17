import api from "./axios";
const token = sessionStorage.getItem("Token");
// console.log("Token from role.api.js:", typeof token);

export const getAdminDashboard = async () => {
  const res = await api.get("/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getSuperAdminDashboard = async () => {
  const res = await api.get("/super_admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getClientDashboard = async () => {
  const res = await api.get("/client");
  return res.data;
};
export const getStaffDashboard = async () => {
  const res = await api.get("/staff");
  return res.data;
};

export const GetAllOrganizationDetails = async () => {
  const res = await api.get("/staff/sales/getSalesData");
  return res.data;
};

export const EditSalesLead = async ({ params, payload }) => {
  const res = await api.patch(`/staff/sales/edit/${params.id}`, payload);
  return res.data;
};

export const DeleteSalesLead = async ({ params }) => {
  const res = await api.delete(`/staff/sales/delete/${params.id}`);
  return res.data;
};

export const getOfficeHoliday = async () => {
  const res = await api.get("/admin/officeholiday");
  return res.data;
};

export const postOfficeHoliday = async (payload) => {
  const res = await api.post("/admin/officeholiday", payload);
  return res.data;
};

export const postAdminOrgDetails = async (orgLeadDetails) => {
  const res = await api.post("/staff/sales/orgdetails", orgLeadDetails);
  return res.data;
};
export const getDetails = async (payload) => {
  const res = await api.get("staff/sales/getdetails", {
    params: payload,
  });
  // console.log('from api hub', res.data)
  return res.data;
};
export const Get_Org_Details_Only = async ({ parms }) => {
  const { _id } = parms;
  // console.log("Parms from ", parms)
  const res = await api.get(`/staff/sales/orgdetails?_id=${_id}`);
  // console.log('Response from api', res.data)
  return res.data;
};

export const updateOnlyOrgDetails = async ({ parms, payload }) => {
  const { _id, organizationId } = parms;
  const res = await api.patch(
    `/staff/sales/update_org_details_only/${_id}/${organizationId}`,
    payload,
  );
  return res.data;
};

// export const Delete_Stage1_ScheduleOnly = async ({ params }) => {
//   console.log("Payload for delete_stage1_scheduleOnly:", params);
//   const { MainID, DetailsID, Stage1, ScheduleID } = params;
//   const res = await api.patch(`staff/sales/delete_stage1_scheduleOnly/${MainID}/${DetailsID}/${Stage1}/${ScheduleID}`, {});
//   console.log('Response from delete_stage1_scheduleOnly API:', res.data);
//   return res.data;
// }

export const getOnlyStage1Data = async ({ params }) => {
  console.log("Params for onlyStage1 API:", params);

  const { _id } = params;

  const res = await api.get(`staff/sales/onlyStage1/${_id}`);

  return res.data;
};

export const getOnlyStage2Data = async ({ params }) => {
  const { _id } = params;
  const res = await api.get(`staff/sales/onlyStage2/${_id}`);
  return res.data;
};

export const getOnlyStage3Data = async ({ params }) => {
  const { _id } = params;
  const res = await api.get(`staff/sales/onlyStage3/${_id}`);
  return res.data;
};

// onlyStage1
// onlyStage2
// onlyStage3

//  new // new // new // new // new
export const nOtes = async ({ payload, parms }) => {
  const { MainID } = parms;
  const res = await api.patch(`/staff/sales/nOtes/${MainID}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// vMeetKC
export const Meetings_ = async ({ payload, parms }) => {
  // console.log("parms for Meetings_", parms)
  const { MainID } = parms;
  const res = await api.patch(`/staff/sales/vMeetKC/${MainID}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const EditMeeting = async ({ payload, parms }) => {
  const { MainID, id } = parms;
  const res = await api.patch(
    `/staff/sales/editMeet/${MainID}/${id}`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
};

export const DeleteMeetings_ = async ({ parms }) => {
  // console.log("parms for Meetings_", parms)
  const { MainID, id } = parms;
  const res = await api.patch(`/staff/sales/deleteMeet/${MainID}/${id}`);
  return res.data;
};
// deleteMeet/:MainID/:id
// /deleteMeet/:MainID/:id
export const getActivities = async ({ parms }) => {
  // console.log("parms for getActivitiess", parms)
  const { MainID } = parms;
  const res = await api.get(`/staff/sales/notes/${MainID}`);
  return res.data;
};

// /editNote/:MainID/:id
export const editNote = async ({ payload, parms }) => {
  console.log("parms for getActivitiess", parms);
  const { MainID, id } = parms;
  const res = await api.patch(
    `/staff/sales/editNote/${MainID}/${id}`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data;
};

export const deleteNote = async ({ parms }) => {
  // console.log("parms for getActivitiess", parms)
  const { MainID, id } = parms;
  const res = await api.patch(`/staff/sales/deleteNote/${MainID}/${id}`);

  return res.data;
};

export const calls = async ({ payload, parms }) => {
  console.log("parms for getActivitiess", parms);
  const { MainID } = parms;
  const res = await api.patch(`/staff/sales/cAlls/${MainID}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
export const Editcalls = async ({ payload, parms }) => {
  // console.log("parms for getActivitiess", payload)
  const { MainID, id } = parms;
  const res = await api.patch(
    `/staff/sales/editCall/${MainID}/${id}`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
};

// /editCall/:MainID/:id
export const deletecalls = async ({ parms }) => {
  // console.log("parms for getActivitiess", parms)
  const { MainID, id } = parms;
  const res = await api.patch(`/staff/sales/deleteCall/${MainID}/${id}`);
  return res.data;
};

export const msg = async ({ payload, parms }) => {
  console.log("parms for getActivitiess", parms);
  const { MainID } = parms;
  const res = await api.patch(`/staff/sales/messages/${MainID}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const Editmsg = async ({ payload, parms }) => {
  // console.log("parms for getActivitiess", parms)
  const { MainID, id } = parms;
  const res = await api.patch(`/staff/sales/editMsg/${MainID}/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deletmsg = async ({ parms }) => {
  // console.log("parms for getActivitiess", parms)
  const { MainID, id, type } = parms;
  const res = await api.patch(
    `/staff/sales/deleteMsg/${MainID}/${id}?type=${type}`,
  );
  return res.data;
};

export const proposal = async ({ payload, parms }) => {
  // console.log("parms for proposal", parms)
  const { MainID } = parms;
  const res = await api.patch(`/staff/sales/proposal/${MainID}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
// may be not needed
// ============================

export const Getproposal = async ({ parms }) => {
  // console.log("parms for proposal", parms)
  const { MainID } = parms;
  const res = await api.patch(`/staff/sales/getproposal/${MainID}`);
  return res.data;
};

export const Updateproposal = async ({ payload, parms }) => {
  // console.log("parms for proposal", parms)
  const { MainID, id } = parms;
  const res = await api.patch(
    `/staff/sales/updateproposal/${MainIDb}/${id}`,
    payload,
  );
  return res.data;
};

export const Deleteproposal = async ({ payload, parms }) => {
  // console.log("parms for proposal", parms)
  const { MainID, id } = parms;
  const res = await api.patch(`/staff/sales/deleteproposal/${MainID}/${id}`);
  return res.data;
};

// =====================================================================================
export const ClientCredit = async ({ payload }) => {
  // console.log("staff/sales/clientCredit", payload)
  const res = await api.post(`/staff/sales/clientCredit`, payload);
  return res.data;
};
export const getLocalStorageFiles = async () => {
  // console.log("/staff/sales/getFiles")
  const res = await api.get(`/staff/sales/getFiles`);
  return res.data;
};

export const Send_Contract_Mail = async ({ params, payload }) => {
  // console.log("Payload Contract :", payload, params);
  const { MainID } = params;
  const res = await api.patch(`staff/sales/uploadContract/${MainID}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  // console.log('Response from  API:', res.data);
  return res.data;
};

// export const Send_Proposal_Mail = async ({ params, payload }) => {
//   // console.log("Payload Proposal :", payload, params);
//   const { MainID } = params;
//   const res = await api.patch(`staff/sales/uploadProposal/${MainID}`, payload, {
//     headers: {
//       "Content-Type": "multipart/form-data"
//     }
//   });
//   // console.log('Response from  API:', res.data);
//   return res.data;
// }

// /uploadContract/:MainID"

// proposal
// sales/clientCredit
//  Crete credential admin
export const Createadmin = async ({ payload }) => {
  // console.log("super/Credit/admin:", payload);
  const res = await api.post(`super_admin/createbranch`, payload);
  // console.log('Response from  API:', res.data);
  return res.data;
};
export const getAllBranch = async () => {
  const res = await api.get(`super_admin/getallbranches`);
  // console.log('Response from  API:', res.data);
  return res.data;
};

export const EditBranchStatus = async ({ params, payload, role }) => {
  const res = await api.patch(`super_admin/branch/status/${params.id}`, {
    ...payload,
    targetRole: role,
  });
  return res.data;
};
export const EditBranch = async ({ params, payload, targetRole }) => {
  const res = await api.patch(`super_admin/branch/${params.id}`, {
    ...payload,
    targetRole,
  });
  return res.data;
};
export const EditAdmin = async ({ params, payload }) => {
  const res = await api.patch(`super_admin/credit/edit/${params.id}`, payload);
  return res.data;
};

export const SendBranchCredit = async ({ params, role }) => {
  const res = await api.patch(`super_admin/branch/sendCredit/${params.id}`, {
    targetRole: role,
  });
  return res.data;
};

export const DeleteBranch = async ({ id, role }) => {
  const res = await api.delete(`super_admin/deletebranch/${id}`, {
    data: { targetRole: role },
  });
  return res.data;
};

export const Deleteadmin = async (payload) => {
  const { ids } = payload;
  // console.log("super/Credit/deleteadmin :", ids);
  const res = await api.delete(`super_admin/credit/deleteadmin`, {
    data: { ids },
  });
  // console.log('Response from  API:', res.data);
  return res.data;
};

export const getAdminUserById = async (id) => {
  const res = await api.get(`super_admin/credit/${id}`);
  return res.data;
};
export const EditStatus = async ({ params, payload }) => {
  const { id } = params;
  // console.log(`super_admin/credit/editStatus/${id}`, payload);
  const res = await api.patch(`super_admin/credit/editStatus/${id}`, payload);

  // console.log('Response from  API:', res.data);
  return res.data;
};
export const SendCredit = async ({ params }) => {
  const { id } = params;
  // console.log("super_admin/credit/sendCredit :", params);
  const res = await api.patch(`super_admin/credit/sendCredit/${id}`);
  // console.log('Response from  API:', res.data);
  return res.data;
};

//
export const Createstaff = async ({ payload }) => {
  // console.log("super/Credit/admin:", payload);
  const res = await api.post(`admin/credit/createstaff`, payload);
  // console.log('Response from  API:', res.data);
  return res.data;
};
export const getStaff = async () => {
  const res = await api.get(`admin/recruitment`);
  // console.log('Response from  API:', res.data);
  return res.data;
};
export const DeleteStaff = async ({ params }) => {
  const { ids, roles } = params;
  const res = await api.delete(`admin/credit/deletestaff`, {
    data: { ids, roles },
  });
  // console.log('Response from  API:', res.data);
  return res.data;
};
export const EditStatus_admin = async ({ params, payload }) => {
  const { id } = params;
  // console.log(`super_admin/credit/editStatus/${id}`, payload);
  const res = await api.patch(`admin/credit/editStatus/${id}`, payload);
  // console.log('Response from  API:', res.data);
  return res.data;
};
export const getStaffById = async ({ params }) => {
  const res = await api.get(`admin/credit/getCredit/${params.id}`, {
    params: params.role ? { role: params.role } : undefined,
  });
  return res.data;
};
export const EditStaff = async ({ params, payload }) => {
  const res = await api.patch(`admin/credit/edit/${params.id}`, payload);
  return res.data;
};
export const SendStaffPasswordReset = async ({ params }) => {
  const res = await api.patch(`admin/credit/sendCredit/${params.id}`);
  return res.data;
};

// get users
export const getUserCredit = async () => {
  const res = await api.get(`super_admin/credit/getCredit`);
  // console.log('credit/getCredit:', res.data);
  return res.data;
};
// super_admin/credit/getCredit
// recruitment
export const getStaffCredit = async () => {
  const res = await api.get(`admin/credit/getCredit`);
  console.log("credit/getCredit:", res.data);
  // console.log('credit/getCredit:', res.data);
  return res.data;
};

export const getAllRecruitment = async () => {
  const res = await api.get(`super_admin/recruitment`);
  // console.log('credit/getCredit:', res.data);
  return res.data;
};

// ==========================================================================================
export const getEachRecruitmentDetails = async ({ params }) => {
  const { id } = params;
  const res = await api.get(`/admin/schedule/getRoleOnly/${id}`);
  return res.data;
};

export const GETEACHRECRUITMENTDETAILS = async ({ params }) => {
  const { id } = params;
  const res = await api.get(`/staff/schedule/getRoleOnly/${id}`);
  return res.data;
};

export const getcompanyOptions = async () => {
  const res = await api.get("/admin/schedule/getcompanyOptions");
  return res.data;
};

export const GETCOMPANYOPTIONS = async () => {
  const res = await api.get(`/staff/schedule/getcompanyOptions`);
  return res.data;
};

export const _GET_COMPANY_OPTIONS_ = async ({ params }) => {
  const { id } = params;
  const res = await api.get(`/super_admin/schedule/getcompanyOptions`);
  return res.data;
};
// ===================================
export const uploadOfficeHoliday = async ({ payload }) => {
  const res = await api.post(`/admin/officeholiday`, payload);
  return res.data;
};

export const scheduleUsers = async () => {
  const res = await api.get(`/admin/schedule/users`);
  return res.data;
};

export const GetMeDetails = async ({ params }) => {
  const { id } = params;

  const res = await api.get(`/staff/team/getMeDetails/${id}`);

  return res.data;
};
