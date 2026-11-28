# EIMCTA ERP – STAFF SETTINGS

## 1. PROFILE SETTINGS
**Purpose:** Allow staff to view their employment profile and edit permitted personal information.

### Editable Fields (Staff)
- Profile Photo
- Personal Phone Number
- Personal Email
- Current Address
- Permanent Address
- Emergency Contact Name
- Emergency Contact Number

### Read-Only Fields (HR Controlled)
- Full Name
- Employee ID
- Date of Birth
- Gender
- Department
- Designation
- Branch
- Joining Date
- Employment Type
- Employment Status

### Features
- View Staff Profile
- Edit Personal Information
- Update Profile Photo
- Submit Official Information Change Request
- View Profile Update History

---

## 2. SECURITY SETTINGS
**Purpose:** Allow staff to manage their own login security.

### Features
- Change Password
- Current Password Verification
- New Password
- Confirm New Password
- Password Strength Indicator
- Forgot Password
- Two-Factor Authentication
- View Last Login
- View Active Sessions / Devices
- Logout From Other Devices
- View Login History

### Security Rules
- Never display stored passwords.
- Require current password for password changes.
- Store passwords using secure hashing.
- Staff can manage only their own account.
- Maintain security activity logs.

---

## 3. DOCUMENT SETTINGS
**Purpose:** Allow staff to view employment documents imported from the Recruitment module.

### Document Sources
Documents are imported automatically during:

Candidate → Employee Conversion

### Document Categories
- Citizenship Certificate
- Passport-Size Photograph
- CV / Resume
- Academic Certificates
- Experience Certificates
- Previous Employment Documents
- Appointment Letter
- Employment Contract
- Other Recruitment Documents

### Staff Permissions
- View Documents
- Preview Documents
- Download Documents

### Restricted Actions
- Upload: Not Allowed
- Edit: Not Allowed
- Replace: Not Allowed
- Delete: Not Allowed

### HR / Admin Permissions
- Upload New Documents
- Replace Documents
- Update Document Metadata
- Delete Documents (with authorization)
- View Document History

---

## 4. DATABASE RELATIONSHIP

Recruitment
  ↓
Candidate Selection
  ↓
Employee Conversion
  ↓
Staff Profile
  ├── Profile Information
  ├── User Security Account
  └── Recruitment Documents

### Database Collections
- Staff
- User
- StaffDocuments
- SecurityLogs
- ProfileChangeRequests

### Important Rules
- Link employee records using staffId.
- Preserve original recruitment document references.
- Avoid unnecessary duplicate file storage.
- Staff can access only their own documents.
- Enforce permissions in the backend.

---

## 5. STAFF SETTINGS SIDEBAR

Staff
  └── Settings
       ├── Profile
       ├── Security
       └── Documents

**Access Policy:** Staff can edit permitted personal information, manage their own security, and view/download their recruitment documents. All official employment records remain HR controlled.