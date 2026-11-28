import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
// import LoginCover from './component/loginCover';
import Dashboard from './pages/dashboard';
import LoginForm from './pages/loginForm';
import ProtectedRoute from './component/protectedroute';
// import Data_Table from './component/admin/setting/dataTable';

import { A_Setting } from './component/admin/setting/setting';
import { S_Setting } from './component/staff/Settingforms/setting';
import { useOnlineUsers } from './component/hooks/useOnlineuser';
// import { useSocketListeners } from './component/hooks/usesocketListenerhook';
import Admin_Report from './component/admin/report/report';
// import { SalesPipeline } from './component/staff/salespipeline/sales';
// import { RecruitmentTable } from './component/admin/admin_hr/admin_hR_/recruTable';
// import Admin_Hr_Page from './component/admin/hrPage';
import Staff_hr_pages from './component/staff/staff_hr_pages';
import { Admin_task_page } from './component/admin/task/admin_task_page';

import { Staff_task_page } from './component/staff/task/staff_task_page';
// 
// import { Admin_sales } from './component/admin/scheduling/cro/taskSchedule.jsx';

import { DprForm } from './component/staff/task/dprFrom';
import { I_Icon } from './component/i_icon';
import { Noti } from './component/staff/notification/notification';

import { S_A_Setting } from './component/super/setting/setting';
import { useAuth } from './component/hooks/useAuth';
import SkeletonPage from './component/skeleton';
import { ApiActivityIndicator } from './component/apiActivityIndicator';
import Chat from './component/admin/inbox/chat';
// import { Su_Folder_ } from './component/super/dms/folder_';
// import { A_Folder_ } from './component/admin/DMS/folder';
import { C_Folder_ } from './component/client/dms/folder';
import { Client_sales } from './component/client/sales/Salesindex';
import DPR_form from './component/staff/salespipeline/otherUsers/dprForms';
import ResetPassword from './component/pwReset/ResetPW';
import  S_Documents  from './component/super/dms/googlesfile';
// import { Sales } from './component/super/sales/sales';
import { Finance } from './component/super/finance/finance';

import { A_folder } from './component/admin/DMS/folder';
import { TaskSchedule } from './component/admin/scheduling/cro/taskSchedule';
import FolderView from './component/staff/dms/folder';
import BranchManagement from './component/super/branchManagement';
import EmpMAgmt from './component/admin/setting/EmpMAgmt';
import LeadMgmt from './component/staff/salespipeline/leadMgmt';
import LeadsPage from './component/staff/salespipeline/trial/lead-workspace/LeadsPage';
import ContragePage from './component/staff/salespipeline/ContractPage/contractPage';
import Super_Contract from './component/super/sales/contract/contract';
import NotesScheduler from './component/staff/note/note';
import { HrPage } from './component/admin/admin_hr/hrpage';
import { SU_HrPage } from './component/super/hr/hrpage';
// import { TestDrive } from './component/super/dms/test';
import S_NotesScheduler from './component/super/note/cNote';
import { HR_RecruitmentPage } from './component/staff/forHrRecruitment/hrRec';
import A_NotesScheduler from './component/admin/note/note';
import C_NotesScheduler from './component/client/note/note';
// OLD (replaced by LeadsPage): import LeadWorkspace from './component/staff/salespipeline/trial/lead-workspace/LeadWorkspace';
// import LeadsPage from './component/staff/salespipeline/trial/lead-workspace/LeadsPage';



function App() {
  const { userQuery } = useAuth();
  const { isLoading } = userQuery?.isLoading || {};

  return (
    <>
      <I_Icon />
      <ApiActivityIndicator />
      {
        isLoading && <div className="fixed inset-0 z-50 bg-white">
          <SkeletonPage />
        </div>
      }
      <Routes>
        <Route path='/' element={<LoginForm />} />
        <>
          <Route element={<ProtectedRoute roles={["super_admin"]} />}>
            <Route path="/super_admin" element={<Dashboard />}>
              <Route index element="" />
              <Route path="report" element={<Admin_Report />} />
              {/* <Route path="sales" element={<Sales />} /> */}
              <Route path="lead" element={<>this is lead</>} />
              <Route path="contract" element={<Super_Contract />} />
              <Route path='notes' element={<S_NotesScheduler />} />

              <Route path="finance" element={<Finance />} />
              <Route path="branch" element={<BranchManagement />} />
              <Route path="hr" element={<SU_HrPage />} />




              {/* <Route path="hr" element={<Admin_Hr_Page />} />
          <Route path="tasks" element={<Admin_task_page />} />
          <Route path="sales" element={<SalesPipeline/>}  />
          {/* <Route path="settings" element="hi" /> */}
              {/* <Route path="users" element={<Data_Table />} />  */}

              {/* <Route path="dms" element={<Su_Folder_ />} /> */}
              {/* <Route path="dms" element={<GoogleDriveFiles />} /> */}
              <Route path="dms" element={<S_Documents />} />

              <Route path="settings" element={<S_A_Setting />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<Dashboard />}>
              <Route index element="" />
              <Route path="report" element={<Admin_Report />} />
              {/* <Route path="hr" element={<Admin_Hr_Page />} /> */}
              {/* <Route path="hr" element={<HrPage />} /> */}
              <Route path="note" element={<A_NotesScheduler />} />
              <Route path="tasks" element={<Admin_task_page />} />
              <Route path="finance" element={<Finance />} />
              <Route path="settings" element={<A_Setting />} />
              <Route path="employee" element={<EmpMAgmt />} />
              <Route path="inbox" element={<Chat />} />
              <Route path="sales" element={<TaskSchedule />} />
              <Route path="lead" element={<LeadMgmt />} />
              <Route path="dms" element={<A_folder />} />


              {/* <Route path="settings" element="hi" /> */}
              {/* <Route path="users" element={<Data_Table />} /> */}
            </Route>
          </Route>


          <Route element={<ProtectedRoute roles={["staff"]} />}>
            <Route path="/staff" element={<Dashboard />}>
              <Route index path="report" element={<Admin_Report />} />
              <Route path="hr" element={<Staff_hr_pages />} />
              <Route path="tasks" element={<Staff_task_page />} />

              {/* <Route path="sales" element={<SalesPipeline />} /> */}
              <Route path="contract" element={<ContragePage />} />
              {/* ContragePage */}
              {/* OLD (replaced by LeadsPage): <Route path="lead" element={<LeadMgmt />} /> */}
              <Route path="lead" element={<LeadsPage />} />
              <Route path='note' element={<NotesScheduler />} />

              <Route path="dpr" element={<DPR_form />} />
              {/* <Route path="users" element={<Data_Table />} /> */}
              <Route path="dms" element={<FolderView />} />
              <Route path="settings" element={<S_Setting />} />
              {/* for jobposition hr */}
              <Route path="hr/recruitment" element={<HR_RecruitmentPage />} />


            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={["client"]} />}>
            <Route path="/client" element={<Dashboard />}>
              <Route index path="report" element={<Admin_Report />} />
              {/* <Route path="hr" element={<Client_Hr_Page />} /> */}
              {/* <Route path="users" element={<Data_Table />} /> */}
              <Route path="sales" element={<Client_sales />} />
              <Route path="note" element={<C_NotesScheduler />} />
              {/*  */}
              <Route path="dms" element={<C_Folder_ />} />
              <Route path="settings" element={<S_Setting />} />
            </Route>
          </Route>

        </>
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />


        {/* <Route path='/date' element={<MyCalendar />} /> */}
        <Route path='/task' element={<Admin_task_page />} />
        <Route path='/dpr' element={<DprForm />} />
        <Route path='/notification' element={<Noti />} />
        <Route path='/*' element={<Navigate to="/admin" replace />} />

      </Routes>
    </>

  );
}

export default App;
