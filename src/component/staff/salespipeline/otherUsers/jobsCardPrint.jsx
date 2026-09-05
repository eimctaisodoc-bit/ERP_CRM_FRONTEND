import React from 'react';
import logo from '../../../../assest/eimcta.png';
import {
    ClipboardList, Hash, Calendar, User, FileText, CheckSquare,
    Briefcase, Clock, AlignLeft, Paperclip,
    MessageSquare, PenTool, Code, CheckCircle, ThumbsUp
} from 'lucide-react';

const JobCard = () => {
    // Array of job categories formatted as checkboxes
    const jobCategories = [
        'Consultancy Audit', 'Certification', 'Training', 'Meeting',
        'CE', 'OHS', 'S', 'EMTA', 'SEDEX', 'RBA COC',
        'HACCP', 'SA', 'GMP', 'EIA'
    ];

    // Updated mock data matching the new table structure
    const activities = [
        {
            serviceCode: 'SC-101',
            jobDescription: 'Initial site inspection, compliance review, and documentation.',
            jobCompletion: { time: '10:00 AM - 01:00 PM', evidence: 'MoM, Job Sheet' },
            clientFeedback: { fb1: 'Satisfactory', fb2: 'Signed & Approved' }
        },
        // Adding empty rows for hand-written printables
        { serviceCode: '', jobDescription: '', jobCompletion: { time: '', evidence: '' }, clientFeedback: { fb1: '', fb2: '' } },
        { serviceCode: '', jobDescription: '', jobCompletion: { time: '', evidence: '' }, clientFeedback: { fb1: '', fb2: '' } },
        { serviceCode: '', jobDescription: '', jobCompletion: { time: '', evidence: '' }, clientFeedback: { fb1: '', fb2: '' } },
        { serviceCode: '', jobDescription: '', jobCompletion: { time: '', evidence: '' }, clientFeedback: { fb1: '', fb2: '' } },
    ];

    return (
        <>
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

                    {/* Report Details & Job Card Header */}
                    <div className="flex flex-col gap-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                        <div className="flex flex-wrap items-center justify-between gap-4 font-medium">
                            <span className="flex items-center gap-1.5 text-sm">
                                <Hash size={16} className="text-orange-500" />
                                Card NO: <span className="font-bold text-slate-900">104</span>
                            </span>

                            <span className="flex items-center gap-2 font-bold text-lg uppercase tracking-wide text-slate-900 underline underline-offset-4 decoration-amber-500 decoration-2">

                                Job Card
                            </span>

                            <span className="flex items-center gap-1.5 text-sm">
                                <Calendar size={16} className="text-orange-500" />
                                Date: <span className="font-bold text-slate-900">2083/01/23</span>
                            </span>
                        </div>

                        {/* ISO / STD / JOB Input */}
                        <div className="flex items-start gap-1 pt-2 border-t border-slate-200">
                            <span className="text-sm font-bold uppercase text-slate-700 min-w-[130px]">
                                ISO / STD / JOB:-
                            </span>

                            <span className="text-sm text-slate-900 font-medium">
                                ISO 21001:2018 EOMS
                            </span>
                        </div>
                    </div>

                    {/* 4-Column Employee Details Table */}


                    {/* Checkboxes Section (Printable UI) */}
                    <div className="mt-6 rounded-lg border border-slate-300 bg-slate-50 p-4">
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 uppercase">
                            <CheckSquare size={18} className="text-orange-500" /> Job Category
                        </h2>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {jobCategories.map((category, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-slate-400 bg-white shadow-sm"></div>
                                    {category}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-300 text-left text-sm">
                            <thead className="bg-slate-200 text-slate-900">
                                <tr>
                                    <th className="capitalize text-center border border-slate-300 px-4 py-2.5 w-32 font-bold">
                                        <div className="flex items-center justify-center gap-1.5"> Organization Name</div>
                                    </th>
                                    <th className="capitalize text-center border border-slate-300 px-4 py-2.5 w-32 font-bold">
                                        <div className="flex items-center justify-center gap-1.5"> Contract Ref</div>
                                    </th>
                                    <th className="capitalize text-center border border-slate-300 px-4 py-2.5 w-32 font-bold">
                                        <div className="flex items-center justify-center gap-1.5"> Address /Site Name</div>
                                    </th>

                                    <th className="capitalize text-center border border-slate-300 px-4 py-2.5 w-32 font-bold">
                                        <div className="flex items-start justify-center gap-1.5"> VAT / PAN Number</div>
                                    </th>
                                    <th className="capitalize text-center border border-slate-300 px-4 py-2.5 w-32 font-bold">
                                        <div className="flex items-center justify-center gap-1.5"> Contract Sign Date</div>
                                    </th>
                                    <th className="capitalize text-center border border-slate-300 px-4 py-2.5 w-32 font-bold">
                                        <div className="flex items-center justify-center gap-1.5"> Completion Date</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-slate-300 px-4 py-2 text-center font-medium text-slate-800 bg-white">Ram Bahadur Thapa</td>
                                    <td className="border border-slate-300 px-4 py-2 text-center text-slate-600 bg-white">JC-1045</td>
                                    <td className="border border-slate-300 px-4 py-2 text-center text-slate-600 bg-white">Field Inspection & Reporting</td>
                                    <td className="border border-slate-300 px-4 py-2 text-center text-slate-600 bg-white">CR-2026-001</td>
                                    <td className="border border-slate-300 px-4 py-2 text-center text-slate-600 bg-white">CR-2026-001</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* New Job Details Table Section */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-300 text-center text-sm text-slate-800">
                            <thead className="bg-slate-200 font-semibold text-slate-900">
                                <tr>
                                    <th rowSpan={2} className="border border-slate-300 p-2 w-28">
                                        <div className="flex justify-center items-center gap-1.5"> Service Code</div>
                                    </th>
                                    <th rowSpan={2} className="border border-slate-300 p-2 min-w-[250px]">
                                        <div className="flex justify-center items-center gap-1.5"> Job Description</div>
                                    </th>
                                    <th colSpan={2} className="border border-slate-300 p-2">
                                        <div className="flex justify-center items-center gap-1.5"> Job Completion</div>
                                    </th>
                                    <th colSpan={2} className="border border-slate-300 p-2">
                                        <div className="flex justify-center items-center gap-1.5"> Client Feedback</div>
                                    </th>
                                </tr>
                                <tr className="bg-slate-100 text-xs">
                                    <th className="border border-slate-300 p-1.5 w-32">
                                        <div className="flex justify-center items-center gap-1"><Clock size={14} className="text-slate-600" /> Time</div>
                                    </th>
                                    <th className="border border-slate-300 p-1.5 w-32">
                                        <div className="flex justify-center items-center gap-1"><Paperclip size={14} className="text-slate-600" /> Evidence</div>
                                    </th>
                                    <th className="border border-slate-300 p-1.5 w-32">
                                        <div className="flex justify-center items-center gap-1"><MessageSquare size={14} className="text-slate-600" /> FB-1</div>
                                    </th>
                                    <th className="border border-slate-300 p-1.5 w-32">
                                        <div className="flex justify-center items-center gap-1"><MessageSquare size={14} className="text-slate-600" /> FB-2</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((item, index) => (
                                    <tr key={index} className="h-14 bg-white hover:bg-slate-50 transition-colors">
                                        <td className="border border-slate-300 p-2 font-medium text-slate-700">{item.serviceCode}</td>
                                        <td className="border border-slate-300 p-2 text-left text-slate-600">{item.jobDescription}</td>
                                        <td className="border border-slate-300 p-2 text-slate-600">{item.jobCompletion.time}</td>
                                        <td className="border border-slate-300 p-2 text-slate-600">{item.jobCompletion.evidence}</td>
                                        <td className="border border-slate-300 p-2 text-slate-600">{item.clientFeedback.fb1}</td>
                                        <td className="border border-slate-300 p-2 text-slate-600">{item.clientFeedback.fb2}</td>
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

export default JobCard;