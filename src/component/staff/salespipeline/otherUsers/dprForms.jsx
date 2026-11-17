import React, { useState } from 'react';
import {
    Calendar, Hash, User,  Briefcase,
    Clock, MapPin, CheckSquare, PlusCircle,
    AlignLeft, ClipboardList, Trash2, Plus, X,
    FileText, Paperclip, MessageSquare
} from 'lucide-react';

const DPR_form = () => {
    // Initial Job Types
    const initialJobTypes = [
        'Certification', 'Audit', 'Training', 'Meeting',
        'Inspection', 'Investigation', 'Management Review', 'Consultancy',
        'Improvement', 'Document Writing', 'Program Development', 'Transportation',
        'Communication', 'Documentation'
    ];

    // State for Job Types
    const [jobTypesList, setJobTypesList] = useState(initialJobTypes);
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [showOtherJob, setShowOtherJob] = useState(false);
    const [newJobType, setNewJobType] = useState('');

    // Form Data State
    const [formData, setFormData] = useState({
        dprNo: '',
        date: '',
        employeeName: '',
        contractRef: '',
        jobCard: '',
        serviceScope: ''
    });

    // Activities State
    const [activities, setActivities] = useState([{
        id: Date.now(),
        fromTime: '',
        toTime: '',
        clientName: '',
        travel: '',
        description: '',
        evidence: [],
        remarks: ''
    }]);

    // Validation Errors State
    const [errors, setErrors] = useState({});

    // Dynamic Input Styling based on error state
    const getInputStyle = (error) => {
        const baseStyles = "w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-slate-400 border ";
        if (error) {
            return baseStyles + "bg-red-50 border-red-400 focus:border-red-500 focus:ring-red-500/20 text-red-900";
        }
        return baseStyles + "bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-amber-500/15 text-slate-700";
    };

    // Generic form change handler
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Activity change handler
    const handleActivityChange = (id, field, value) => {
        setActivities(activities.map(act => act.id === id ? { ...act, [field]: value } : act));
        // Clear error when user types
        if (errors[`act_${id}_${field}`]) {
            setErrors(prev => ({ ...prev, [`act_${id}_${field}`]: null }));
        }
    };

    // Evidence toggle handler
    const handleEvidenceToggle = (activityId, evidenceName) => {
        setActivities(activities.map(act => {
            if (act.id === activityId) {
                const newEvidence = act.evidence.includes(evidenceName)
                    ? act.evidence.filter(e => e !== evidenceName)
                    : [...act.evidence, evidenceName];

                if (errors[`act_${activityId}_evidence`] && newEvidence.length > 0) {
                    setErrors(prev => ({ ...prev, [`act_${activityId}_evidence`]: null }));
                }

                return { ...act, evidence: newEvidence };
            }
            return act;
        }));
    };

    // Handle toggling checkboxes for Job Types
    const handleJobToggle = (job) => {
        const newSelected = selectedJobs.includes(job)
            ? selectedJobs.filter(j => j !== job)
            : [...selectedJobs, job];

        setSelectedJobs(newSelected);
        if (errors.jobTypes && newSelected.length > 0) {
            setErrors(prev => ({ ...prev, jobTypes: null }));
        }
    };

    // Handle saving an infinite amount of custom jobs
    const handleAddCustomJob = () => {
        const trimmedJob = newJobType.trim();
        if (trimmedJob && !jobTypesList.includes(trimmedJob)) {
            setJobTypesList([...jobTypesList, trimmedJob]);
            setSelectedJobs([...selectedJobs, trimmedJob]);
            setNewJobType('');
            if (errors.jobTypes) {
                setErrors(prev => ({ ...prev, jobTypes: null }));
            }
        }
    };

    // Handle adding/removing activity rows (Max 9)
    const addActivity = () => {
        if (activities.length < 9) {
            setActivities([...activities, {
                id: Date.now(), fromTime: '', toTime: '', clientName: '', travel: '', description: '', evidence: [], remarks: ''
            }]);
        }
    };

    const removeActivity = (id) => {
        if (activities.length > 1) {
            setActivities(activities.filter(activity => activity.id !== id));
        }
    };

    // Validation and Submission
    const handleSubmit = () => {
        const newErrors = {};
        let firstErrorId = null;

        const addError = (fieldId, msg) => {
            newErrors[fieldId] = msg;
            if (!firstErrorId) firstErrorId = fieldId;
        };

        // Validate General Info
        if (!formData.dprNo.trim()) addError('dprNo', 'DPR No. is required');
        if (!formData.date) addError('date', 'Date is required');
        if (!formData.employeeName.trim()) addError('employeeName', 'Employee Name is required');
        if (!formData.contractRef.trim()) addError('contractRef', 'Contract Ref is required');
        if (!formData.jobCard.trim()) addError('jobCard', 'Job Card is required');
        if (!formData.serviceScope.trim()) addError('serviceScope', 'Service Scope is required');

        // Validate Job Types
        if (selectedJobs.length === 0) addError('jobTypes', 'Please select at least one Job Type');

        // Validate Activities
        activities.forEach((act) => {
            if (!act.fromTime) addError(`act_${act.id}_fromTime`, 'Required');
            if (!act.toTime) addError(`act_${act.id}_toTime`, 'Required');
            if (!act.clientName.trim()) addError(`act_${act.id}_clientName`, 'Required');
            if (!act.travel.toString().trim()) addError(`act_${act.id}_travel`, 'Required');
            if (!act.description.trim()) addError(`act_${act.id}_description`, 'Description is required');
            if (act.evidence.length === 0) addError(`act_${act.id}_evidence`, 'Select at least one evidence');
            // remarks is purposefully excluded from validation
        });

        setErrors(newErrors);

        if (firstErrorId) {
            // Scroll to the first error element smoothly within the scrollable container
            const errorElement = document.getElementById(firstErrorId);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus({ preventScroll: true });
            }
        } else {
            // console.log("Form successfully validated and submitted!", {
            //     formData, selectedJobs, activities
            // });
            alert("Form submitted successfully! Check console for data payload.");
        }
    };

    return (
        <div className="min-h-screen bg-white py-6 sm:py-8 flex justify-center items-center sm:items-start font-sans px-4">
            {/* Added flex-col, fixed max-height (90vh), and hidden overflow to the main wrapper to enable internal scrolling */}
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">

                {/* Header - Remains fixed at the top (flex-shrink-0 prevents it from squishing) */}
                <div className="flex-shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 border-b border-amber-100/50 flex items-center justify-between z-20 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100/60 p-2.5 rounded-lg shadow-sm">
                            <ClipboardList className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                                Daily Performance Report
                            </h1>
                            <p className="text-sm font-medium text-amber-700/80 mt-0.5">Fill out your daily tasks and achievements</p>
                        </div>
                    </div>
                    {/* Added Cross/Close Button here */}
                    <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 active:scale-95"
                        title="Close Form"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Scrollable Container */}
                <div className="p-6 md:p-8 space-y-10 overflow-y-auto flex-1 scroll-smooth">

                    {/* General Info & Employee Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Report Meta */}
                        <div className="space-y-5 bg-slate-50/50 p-5 rounded-xl border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200/80">
                                <div className="bg-orange-50 p-1.5 rounded-lg">
                                    <FileText className="w-4 h-4 text-orange-500" />
                                </div>
                                Report Details
                            </h2>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">DPR No.</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                            <div className="bg-amber-50 p-1.5 rounded-md">
                                                <Hash className="h-3.5 w-3.5 text-amber-500" />
                                            </div>
                                        </div>
                                        <input
                                            id="dprNo"
                                            name="dprNo"
                                            value={formData.dprNo}
                                            onChange={handleFormChange}
                                            type="text"
                                            placeholder="e.g. 104"
                                            className={`${getInputStyle(errors.dprNo)} pl-11`}
                                        />
                                    </div>
                                    {errors.dprNo && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.dprNo}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                            <div className="bg-orange-50 p-1.5 rounded-md">
                                                <Calendar className="h-3.5 w-3.5 text-orange-500" />
                                            </div>
                                        </div>
                                        <input
                                            id="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleFormChange}
                                            type="date"
                                            className={`${getInputStyle(errors.date)} pl-11 cursor-pointer`}
                                        />
                                    </div>
                                    {errors.date && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.date}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Employee Details */}
                        <div className="space-y-5 bg-slate-50/50 p-5 rounded-xl border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200/80">
                                <div className="bg-blue-50 p-1.5 rounded-lg">
                                    <User className="w-4 h-4 text-blue-500" />
                                </div>
                                Employee Information
                            </h2>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Employee Name</label>
                                    <input
                                        id="employeeName"
                                        name="employeeName"
                                        value={formData.employeeName}
                                        onChange={handleFormChange}
                                        type="text"
                                        placeholder="Full Name"
                                        className={getInputStyle(errors.employeeName)}
                                    />
                                    {errors.employeeName && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.employeeName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contract Ref</label>
                                    <input
                                        id="contractRef"
                                        name="contractRef"
                                        value={formData.contractRef}
                                        onChange={handleFormChange}
                                        type="text"
                                        placeholder="e.g. CR-2026-001"
                                        className={getInputStyle(errors.contractRef)}
                                    />
                                    {errors.contractRef && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.contractRef}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Card</label>
                                    <input
                                        id="jobCard"
                                        name="jobCard"
                                        value={formData.jobCard}
                                        onChange={handleFormChange}
                                        type="text"
                                        placeholder="e.g. JC-1045"
                                        className={getInputStyle(errors.jobCard)}
                                    />
                                    {errors.jobCard && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.jobCard}</p>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service of Scope</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                            <div className="bg-slate-100 p-1.5 rounded-md">
                                                <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                                            </div>
                                        </div>
                                        <input
                                            id="serviceScope"
                                            name="serviceScope"
                                            value={formData.serviceScope}
                                            onChange={handleFormChange}
                                            type="text"
                                            placeholder="Enter scope of service"
                                            className={`${getInputStyle(errors.serviceScope)} pl-11`}
                                        />
                                    </div>
                                    {errors.serviceScope && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.serviceScope}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Type Section */}
                    <div className="space-y-5" id="jobTypes">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                            <div className="bg-amber-50 p-1.5 rounded-lg">
                                <CheckSquare className="w-4 h-4 text-amber-500" />
                            </div>
                            Job Type <span className="text-sm font-medium text-slate-400 font-normal">(Select multiple)</span>
                        </h2>

                        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 p-1 ${errors.jobTypes ? 'border border-red-300 bg-red-50/50 rounded-xl p-3' : ''}`}>
                            {jobTypesList.map((type) => (
                                <label
                                    key={type}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-200 text-sm hover:-translate-y-0.5
                                        ${selectedJobs.includes(type)
                                            ? 'bg-amber-50 border-amber-500 text-amber-800 font-semibold shadow-sm ring-1 ring-amber-500/20'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:shadow-sm'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        value={type}
                                        checked={selectedJobs.includes(type)}
                                        onChange={() => handleJobToggle(type)}
                                        className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500/30 cursor-pointer accent-amber-500"
                                    />
                                    <span className="truncate select-none" title={type}>{type}</span>
                                </label>
                            ))}

                            {/* Others Checkbox Option */}
                            <label
                                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-200 text-sm hover:-translate-y-0.5
                                    ${showOtherJob
                                        ? 'bg-slate-800 border-slate-800 text-white font-semibold shadow-md'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={showOtherJob}
                                    onChange={(e) => {
                                        setShowOtherJob(e.target.checked);
                                        if (!e.target.checked) setNewJobType('');
                                    }}
                                    className="hidden"
                                />
                                <span className="w-full text-center select-none">
                                    {showOtherJob ? 'Close Custom' : '+ Add Other'}
                                </span>
                            </label>
                        </div>
                        {errors.jobTypes && <p className="text-red-500 text-sm font-semibold">{errors.jobTypes}</p>}

                        {/* Infinite Add "Others" Input Box */}
                        {showOtherJob && (
                            <div className="mt-4 p-5 bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-200/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-end gap-4 transition-all duration-300 shadow-inner">
                                <div className="w-full sm:w-2/3 md:w-1/2">
                                    <label className="block text-sm font-bold text-amber-900 mb-2">
                                        Specify Custom Job Type
                                    </label>
                                    <div className="flex items-center gap-2.5">
                                        <input
                                            type="text"
                                            value={newJobType}
                                            onChange={(e) => setNewJobType(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddCustomJob();
                                                }
                                            }}
                                            placeholder="Type custom job and click '+'..."
                                            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomJob}
                                            className="bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm shadow-amber-500/20"
                                            title="Add to List"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-amber-700/80 pb-3">
                                    Added items will immediately appear in the grid.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Activities Section */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <div className="bg-indigo-50 p-1.5 rounded-lg">
                                    <AlignLeft className="w-4 h-4 text-indigo-500" />
                                </div>
                                Activities / Services
                            </h2>
                            <button
                                type="button"
                                onClick={addActivity}
                                disabled={activities.length >= 9}
                                className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg border transition-all shadow-sm ${activities.length >= 9
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                        : 'text-amber-700 hover:text-amber-800 bg-amber-100/50 hover:bg-amber-100 border-amber-200/80 cursor-pointer active:scale-95'
                                    }`}
                                title={activities.length >= 9 ? "Maximum of 9 activities reached" : "Add new activity row"}
                            >
                                <PlusCircle className="w-4 h-4" />
                                {activities.length >= 9 ? 'Limit Reached' : 'Add Row'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {activities.map((activity, index) => (
                                <div key={activity.id} className="p-6 bg-slate-50/70 border border-slate-200 rounded-xl relative shadow-sm transition-all group hover:border-indigo-200 hover:bg-indigo-50/10">
                                    {activities.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeActivity(activity.id)}
                                            className="absolute top-5 right-5 text-slate-400 hover:text-red-500 transition-all cursor-pointer bg-white rounded-full p-1.5 shadow-sm border border-slate-200 hover:border-red-200 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
                                            title="Remove Activity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="mb-5">
                                        <span className="inline-block bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded mb-1">
                                            Activity #{index + 1} {index === 8 && '(Max)'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                        {/* Time Block */}
                                        <div className="md:col-span-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                                    <div className="bg-blue-50 p-1 rounded">
                                                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                    From Time
                                                </label>
                                                <input
                                                    id={`act_${activity.id}_fromTime`}
                                                    type="time"
                                                    value={activity.fromTime}
                                                    onChange={(e) => handleActivityChange(activity.id, 'fromTime', e.target.value)}
                                                    className={`${getInputStyle(errors[`act_${activity.id}_fromTime`])} cursor-pointer bg-white`}
                                                />
                                                {errors[`act_${activity.id}_fromTime`] && <p className="text-red-500 text-xs font-semibold mt-1">{errors[`act_${activity.id}_fromTime`]}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                                    <div className="bg-blue-50 p-1 rounded">
                                                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                    To Time
                                                </label>
                                                <input
                                                    id={`act_${activity.id}_toTime`}
                                                    type="time"
                                                    value={activity.toTime}
                                                    onChange={(e) => handleActivityChange(activity.id, 'toTime', e.target.value)}
                                                    className={`${getInputStyle(errors[`act_${activity.id}_toTime`])} cursor-pointer bg-white`}
                                                />
                                                {errors[`act_${activity.id}_toTime`] && <p className="text-red-500 text-xs font-semibold mt-1">{errors[`act_${activity.id}_toTime`]}</p>}
                                            </div>
                                        </div>

                                        {/* Location & Travel Block */}
                                        <div className="md:col-span-8 grid grid-cols-3 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                                    <div className="bg-orange-50 p-1 rounded">
                                                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                                    </div>
                                                    Client Name & Location
                                                </label>
                                                <input
                                                    id={`act_${activity.id}_clientName`}
                                                    type="text"
                                                    value={activity.clientName}
                                                    onChange={(e) => handleActivityChange(activity.id, 'clientName', e.target.value)}
                                                    placeholder="E.g. Acme Corp, Kathmandu"
                                                    className={`${getInputStyle(errors[`act_${activity.id}_clientName`])} bg-white`}
                                                />
                                                {errors[`act_${activity.id}_clientName`] && <p className="text-red-500 text-xs font-semibold mt-1">{errors[`act_${activity.id}_clientName`]}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Travel (Mins)</label>
                                                <input
                                                    id={`act_${activity.id}_travel`}
                                                    type="number"
                                                    value={activity.travel}
                                                    onChange={(e) => handleActivityChange(activity.id, 'travel', e.target.value)}
                                                    placeholder="45"
                                                    className={`${getInputStyle(errors[`act_${activity.id}_travel`])} bg-white`}
                                                />
                                                {errors[`act_${activity.id}_travel`] && <p className="text-red-500 text-xs font-semibold mt-1">{errors[`act_${activity.id}_travel`]}</p>}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="md:col-span-12">
                                            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
                                                {/* <FileText size={16} className="text-amber-500" /> */}
                                                <div className="bg-amber-50 p-1 rounded">
                                                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                                                    </div>
                                                Description of Job / Activities
                                            </label>
                                            <textarea
                                                id={`act_${activity.id}_description`}
                                                rows="2"
                                                value={activity.description}
                                                onChange={(e) => handleActivityChange(activity.id, 'description', e.target.value)}
                                                placeholder="Briefly describe the tasks performed..."
                                                className={`${getInputStyle(errors[`act_${activity.id}_description`])} bg-white resize-none`}
                                            ></textarea>
                                            {errors[`act_${activity.id}_description`] && <p className="text-red-500 text-xs font-semibold mt-1">{errors[`act_${activity.id}_description`]}</p>}
                                        </div>

                                        {/* Evidence & Remarks */}
                                        <div className="md:col-span-12 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                            <div className="space-y-2.5" id={`act_${activity.id}_evidence`}>
                                                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                                    <div className="bg-blue-50 p-1 rounded">
                                                        <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                    {/* <Paperclip size={16} className="text-slate-400" /> */}
                                                    Evidence Provided
                                                </label>
                                                <div className="flex flex-wrap gap-4.5">
                                                    {['Email', 'MoM', 'Job Sheet', 'Attendance', 'Signed'].map(evidenceItem => (
                                                        <label key={evidenceItem} className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer hover:text-amber-600 transition-colors select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={activity.evidence.includes(evidenceItem)}
                                                                onChange={() => handleEvidenceToggle(activity.id, evidenceItem)}
                                                                className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500/30 cursor-pointer accent-amber-500"
                                                            />
                                                            {evidenceItem}
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors[`act_${activity.id}_evidence`] && <p className="text-red-500 text-xs font-semibold">{errors[`act_${activity.id}_evidence`]}</p>}
                                            </div>

                                            <div className="w-full lg:w-1/3">
                                                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-1.5">
                                                
                                                    <div className="bg-orange-50 p-1 rounded">
                                                        <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                                                    </div>
                                                    Remarks (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={activity.remarks}
                                                    onChange={(e) => handleActivityChange(activity.id, 'remarks', e.target.value)}
                                                    placeholder="Optional notes"
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 transition-all text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-8 border-t border-slate-200 flex justify-end">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-3 rounded-xl font-bold text-base transition-all shadow-lg shadow-amber-500/30 active:scale-[0.98] cursor-pointer flex items-center gap-2"
                        >
                            <CheckSquare className="w-5 h-5" />
                            Submit Report
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DPR_form;