import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  UploadCloud,
  Check,
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  UserPlus,
  ChevronRight,
  Briefcase,
  Plus
} from "lucide-react";
import { ClientEmp_form } from "../../../../data/data.jsx"; 
import Select from "react-select";

// ==============================
// OPTIONAL FIELD NAMES & MOCKS
// ==============================
const OPTIONAL_FIELDS = new Set(["officeEmail", "officeMobile", "middleName"]);

const isOptionalField = (field) => {
  // If field has explicit required flag, use that
  if (field.hasOwnProperty("required")) {
    return !field.required;
  }
  // Otherwise, file and repeatable types are optional by default
  return field.type === "file" || field.type === "repeatable" || OPTIONAL_FIELDS.has(field.name);
};

const MOCK_DISTRICTS = {
  koshi: ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Morang", "Sunsari"],
  madhesh: ["Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Sarlahi"],
  bagmati: ["Bhaktapur", "Kathmandu", "Lalitpur", "Kavrepalanchok", "Chitwan"],
  gandaki: ["Gorkha", "Kaski", "Lamjung", "Syangja", "Tanahun"],
  lumbini: ["Arghakhanchi", "Banke", "Bardiya", "Dang", "Rupandehi"],
  karnali: ["Dailekh", "Dolpa", "Jumla", "Surkhet", "Mugu"],
  sudurpashchim: ["Achham", "Baitadi", "Dadeldhura", "Darchula", "Kailali"]
};

const DEPARTMENT_JOB_MAP = {
  "Corporate HR": ["HR Officer"],
  "Corporate Finance": ["Finance Officer"],
  "Corporate CRO": ["CRO"],
  "Corporate Reception": ["Receptionist"],
  "Corporate Document Control": ["Document Controller"],
  "Corporate ERP & IT": ["ERP Developer", "ERP Maintenance"],
  "Consultancy": ["Consultant"],
  "Consultancy ": ["Consultant "]
};

export const customSelectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    minHeight: "52px",
    border: hasError ? "1px solid #ef4444" : state.isFocused ? "1px solid #f59e0b" : "1px solid #e2e8f0",
    borderRadius: "0.75rem",
    backgroundColor: "#ffffff",
    boxShadow: state.isFocused ? (hasError ? "0 0 0 4px rgba(239, 68, 68, 0.1)" : "0 0 0 4px rgba(245, 158, 11, 0.1)") : "none",
    "&:hover": { borderColor: hasError ? "#ef4444" : "#cbd5e1" },
    transition: "all 0.2s ease",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "6px",
    marginTop: "8px",
    zIndex: 9999,
    border: "1px solid #e2e8f0"
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#f59e0b" : state.isFocused ? "#fffbeb" : "transparent",
    color: state.isSelected ? "white" : "#334155",
    borderRadius: "0.5rem",
    marginBlock: "2px",
    cursor: "pointer",
    padding: "10px 14px",
    fontSize: "0.9rem",
    "&:active": { backgroundColor: "#fbbf24" },
  }),
});

const normalizeOptions = (options = []) =>
  options.map((item) => (typeof item === "string" ? { label: item.trim(), value: item.trim() } : item));

const calculateTenure = (start, end) => {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (endDate < startDate) return "Invalid Dates";

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }
  if (years === 0 && months === 0) return "Less than 1 Mo";
  
  const res = [];
  if (years > 0) res.push(`${years} Yr${years > 1 ? 's' : ''}`);
  if (months > 0) res.push(`${months} Mo${months > 1 ? 's' : ''}`);
  
  return res.join(", ");
};

const RecruitmentForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showMarriageForm, setShowMarriageForm] = useState(false);

  // Map of useRef for dynamic scrolling to fields with errors
  const fieldRefs = useRef({});

  // Console log _data on update
  useEffect(() => {
    console.log("_data", formData);
  }, [formData]);

  const allFields = ClientEmp_form.flatMap((s) => s.fields);
  const findField = (name) => allFields.find((f) => f.name === name);

  const getVisibleFieldsForStep = (stepIdx, currentData) => {
    let currentFields = [...ClientEmp_form[stepIdx].fields];
    
    if (ClientEmp_form[stepIdx].title === "Employment" && currentData.officeType === 'Branch Office') {
      if (!currentFields.find(f => f.name === 'status')) {
        const officeTypeIndex = currentFields.findIndex(f => f.name === 'officeType');
        currentFields.splice(officeTypeIndex + 1, 0, {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: ['Staff', 'Admin']
        });
      }
    }

    return currentFields.filter(f => {
      // Strictly remove Total Years of Experience
      if (f.name === 'totalExperience' || (f.label && f.label.includes('Total Years of Experience'))) return false;
      
      if (f.name === 'office' || f.name === 'reportingManager') return false;
      if (f.name === 'province' && currentData.officeType !== 'Branch Office') return false;
      if (f.name === 'district' && (currentData.officeType !== 'Branch Office' || !currentData.province)) return false;
      if (f.condition) {
        return currentData[f.condition.field] === f.condition.value;
      }
      return true;
    });
  };

  const getVisibleFields = () => getVisibleFieldsForStep(step - 1, formData);

  const validateField = (field, value) => {
    const optional = isOptionalField(field);
    
    // Handle repeatable fields
    if (field.type === "repeatable") {
      const rows = value || [];
      if (!optional && rows.length === 0) {
        return "At least one entry is required";
      }
      return "";
    }
    
    // Handle file fields
    if (field.type === "file") {
      if (!optional && (!value || value === "")) {
        return "This field is required";
      }
      return "";
    }
    
    // Handle other field types
    if (optional && (!value || value === "")) return "";
    if (!optional && (!value || value === "")) return "This field is required";

    const looksNumeric = field.type === "number" || field.type === "tel" || /mobile|phone|contact|number/i.test(field.name);
    if (looksNumeric && typeof value === "string" && value && !/^\d+$/.test(value)) return "Only numbers allowed";
    if (looksNumeric && field.type === "number" && value !== "" && (isNaN(value) || Number(value) < 0)) return "Please enter a valid number";

    const looksEmail = /email/i.test(field.name) || field.type === "email";
    if (looksEmail && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Invalid email address";

    if (typeof value === "string" && field.type !== "select" && field.type !== "radio" && !looksEmail && !looksNumeric && value.trim().length < 3) {
      return "Minimum 3 characters";
    }
    return "";
  };

  const validateMarriageFields = () => {
    const newErrors = {};
    let isValid = true;
    const marriageFields = [
      { name: "spouseName", label: "Spouse Name" },
      { name: "spouseOccupation", label: "Spouse Occupation" },
      { name: "spousePhone", label: "Spouse Phone" },
      { name: "numberOfChildren", label: "Number of Children" },
    ];

    marriageFields.forEach((field) => {
      const value = formData[field.name];
      if (!value || value === "") {
        newErrors[field.name] = "This field is required";
        isValid = false;
      } else if (field.name === "spousePhone" && !/^\d+$/.test(String(value).replace(/\D/g, ""))) {
        newErrors[field.name] = "Only numbers allowed";
        isValid = false;
      } else if (field.name === "numberOfChildren" && (isNaN(value) || Number(value) < 0)) {
        newErrors[field.name] = "Please enter a valid number";
        isValid = false;
      } else if ((field.name === "spouseName" || field.name === "spouseOccupation") && String(value).trim().length < 2) {
        newErrors[field.name] = "Minimum 2 characters";
        isValid = false;
      }
    });

    return { newErrors, isValid };
  };

  // Helper to scroll using useRef
  const scrollToFirstErrorField = (errorObj) => {
    const errorKeys = Object.keys(errorObj);
    if (errorKeys.length === 0) return;

    const firstErrorName = errorKeys[0];
    setTimeout(() => {
      const el = fieldRefs.current[firstErrorName];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const inputEl = el.querySelector("input, select, textarea");
        if (inputEl) inputEl.focus();
      }
    }, 150);
  };

  const handleNext = () => {
    const currentVisibleFields = getVisibleFields();
    const newErrors = {};
    let isValid = true;

    currentVisibleFields.forEach((field) => {
      if (field.type === "repeatable") {
        const rows = formData[field.name] || [];
        if (!isOptionalField(field) && rows.length === 0) {
          newErrors[field.name] = "At least one experience entry is required";
          isValid = false;
        }
      } else {
        const error = validateField(field, formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    });

    if (showMarriageForm) {
      const marriageValidation = validateMarriageFields();
      Object.assign(newErrors, marriageValidation.newErrors);
      if (!marriageValidation.isValid) isValid = false;
    }

    setErrors(newErrors);
    if (isValid) {
      setStep((prev) => prev + 1);
    } else {
      scrollToFirstErrorField(newErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    const field = findField(name);
    let val = files ? files[0] : value;

    const isNum = type === "tel" || type === "number" || /mobile|phone|contact|number/i.test(name);
    if (!files && isNum && typeof val === 'string') val = val.replace(/\D/g, "");

    const spouseFields = ["spouseName", "spouseOccupation", "spousePhone", "numberOfChildren"];

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      if (spouseFields.includes(name)) {
        const hasAnySpouseData = spouseFields.some((f) => updated[f] !== undefined && updated[f] !== "" && updated[f] !== null);
        if (hasAnySpouseData) {
          updated.maritalStatus = "Married";
        } else {
          updated.maritalStatus = "Single";
          setShowMarriageForm(false);
        }
      }
      return updated;
    });

    if (field || spouseFields.includes(name)) {
      setErrors((prev) => ({
        ...prev,
        [name]: field ? validateField(field, val) : (val ? "" : "This field is required"),
      }));
    }
  };

  const handleSelectChange = (opt, name) => {
    const val = opt ? opt.value : "";
    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      if (name === "officeType" && val !== "Branch Office") {
         updated.province = "";
         updated.district = "";
         updated.status = "";
      }
      if (name === "province") updated.district = "";
      if (name === "department") updated.jobPosition = "";
      
      if (name === "employmentType" && val === "Intern") {
        updated.experienceType = "fresher";
        updated.previousExperience = [];
      }
      return updated;
    });

    if (name === "maritalStatus") {
      if (val === "Married") {
        setShowMarriageForm(true);
      } else {
        setShowMarriageForm(false);
        setFormData((prev) => ({
          ...prev, spouseName: "", spouseOccupation: "", spousePhone: "", numberOfChildren: "",
        }));
        setErrors((prev) => ({
          ...prev, maritalStatus: "", spouseName: "", spouseOccupation: "", spousePhone: "", numberOfChildren: "",
        }));
      }
    }
  };

  // FINAL VALIDATION FOR ALL REQUIRED FIELDS
  const handleSubmit = () => {
    const allNewErrors = {};
    let isValid = true;
    let firstErrorStep = null;

    // Iterate through all steps in the form
    ClientEmp_form.forEach((stepItem, stepIdx) => {
      const stepFields = getVisibleFieldsForStep(stepIdx, formData);
      stepFields.forEach((field) => {
        if (field.type === "repeatable") {
          const rows = formData[field.name] || [];
          if (!isOptionalField(field) && rows.length === 0) {
            allNewErrors[field.name] = "At least one experience entry is required";
            isValid = false;
            if (!firstErrorStep) firstErrorStep = stepIdx + 1;
          } else if (rows.length > 0) {
            for (let r = 0; r < rows.length; r++) {
              const row = rows[r];
              const incomplete = field.fields.some(f => !row[f.name] || row[f.name].toString().trim() === "");
              if (incomplete) {
                allNewErrors[field.name] = "All experience grid fields are required";
                isValid = false;
                if (!firstErrorStep) firstErrorStep = stepIdx + 1;
                break;
              }
            }
          }
        } else {
          const error = validateField(field, formData[field.name]);
          if (error) {
            allNewErrors[field.name] = error;
            isValid = false;
            if (!firstErrorStep) firstErrorStep = stepIdx + 1;
          }
        }
      });
    });

    // Check spouse details if married
    if (showMarriageForm || formData.maritalStatus === "Married") {
      const marriageValidation = validateMarriageFields();
      if (!marriageValidation.isValid) {
        Object.assign(allNewErrors, marriageValidation.newErrors);
        isValid = false;
      }
    }

    setErrors(allNewErrors);

    if (!isValid) {
      // Jump to step with error, then scroll to input via useRef
      if (firstErrorStep) {
        setStep(firstErrorStep);
      }
      scrollToFirstErrorField(allNewErrors);
    } else {
      console.log("Final Data Submitted Successfully:", formData);
      alert("Application Submitted Successfully!");
    }
  };

  const visibleFields = getVisibleFields();

  return (
    <div className="fixed inset-0 bg-slate-400/50 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-7xl h-[95vh] md:h-[85vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        <button onClick={onClose} className="absolute top-5 right-5 z-[60] cursor-pointer p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-all">
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Sidebar */}
        <div className="hidden md:flex w-[340px] lg:w-[400px] bg-slate-900 flex-col shrink-0 overflow-y-auto relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20"></div>
             <div className="absolute bottom-10 -right-10 w-48 h-48 bg-orange-600 rounded-full mix-blend-multiply filter blur-[60px] opacity-20"></div>
          </div>
          <div className="p-10 relative z-10 flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center">
                <ClipboardList size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">Recruitment</h1>
                <p className="text-slate-400 text-sm mt-1">Employee Onboarding</p>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Progress Setup</h3>
              <div className="space-y-8">
                {ClientEmp_form.map((s, i) => {
                  const isDone = i < step - 1;
                  const isCurrent = i === step - 1;
                  return (
                    <div key={i} className="flex items-start gap-5 relative">
                      {i !== ClientEmp_form.length - 1 && (
                        <div className={`absolute top-10 left-[19px] w-[2px] h-full -ml-[1px] ${isDone ? 'bg-amber-500' : 'bg-slate-800'}`} />
                      )}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 relative z-10 transition-all duration-300 ${
                        isDone ? 'bg-amber-500 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : isCurrent ? 'bg-slate-800 border-amber-400 text-amber-400 shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-600'
                      }`}>
                        {isDone ? <Check size={18} strokeWidth={3} /> : <span className="font-bold text-sm">{i + 1}</span>}
                      </div>
                      <div className="pt-2.5">
                        <p className={`text-sm font-bold tracking-wide transition-colors ${isCurrent ? 'text-white' : isDone ? 'text-slate-300' : 'text-slate-500'}`}>
                          {s.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 p-6 text-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                <ClipboardList size={20} />
             </div>
             <div>
               <h1 className="text-lg font-bold">Recruitment</h1>
               <p className="text-amber-400 text-xs mt-0.5">Step {step} of {ClientEmp_form.length}</p>
             </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 flex flex-col bg-slate-50/50 relative h-full">
          <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {ClientEmp_form[step - 1].fullTitle || ClientEmp_form[step - 1].title}
                </h2>
                <p className="text-slate-500 mt-2 text-sm md:text-base">
                  Please fill out the required information below to proceed.
                </p>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
                  {visibleFields.map((f, i) => {
                    let dynamicOptions = f.options || f.provinces || [];
                    
                    if (f.name === "district" && formData.province) {
                      dynamicOptions = MOCK_DISTRICTS[formData.province] || [];
                    }
                    if (f.name === "jobPosition") {
                      const selectedDept = formData.department ? formData.department.trim() : "";
                      dynamicOptions = DEPARTMENT_JOB_MAP[formData.department] || DEPARTMENT_JOB_MAP[selectedDept] || [];
                    }

                    const disableCondition = f.name === "experienceType" && formData.employmentType === "Intern";
                    const isFullWidth = f.type === "file" || f.type === "repeatable" || f.type === "radio";

                    return (
                      <div 
                        key={i} 
                        ref={(el) => (fieldRefs.current[f.name] = el)} 
                        className={isFullWidth ? "lg:col-span-2" : ""}
                      >
                        {f.type === "select" ? (
                          <SelectField
                            label={f.label}
                            name={f.name}
                            value={formData[f.name]}
                            onChange={handleSelectChange}
                            options={dynamicOptions}
                            error={errors[f.name]}
                            required={!isOptionalField(f)}
                          />
                        ) : f.type === "file" ? (
                          <FileUploadField
                            label={f.label}
                            name={f.name}
                            file={formData[f.name]}
                            onChange={handleChange}
                          />
                        ) : f.type === "radio" ? (
                          <RadioField 
                            label={f.label}
                            name={f.name}
                            value={formData[f.name]}
                            options={f.options}
                            onChange={handleChange}
                            error={errors[f.name]}
                            disabled={disableCondition}
                            required={!isOptionalField(f)}
                          />
                        ) : f.type === "repeatable" ? (
                           <RepeatableField 
                             label={f.label} 
                             name={f.name}
                             fields={f.fields}
                             value={formData[f.name]}
                             onChange={handleChange}
                             error={errors[f.name]}
                           />
                        ) : (
                          <InputField
                            {...f}
                            value={formData[f.name]}
                            onChange={handleChange}
                            error={errors[f.name]}
                            required={!isOptionalField(f)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white border-t border-slate-200 px-6 md:px-12 lg:px-16 py-6 shrink-0 flex justify-between items-center shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((prev) => prev - 1)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95"}`}
            >
              <ArrowLeft size={18} /> Go Back
            </button>
            {step === ClientEmp_form.length ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                Submit Application <CheckCircle2 size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                Next Step <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
      {showMarriageForm && (
        <MarriageDetailsForm formData={formData} onChange={handleChange} setFormData={setFormData} errors={errors} setShowMarriageForm={setShowMarriageForm} />
      )}
    </div>
  );
};

// ==============================
// COMPONENT FIELDS
// ==============================

const RepeatableField = ({ label, name, fields, value = [], onChange, error }) => {
  const rows = Array.isArray(value) && value.length > 0 ? value : [{}];

  const handleRowChange = (index, fieldName, val) => {
    const newRows = [...rows];
    if (!newRows[index]) newRows[index] = {};
    newRows[index][fieldName] = val;

    if (fieldName === 'startDate' || fieldName === 'endDate') {
      const start = fieldName === 'startDate' ? val : newRows[index].startDate;
      const end = fieldName === 'endDate' ? val : newRows[index].endDate;
      newRows[index].tenure = calculateTenure(start, end);
    }

    onChange({ target: { name, value: newRows } });
  };

  const addRow = () => onChange({ target: { name, value: [...rows, {}] } });
  const removeRow = (index) => onChange({ target: { name, value: rows.filter((_, i) => i !== index) } });

  return (
    <div className="space-y-4 lg:col-span-2">
      <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1 block">{label}</label>
      
      <div className="space-y-4">
        {rows.map((row, idx) => (
          <div key={idx} className="p-5 border border-slate-200 bg-white shadow-sm rounded-xl relative group">
            {rows.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeRow(idx)} 
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                title="Remove Experience"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {f.label} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type={f.type} 
                    value={row[f.name] || ""} 
                    readOnly={f.readOnly}
                    required
                    placeholder={`Enter ${f.label.toLowerCase()}`}
                    onChange={(e) => handleRowChange(idx, f.name, e.target.value)}
                    className="w-full py-2.5 px-3 rounded-lg border border-slate-200 outline-none text-sm font-medium focus:border-amber-500 read-only:bg-slate-50 read-only:text-slate-400 transition-all"
                  />
                </div>
              ))}
            </div>

            {row.tenure && row.tenure !== "Invalid Dates" && (
              <div className="mt-3 flex justify-end">
                <span 
                  className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 shadow-sm"
                  style={{ fontStyle: 'italic !important' }}
                >
                  Tenure: {row.tenure}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-red-500 text-xs mt-2 ml-1 font-medium">
          <AlertCircle size={14} /> <span>{error}</span>
        </div>
      )}

      <button 
        type="button" 
        onClick={addRow} 
        className="text-sm font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1.5 px-2 py-1 transition-colors"
      >
        <Plus size={16} strokeWidth={3} /> Add Another Organization
      </button>
    </div>
  );
};

const RadioField = ({ label, name, options, value, onChange, error, required, disabled }) => (
  <div className="space-y-3">
    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center justify-between">
      <span>{label} {required && <span className="text-red-500 ml-0.5">*</span>}</span>
      {disabled && <span className="text-amber-500 text-[11px] normal-case font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Auto-Locked (Intern)</span>}
    </label>
    <div className="flex gap-6">
      {options.map((opt) => (
        <label key={opt.value} className={`flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            disabled={disabled}
            className="w-4 h-4 text-amber-500 border-slate-300 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
        </label>
      ))}
    </div>
    {error && (
      <div className="flex items-center gap-1.5 text-red-500 text-xs mt-2 ml-1 font-medium">
        <AlertCircle size={14} /> <span>{error}</span>
      </div>
    )}
  </div>
);

const InputField = ({ label, name, type, value, onChange, error, required, disabled }) => (
  <div className="space-y-2 group">
    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center ml-1">
      <span>{label} {required && <span className="text-red-500 ml-0.5">*</span>}</span>
      {!required && <span className="text-[11px] text-slate-400 font-medium normal-case tracking-normal">Optional</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={`Enter ${label.toLowerCase()}`}
        className={`w-full py-3.5 px-4 rounded-xl border outline-none transition-all text-sm font-medium ${error ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-red-900 placeholder:text-red-300" : "border-slate-200 bg-white hover:border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-slate-800 placeholder:text-slate-400 shadow-sm"} disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {error && (
        <div className="flex items-center gap-1.5 text-red-500 text-xs mt-2 ml-1 animate-in slide-in-from-top-1 font-medium">
          <AlertCircle size={14} /><span>{error}</span>
        </div>
      )}
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error, required }) => {
  const normalizedOptions = normalizeOptions(options);
  return (
    <div className="space-y-2">
      <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1 block">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <Select
        name={name}
        options={normalizedOptions}
        value={normalizedOptions.find((opt) => opt.value === value) || null}
        onChange={(opt) => onChange(opt, name)}
        styles={customSelectStyles(!!error)}
        placeholder={`Select ${label.toLowerCase()}`}
      />
      {error && (
        <div className="flex items-center gap-1.5 text-red-500 text-xs mt-2 ml-1 font-medium">
          <AlertCircle size={14} /><span>{error}</span>
        </div>
      )}
    </div>
  );
};

const FileUploadField = ({ label, name, file, onChange }) => (
  <div className="space-y-2">
    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1 block">
      {label} <span className="font-medium text-slate-400 text-xs ml-1 normal-case tracking-normal">(Optional)</span>
    </label>
    <label className={`relative group cursor-pointer flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed rounded-2xl transition-all duration-300 ${file ? "bg-emerald-50/50 border-emerald-300 hover:bg-emerald-50" : "bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/20"}`}>
      <input type="file" name={name} onChange={onChange} className="hidden" />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-sm ${file ? "bg-emerald-100 text-emerald-600" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
        <UploadCloud size={24} />
      </div>
      <p className="text-base font-bold text-slate-700">{file ? "Document Uploaded Successfully" : "Click here to upload your document"}</p>
      <p className="text-sm font-medium text-slate-400 mt-2">{file ? file.name : "Supported formats: PDF, JPG or PNG (Max 5MB)"}</p>
      {file && <div className="absolute top-5 right-5 text-emerald-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle2 size={24} /></div>}
    </label>
  </div>
);

const MarriageDetailsForm = ({ formData, onChange, errors, setShowMarriageForm, setFormData }) => {
  const spouseFields = ["spouseName", "spouseOccupation", "spousePhone", "numberOfChildren"];
  const isFormValid = spouseFields.every(field => formData[field] && formData[field].toString().trim() !== "");
  const handleCloseModal = () => {
    setFormData(prev => ({ ...prev, maritalStatus: "Single", spouseName: "", spouseOccupation: "", spousePhone: "", numberOfChildren: "" }));
    setShowMarriageForm(false);
  };
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative bg-white w-full max-w-2xl overflow-y-auto p-10 rounded-3xl shadow-2xl border border-slate-100">
        <button onClick={handleCloseModal} className="absolute cursor-pointer top-6 right-6 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 p-2 rounded-full"><X size={20} /></button>
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><UserPlus size={24} /></div>
          <div><h3 className="text-2xl font-extrabold text-slate-800">Spouse Information</h3><p className="text-sm font-medium text-slate-500 mt-1">Please provide details for your secondary contact.</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          <InputField label="Spouse Name" name="spouseName" type="text" value={formData.spouseName} onChange={onChange} error={errors.spouseName} required />
          <InputField label="Spouse Occupation" name="spouseOccupation" type="text" value={formData.spouseOccupation} onChange={onChange} error={errors.spouseOccupation} required />
          <InputField label="Spouse Phone" name="spousePhone" type="tel" value={formData.spousePhone} onChange={onChange} error={errors.spousePhone} required />
          <InputField label="Number of Children" name="numberOfChildren" type="number" value={formData.numberOfChildren} onChange={onChange} error={errors.numberOfChildren} required />
        </div>
        <div className="flex justify-end gap-4 mt-10 pt-8 border-t border-slate-100">
          <button type="button" onClick={handleCloseModal} className="px-6 py-3 cursor-pointer rounded-xl text-slate-600 hover:bg-slate-100 transition-colors font-bold text-sm">Cancel</button>
          <button type="button" onClick={() => isFormValid && setShowMarriageForm(false)} disabled={!isFormValid} className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${isFormValid ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>Confirm Details<ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentForm;