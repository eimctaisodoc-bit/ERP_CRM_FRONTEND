import React from 'react';
import logo from '../../../../assest/eimcta.png';
import { 
    ClipboardList, Hash, Calendar, User, FileText, CheckSquare, 
    Briefcase, Clock, AlignLeft, MapPin, Car, Paperclip, 
    MessageSquare, PenTool, Activity 
} from 'lucide-react';

const DPR = () => {
    // Array of job types formatted for display
    const jobTypes = [
        'Certification', 'Audit', 'Training', 'Meeting', 
        'Inspection', 'Investigation', 'Management Review', 'Consultancy', 
        'Improvement', 'Document Writing', 'Program Development', 'Transportation', 
        'Communication', 'Documentation'
    ];

    // Mock data for the printable activities table
    const activities = [
        {
            sn: 1,
            fromTime: '10:00 AM',
            toTime: '01:00 PM',
            descriptionOfJobActivitiesServices: 'Initial site inspection and compliance review.',
            clientNameLocation: 'Acme Corp, Kathmandu',
            travelTimeMinutes: '45',
            evidence: {
                email: false,
                mom: true,
                jobSheet: true,
                attendanceRecord: false,
                signed: true
            },
            remarks: 'On track'
        },
        // Adding empty rows for hand-written printables
        { sn: 2, fromTime: '', toTime: '', descriptionOfJobActivitiesServices: '', clientNameLocation: '', travelTimeMinutes: '', evidence: {}, remarks: '' },
        { sn: 3, fromTime: '', toTime: '', descriptionOfJobActivitiesServices: '', clientNameLocation: '', travelTimeMinutes: '', evidence: {}, remarks: '' },
        { sn: 4, fromTime: '', toTime: '', descriptionOfJobActivitiesServices: '', clientNameLocation: '', travelTimeMinutes: '', evidence: {}, remarks: '' },
    ];

    return (
        <>
            {/* The wrapper handles normal viewing + print modes seamlessly */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4 overflow-y-auto print:static print:bg-transparent print:p-0 print:overflow-visible">
                <div className="w-full max-w-[1000px] rounded-xl bg-white p-6 shadow-2xl my-auto print:shadow-none print:rounded-none print:max-w-none print:p-0">

                    {/* Header Section */}
                    <div className="flex flex-col items-center justify-start gap-6 md:flex-row">
                        {/* Logo */}
                        <div className="h-32 w-60 shrink-0">
                            <img
                                src={logo}
                                alt="Everest Consultancy Logo"
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        {/* Company Title & Reg No */}
                        <div className="flex w-full flex-col items-center md:items-start text-center md:text-left">
                            <span className="w-full text-right text-sm text-slate-500">
                                Reg No: <b className="text-slate-700">208066/078/079</b>
                            </span>

                            <h1 className="mt-1 text-[20px] uppercase font-bold text-slate-900 leading-tight">
                                Everest International Management Consultancy & Training Agency Pvt. Ltd. <br />
                                <span className="text-[18px] font-semibold text-slate-700">
                                    एभरेस्ट इन्टरनेशनल म्यानेजमेन्ट कन्सल्टेन्सी एण्ड तालिम एजेन्सी प्रा. लि.
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="my-5 border-2 border-amber-500" />

                    {/* Report Details */}
                    <div className="flex flex-wrap items-center justify-between gap-4 font-medium px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                        <span className="flex items-center gap-1.5 text-sm">
                            <Hash size={16} className="text-orange-500" /> 
                            DPR NO: <span className="font-bold text-slate-900">104</span>
                        </span>
                        
                        <span className="flex items-center gap-2 font-bold text-lg uppercase tracking-wide text-slate-900 underline underline-offset-4 decoration-amber-500 decoration-2">
                            <ClipboardList size={22} className="text-orange-500" />
                            Daily Performance Report - DPR
                        </span>
                        
                        <span className="flex items-center gap-1.5 text-sm">
                            <Calendar size={16} className="text-orange-500" /> 
                            Date: <span className="font-bold text-slate-900">2083/01/23</span>
                        </span>
                    </div>

                    {/* 4-Column Table */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-300 text-left text-sm">
                            <thead className="bg-slate-200 text-slate-900">
                                <tr>
                                    <th className="capitalize text-center border border-slate-300 px-4 py-2.5 w-32 font-bold">
                                        <div className="flex items-center justify-center gap-1.5"><User size={16} className="text-orange-600"/> Name of Employee</div>
                                    </th>
                                    <th className="capitalize text-center border border-slate-300 px-4 py-2.5 w-32 font-bold">
                                        <div className="flex items-center justify-center gap-1.5"><FileText size={16} className="text-orange-600"/> Contract Ref</div>
                                    </th>
                                    <th className="capitalize text-center border border-slate-300 px-4 py-2.5 w-32 font-bold">
                                        <div className="flex items-center justify-center gap-1.5"><CheckSquare size={16} className="text-orange-600"/> Job Card</div>
                                    </th>
                                    <th className="capitalize text-center border border-slate-300 px-4 py-2.5 w-32 font-bold">
                                        <div className="flex items-center justify-center gap-1.5"><Briefcase size={16} className="text-orange-600"/> Service of Scope</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-slate-300 px-4 py-2 text-center font-medium text-slate-800 bg-white">Ram Bahadur Thapa</td>
                                    <td className="border border-slate-300 px-4 py-2 text-center text-slate-600 bg-white">CR-2026-001</td>
                                    <td className="border border-slate-300 px-4 py-2 text-center text-slate-600 bg-white">JC-1045</td>
                                    <td className="border border-slate-300 px-4 py-2 text-center text-slate-600 bg-white">Field Inspection & Reporting</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Job Types Section (Printable UI) */}
                    <div className="mt-6 rounded-lg border border-slate-300 bg-slate-50 p-4">
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 uppercase">
                            <Activity size={18} className="text-orange-500"/> Job Type (Select One)
                        </h2>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {jobTypes.map((job, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    {/* Pure CSS Printable Radio Button */}
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-400 bg-white">
                                        {job === 'Inspection' && (
                                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                        )}
                                    </div>
                                    {job}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activities Table Section (Printable UI) */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-300 text-center text-xs text-slate-800">
                            <thead className="bg-slate-200 font-semibold text-slate-900">
                                {/* Top Header Row (Grouped Columns) */}
                                <tr>
                                    <th rowSpan={2} className="border border-slate-300 p-2 w-8">S.N.</th>
                                    <th colSpan={2} className="border border-slate-300 p-2">
                                        <div className="flex justify-center items-center gap-1"><Clock size={14} className="text-orange-600"/> Time</div>
                                    </th>
                                    <th rowSpan={2} className="border border-slate-300 p-2 min-w-[150px]">
                                        <div className="flex justify-center items-center gap-1"><AlignLeft size={14} className="text-orange-600"/> Description of Job / Activities</div>
                                    </th>
                                    <th rowSpan={2} className="border border-slate-300 p-2 min-w-[120px]">
                                        <div className="flex justify-center items-center gap-1"><MapPin size={14} className="text-orange-600"/> Client Name & Loc.</div>
                                    </th>
                                    <th rowSpan={2} className="border border-slate-300 p-2 w-16">
                                        <div className="flex flex-col items-center gap-1"><Car size={14} className="text-orange-600"/> <span>Travel Time <br/>(Mins)</span></div>
                                    </th>
                                    <th colSpan={5} className="border border-slate-300 p-2">
                                        <div className="flex justify-center items-center gap-1"><Paperclip size={14} className="text-orange-600"/> Evidence</div>
                                    </th>
                                    <th rowSpan={2} className="border border-slate-300 p-2 w-24">
                                        <div className="flex justify-center items-center gap-1"><MessageSquare size={14} className="text-orange-600"/> Remarks</div>
                                    </th>
                                </tr>
                                {/* Bottom Header Row (Sub-columns) */}
                                <tr className="bg-slate-100">
                                    <th className="border border-slate-300 p-1 w-16 font-semibold text-slate-800">From</th>
                                    <th className="border border-slate-300 p-1 w-16 font-semibold text-slate-800">To</th>
                                    <th className="border border-slate-300 p-1 w-12 font-semibold text-slate-800">Email</th>
                                    <th className="border border-slate-300 p-1 w-12 font-semibold text-slate-800">MoM</th>
                                    <th className="border border-slate-300 p-1 w-16 font-semibold text-slate-800">Job Sheet</th>
                                    <th className="border border-slate-300 p-1 w-12 font-semibold text-slate-800">Attd.</th>
                                    <th className="border border-slate-300 p-1 w-14 font-semibold text-slate-800">Signed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((item, index) => (
                                    <tr key={index} className="h-10 bg-white hover:bg-slate-50 transition-colors">
                                        <td className="border border-slate-300 p-1 font-medium">{item.sn}</td>
                                        <td className="border border-slate-300 p-1 text-slate-600">{item.fromTime}</td>
                                        <td className="border border-slate-300 p-1 text-slate-600">{item.toTime}</td>
                                        <td className="border border-slate-300 p-1 text-left px-2">{item.descriptionOfJobActivitiesServices}</td>
                                        <td className="border border-slate-300 p-1 text-left px-2">{item.clientNameLocation}</td>
                                        <td className="border border-slate-300 p-1 font-medium">{item.travelTimeMinutes}</td>
                                        
                                        {/* Printable Checkboxes (CSS Squares) */}
                                        <td className="border border-slate-300 p-1">
                                            <div className={`mx-auto h-3.5 w-3.5 border border-slate-400 rounded-sm ${item.evidence?.email ? 'bg-amber-500' : 'bg-transparent'}`}></div>
                                        </td>
                                        <td className="border border-slate-300 p-1">
                                            <div className={`mx-auto h-3.5 w-3.5 border border-slate-400 rounded-sm ${item.evidence?.mom ? 'bg-amber-500' : 'bg-transparent'}`}></div>
                                        </td>
                                        <td className="border border-slate-300 p-1">
                                            <div className={`mx-auto h-3.5 w-3.5 border border-slate-400 rounded-sm ${item.evidence?.jobSheet ? 'bg-amber-500' : 'bg-transparent'}`}></div>
                                        </td>
                                        <td className="border border-slate-300 p-1">
                                            <div className={`mx-auto h-3.5 w-3.5 border border-slate-400 rounded-sm ${item.evidence?.attendanceRecord ? 'bg-amber-500' : 'bg-transparent'}`}></div>
                                        </td>
                                        <td className="border border-slate-300 p-1">
                                            <div className={`mx-auto h-3.5 w-3.5 border border-slate-400 rounded-sm ${item.evidence?.signed ? 'bg-amber-500' : 'bg-transparent'}`}></div>
                                        </td>

                                        <td className="border border-slate-300 p-1 text-left px-2 italic text-slate-600">{item.remarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Approval Signatures Section */}
                    <div className="mt-14 mb-4 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
                        {[
                            { role: 'Admin / Consultant' },
                            { role: 'Prepared By HR / Admin' },
                            { role: 'Prepared By HOD / Operation Manager' },
                            { role: 'Approved By Province Head' }
                        ].map((approval, index) => (
                            <div key={index} className="flex w-full flex-col gap-2">
                                {/* Signature Line */}
                                <div className="relative h-12 w-full border-b-2 border-slate-400">
                                    <span className="absolute bottom-1 left-0 flex items-center gap-1 text-xs text-slate-500 italic font-medium">
                                        <PenTool size={12} className="text-orange-500" /> Signature
                                    </span>
                                </div>
                                
                                {/* Position / Role Title */}
                                <span className="text-[12px] leading-tight font-bold uppercase text-slate-900 min-h-[36px] flex items-start">
                                    {approval.role}
                                </span>
                                
                                {/* Name and Date Lines */}
                                <div className="mt-1 flex flex-col gap-2.5">
                                    <div className="flex items-end gap-2">
                                        <span className="text-xs font-semibold text-slate-700">Name:</span>
                                        <div className="flex-1 border-b border-dashed border-slate-400 h-4"></div>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-xs font-semibold text-slate-700">Date:</span>
                                        <div className="flex-1 border-b border-dashed border-slate-400 h-4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </>
    );
}

export default DPR;