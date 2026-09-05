import React from "react";
import { FileText, CreditCard } from "lucide-react";

const SERVICES = [
  {
    sn: 1,
    description:
      "Consultancy: Documentation, Training/Workshop, Meeting, Implementation",
    mode: "Hybrid (physical & virtual)",
    cost: "1,50,000.00",
    Eimcta: "yes",
    period: "One Time (1st year)",
    Deliverable: "Document, Training Workshop",
  },
  {
    sn: 2,
    description:
      "ISO 21001 Audit, Management Review, Corrective Action & Certification of the Organization to ISO 21001:2018 Educational Organization Management System. Development of Short & Long Term Educational Program for Sustainable Improvement of the School/College.",
    mode: "Hybrid (physical & virtual)",
    cost: "1,00,000.00",
    Eimcta: "yes",
    period: "One Time (3rd year)",
    Deliverable: "ISO Certificate (IAF/UAF accredited)",
  },
  {
    sn: 3,
    description:
      "Academic Enterprise Resource Planning (ERP) Software, Data Entry (By Client), Data Management, Analysis and Educational MIS System. Training Cost by Client, Operation by EIMCTA. Educator/Learner Profile, KUAHA, etc.",
    mode: "Hybrid (physical & virtual)",
    cost: "1,20,000.00",
    Eimcta: "yes",
    period: "One Time (3rd year)",
    Deliverable: "Academic ERP",
  },
];

const SectionHeader = ({ icon: Icon, title }) => {
  return (
    <div className="bg-slate-900 border-b border-slate-200 px-2 py-1.5 flex items-center gap-1.5">
      <Icon size={14} className="text-white" strokeWidth={2.5} />
      <h3 className="m-0 text-xs font-black text-white uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
};

const AmountRow = ({ label, value, danger, grand }) => {
  const bgClass = grand ? "bg-slate-900" : "bg-white/50";
  const borderClass = grand ? "" : "border-b border-slate-200";
  const paddingClass = grand ? "px-2.5 py-2" : "px-2.5 py-1.75";
  const labelColorClass = grand ? "text-white" : danger ? "text-red-700" : "text-slate-600";
  const labelFontClass = grand ? "font-black text-sm" : "font-bold text-xs";
  const valueColorClass = grand ? "text-white" : danger ? "text-red-700" : "text-slate-900";
  const valueFontClass = "font-black";

  return (
    <div className={`grid grid-cols-[1fr_auto] gap-2 items-center ${paddingClass} ${bgClass} ${borderClass}`}>
      <span className={`${labelFontClass} ${labelColorClass}`}>
        {label}
      </span>

      <span className={`text-sm ${valueFontClass} ${valueColorClass} whitespace-nowrap`}>
        {value}
      </span>
    </div>
  );
};

const parseNprAmount = (amount) => {
  return Number(String(amount).replace(/,/g, ""));
};

const formatNprAmount = (amount) => {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

 export function ServiceBreakdownFinancialSummary() {
  const subTotal = SERVICES.reduce(
    (total, item) => total + parseNprAmount(item.cost),
    0
  );

  const discount = 20000;
  const total = subTotal - discount;
  const vat = total * 0.13;
  const grandTotal = total + vat;

  return (
    <div className="avoid-break grid grid-cols-1 gap-3 mb-3 items-start" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
      {/* Service Breakdown */}
      <div className="border border-slate-200 rounded-lg overflow-hidden ">
        <SectionHeader icon={FileText} title="Service Breakdown" />

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th
                rowSpan={2}
                className="w-7 border-b border-r border-slate-200 px-1 py-1.25 text-center font-black align-middle"
              >
                SN
              </th>

              <th
                rowSpan={2}
                className="border-b border-r border-slate-200 px-2 py-1.25 text-left font-black align-middle"
              >
                Service Description
              </th>



              <th
                colSpan={2}
                className="border-b border-r border-slate-200 px-1 py-1.25 text-center font-black align-middle"
              >
                Role
              </th>

            
  <th
                rowSpan={2}
                className="border-b border-r border-slate-200 px-1 py-1.25 text-center font-black align-middle"
              >
              Delivery Mode
              </th>
              <th
                rowSpan={2}
                className="border-b border-r border-slate-200 px-1 py-1.25 text-center font-black align-middle"
              >
              Deliverable
              </th>

              <th
                rowSpan={2}
                className="w-22 border-b border-slate-200 px-1.5 py-1.25 text-right font-black align-middle"
              >
                Cost (NPR)
              </th>
            </tr>



            <tr className="bg-slate-50 text-slate-600">
              <th className="w-15 border-b border-r border-slate-200 px-1 py-1 text-center font-black">
                EIMCTA
              </th>

              <th className="w-22 border-b border-r border-slate-200 px-1 py-1 text-center font-black">
                Period
              </th>
            </tr>


          </thead>

          <tbody>
            {SERVICES.map((r, i) => {
              const isEimcta = String(r.Eimcta).toLowerCase() === "yes";

              return (
                <tr
                  key={r.sn}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="border-r border-b
                   border-slate-200 px-1 py-1.5 text-center 
                   font-bold text-slate-500 align-top">
                    {r.sn}
                  </td>

                  <td className="border-r border-b border-slate-200 
                  px-2 py-1.5 font-medium text-slate-900 leading-relaxed align-top">
                    {r.description}
                  </td>

                  <td className="border-r border-b border-slate-200 px-1 py-1.5 text-center align-top">
                    <span
                      className={`inline-block px-1.75 py-0.5 rounded-full text-xs font-black uppercase ${
                        isEimcta
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-red-100 text-red-900 border border-red-300"
                      }`}
                    >
                      {r.Eimcta}
                    </span>
                  </td>

                  <td className="border-r border-b border-slate-200 px-1.25 py-1.5 text-center font-bold text-slate-600 leading-tight align-top">
                    {r.period}
                  </td>
                  <td className="border-r border-b border-slate-200 px-1.25 py-1.5 text-center font-bold text-slate-600 leading-tight align-top">
                    {r.mode}
                  </td>
                  <td className="border-r border-b border-slate-200 px-1.25 py-1.5 text-center font-bold
                   text-slate-600 leading-tight align-top">
                    {r.Deliverable}
                  </td>

                  <td className="border-b border-slate-200 px-1.5 py-1.5 text-right font-black text-slate-900 align-top whitespace-nowrap">
                    {r.cost}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-transparent">
        <SectionHeader icon={CreditCard} title="Financial Summary" />

        <AmountRow
          label="Sub-Total (NPR):"
          value={formatNprAmount(subTotal)}
        />

        <AmountRow
          label="Discount:"
          value={`(${formatNprAmount(discount)})`}
          danger
        />

        <AmountRow label="Total (NPR):" value={formatNprAmount(total)} />

        <AmountRow label="VAT @ 13%:" value={formatNprAmount(vat)} />

        <AmountRow
          label="Grand Total (NPR):"
          value={formatNprAmount(grandTotal)}
          grand
        />
      </div>
    </div>
  );
}