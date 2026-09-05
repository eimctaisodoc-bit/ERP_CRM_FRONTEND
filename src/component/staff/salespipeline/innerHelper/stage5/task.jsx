import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  FileText,
  Download,
  Printer,
  Mail,
  Send,
  XCircle,
  Trash2,
  AlertTriangle,
  Plus,
  Loader2,
} from "lucide-react";


import { useGet } from "../../../../hooks/useGet";

// import { Front } from "./contractpage";
// import { Back } from "./backSide";
import { useReactToPrint } from "react-to-print";

import { UseAdd } from "../../../../hooks/useadd"
import { extractStageData } from "../../../../../data/data";
import { htmlToPdf } from "./downloadfn";

export const Contract = ({ id }) => {
  // console.log('IDS',id)
  const [filled, setFilled] = useState([]);
  const { SendTO_Contract } = UseAdd();
  const { getDetails_ } = useGet();

  const [organizations, setOrganizations] = useState([]);
  const [emptyFields, setEmptyFields] = useState([]);

  const [status] = useState(null);

  const [emailInput, setEmailInput] = useState("");
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState(
    "Please review the contract details and share your confirmation."
  );

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSubjectError, setEmailSubjectError] = useState("");
  const [emailBodyError, setEmailBodyError] = useState("");

  const [parmsOnly, setParams] = useState({})

  const { getOnlyOrgDetails_ } = useGet();

  const fontStyle = { fontFamily: "'Roboto Slab', serif" };


  const [printing, setPrinting] = useState(false);
  const [printingType, setPrintingType] = useState("");


  const frontRef = useRef(null);
  const backRef = useRef(null);

  useEffect(() => {
    if (!id?.mainID) return;

    getOnlyOrgDetails_.mutate(
      { parms: { _id: id?.mainID } },
      {
        onSuccess: (data) => {
          setOrganizations(data?.data?.organizationDetails || []);
          console.log("Fetched organization details:", data?.data?.organizationDetails);
        },
        onError: (err) => {
          console.error("Error fetching organization details:", err);
        },
      }
    );
  }, [id?.mainID]);


  // console.log("is filleded:--", emptyFields);

  const getContractReference = () => {
    if (typeof id === "string" || typeof id === "number") return String(id);
    return id?.mainID || id?._id || "draft";
  };

  const sanitizeFileName = (value) =>
    String(value || "draft")
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "draft";

  const getOptionLabel = (option) => option?.label || "Not selected";

  const getContractText = () => {
    return [
      "Contract",
      `Reference: ${getContractReference()}`,
      `Status: ${getOptionLabel(status)}`,
    ].join("\n");
  };

  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[char])
    );

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAddEmail = () => {
    const nextEmail = emailInput.trim();

    if (!nextEmail) {
      setEmailError("Enter an email address");
      return;
    }

    if (!isValidEmail(nextEmail)) {
      setEmailError("Enter a valid email address");
      return;
    }

    if (emailRecipients.includes(nextEmail)) {
      setEmailError("Email already added");
      return;
    }

    setEmailRecipients((prev) => [...prev, nextEmail]);
    setEmailInput("");
    setEmailError("");
  };

  const handleEmailKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddEmail();
    }
  };

  const handleRemoveEmail = (index) => {
    setEmailRecipients((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
    setEmailError("");
  };

  const getMailRecipients = () => {
    const pendingEmail = emailInput.trim();

    if (!pendingEmail) return emailRecipients;

    return emailRecipients.includes(pendingEmail)
      ? emailRecipients
      : [...emailRecipients, pendingEmail];
  };

  const handleDownloadContract = async () => {
    setDownloading(true);
    try {
      // await downloadMultiplePdf([
      //   {
      //     element: frontRef.current,
      //     fileName: "Contract-Front.pdf",
      //   },
      //   {
      //     element: backRef.current,
      //     fileName: "Contract-Back.pdf",
      //   },
      // ]);
    } catch (err) {

    } finally {

      setDownloading(false);
    }


  };

  const waitForRender = () => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  };
  const handlePrintContract = useReactToPrint({
    contentRef: frontRef,
    documentTitle: "MOU-1",

    onBeforePrint: async () => {
      await waitForRender();
      setPrintingType("front");
    },

    onAfterPrint: () => {
      setPrinting(false);
      setPrintingType("");
    },

    onPrintError: () => {
      setPrinting(false);
      setPrintingType("front");
    },
  })
  const handlePrintBack = useReactToPrint({
    contentRef: backRef,
    documentTitle: "MOU-2",
    onBeforePrint: async () => {
      await waitForRender();
      setPrintingType("back");
    },

    onAfterPrint: () => {
      setPrinting(false);
      setPrintingType("");
    },

    onPrintError: () => {
      setPrinting(false);
      setPrintingType("back");
    },
  })
  
  useEffect(() => {
    if (id?.mainID) {
      getDetails_.mutate(
        { _id: id?.mainID },
        {
          onSuccess: (data) => {
            const res__ = extractStageData(data, 1);

            // console.log("mistake", res__.length);

            setParams(res__);
          },
          onError: (err) => {
            console.log("error", err);
          },
        }
      );
    }
  }, [id?.mainID]);
  // console.log('ParamsOnly:---', parmsOnly)



  const handleSendMail = async () => {
    const subjectValue = emailSubject.trim();
    const bodyValue = emailMessage.trim();

    let hasError = false;
    setEmailSubjectError("");
    setEmailBodyError("");
    setEmailError("");

    if (!subjectValue) { setEmailSubjectError("Subject is required"); hasError = true; }
    if (!bodyValue) { setEmailBodyError("Body is required"); hasError = true; }
    if (hasError) return;

    const recipients = getMailRecipients();

    if (recipients.length === 0) { setEmailError("Add at least one recipient"); return; }

    const invalidEmail = recipients.find((email) => !isValidEmail(email));
    if (invalidEmail) { setEmailError(`Invalid email: ${invalidEmail}`); return; }

    const selectedIds = parmsOnly?.[0];


    try {
      setLoading(true)
      // const formData = await buildSinglePdfFormData(frontRef.current,  "Contract-Front.pdf" ,          );
      const formData = new FormData();
      const pdfDoc = await htmlToPdf(frontRef.current, "front.pdf");

      pdfDoc.getBlob((blob) => {
        const formData = new FormData();
        formData.append("file", blob, "contract.pdf");
      })
      console.log('file created:',formData)
      // formData.append("subject", subjectValue);
      // formData.append("note", bodyValue);

      // recipients.forEach((email) => {
      //   formData.append("emailTo[]", email);
      // });
      // console.log('naya ',formData,selectedIds)

      // formData.append("file", blob, "report.pdf");

      SendTO_Contract.mutate(
        {
          params: {
            MainID: selectedIds.MainID,
            DetailsID: selectedIds.DetailsID,
            // Stage5: selectedIds.Stage5,
          },
          payload: formData, // ✅ formData now has everything
        },
        {
          onSuccess: (data) => console.log("Contract sent successfully", data),
          onError: (err) => console.error("Error sending contract:", err),
        }
      );
    } catch (error) {
      console.error("PDF create error:", error);
      setEmailError("Failed to create contract PDF");
    } finally {
      setLoading(false);
    }

  };

  const getEmptyOrganizationFields = (value) => {
    const emptyFields = {};

    if (value?.organizationName === "" || value?.organizationName === null) {
      emptyFields.organizationName = value?.organizationName;
    }

    if (value?.contactPersonName === "" || value?.contactPersonName === null) {
      emptyFields.contactPersonName = value?.contactPersonName;
    }

    if (
      value?.contactPersonEmail === "" ||
      value?.contactPersonEmail === null
    ) {
      emptyFields.contactPersonEmail = value?.contactPersonEmail;
    }

    if (
      value?.contactPersonNumber === "" ||
      value?.contactPersonNumber === null
    ) {
      emptyFields.contactPersonNumber = value?.contactPersonNumber;
    }

    if (value?.address === "" || value?.address === null) {
      emptyFields.address = value?.address;
    }

    if (!value?.industyType || value?.industyType.length === 0) {
      emptyFields.industyType = value?.industyType;
    }

    if (value?.organizationType === "" || value?.organizationType === null) {
      emptyFields.organizationType = value?.organizationType;
    }

    if (
      value?.registrationNumber === "" ||
      value?.registrationNumber === null
    ) {
      emptyFields.registrationNumber = value?.registrationNumber;
    }

    if (!value?.role || value?.role.length === 0) {
      emptyFields.role = value?.role;
    }

    if (value?.totalEducator === null || value?.totalEducator === undefined) {
      emptyFields.totalEducator = value?.totalEducator;
    }

    if (
      value?.totalEmp_learners === null ||
      value?.totalEmp_learners === undefined
    ) {
      emptyFields.totalEmp_learners = value?.totalEmp_learners;
    }

    if (value?.vatPan === "" || value?.vatPan === null) {
      emptyFields.vatPan = value?.vatPan;
    }

    const hasEmptyValue = Object.keys(emptyFields).length > 0;

    return {
      isEmpty: hasEmptyValue ? true : false,
      emptyFields: emptyFields,
    };
  };

  const emptyOrganizationFields = organizations?.map((organization) =>
    getEmptyOrganizationFields(organization)
  );

  useEffect(() => {
    setEmptyFields(emptyOrganizationFields);
  }, [organizations])

  // console.log("empty organization fields:--", emptyFields[0]?.isEmpty);


  return (
    <div className="mx-auto w-full bg-transparent px-3 py-4" style={fontStyle}>

      {emptyFields?.map((item, index) => (
        item.isEmpty && (
          <div
            key={index}
            className="relative flex w-full animate-in items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 align-middle duration-300 fade-in slide-in-from-top-2"
            role="alert"
          >
            <AlertTriangle
              className="mt-0.5 flex-shrink-0 cursor-pointer text-amber-500"
              size={18}
              strokeWidth={2.5}
            />

            <div className="flex-1">
              <h5 className="text-sm font-medium text-amber-800">
                Please complete the client details.
              </h5>

              <div className="mt-1 flex flex-wrap gap-2">
                {Object.entries(item.emptyFields).map(([key, value]) => (
                  <span
                    key={key}
                    className="rounded-md border capitalize border-amber-200 bg-white/70 px-2 py-0.5 text-xs font-medium text-amber-700"
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      ))}
      <div className="flex items-center gap-2 py-2 align-middle">
        <div className="mb-4 flex flex-1 items-center gap-2">
          <div className="rounded-xl bg-amber-50 p-1.5">
            <Calendar size={14} className="text-amber-500" />
          </div>

          <h2 className="text-sm font-bold uppercase text-slate-900 sm:text-[12px]">
            Contract
          </h2>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-50 p-1.5">
              <FileText size={14} className="text-emerald-500" />
            </div>

            <div>
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-900">
                Contract Actions
              </h3>

              <p className={` ${!emptyFields[0]?.isEmpty ? "text-emerald-500" : "text-red-500 animate-pulse"} text-[11px] `}>
                {!emptyFields[0]?.isEmpty
                  ? "Contract file is ready"
                  : "Complete contract details first"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              title="Download contract"
              onClick={handleDownloadContract}
              disabled={emptyFields[0]?.isEmpty}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold uppercase transition-colors ${emptyFields[0]?.isEmpty
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-blue-50 cursor-pointer text-blue-600 hover:bg-blue-100"
                }`}
            >
              {
                downloading ? "...." : <Download size={13} />
              }

            </button>
            {/* <button
              type="button"
              title="Download contract"
              onClick={handleDownloadContract}
              disabled={emptyFields[0]?.isEmpty}
              className={`inline-flex  items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold uppercase transition-colors ${emptyFields[0]?.isEmpty
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-blue-50 cursor-pointer text-blue-600 hover:bg-blue-100"
                }`}
            >
              <Mail size={13} />

            </button> */}

            <div className="fixed left-[-9999px] top-0 z-[-1] bg-[#ffffff]">
              <div ref={frontRef} >
                {/* <Front /> */}
              </div>

              <div ref={backRef}>
                {/* <Back /> */}
              </div>
            </div>


            <button
              type="button"
              title="Print contract"
              onClick={handlePrintContract}
              disabled={emptyFields[0]?.isEmpty || printingType === "front"}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold uppercase
                 transition-colors ${emptyFields[0]?.isEmpty || printingType
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-violet-50 cursor-pointer text-violet-600 hover:bg-violet-100"
                }`}
            >
              <Printer size={13} />
              {printingType === "front" ? "Preparing..." : "Front"}

            </button>
            <button
              type="button"
              title="Print contract"
              onClick={handlePrintBack}
              disabled={emptyFields[0]?.isEmpty || printingType === "back"}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold uppercase transition-colors 
                ${emptyFields[0]?.isEmpty || printingType
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-violet-50 cursor-pointer text-violet-600 hover:bg-violet-100"
                }`}
            >
              <Printer size={13} />
              {printingType === "back" ? "Preparing..." : "Back"}
            </button>
          </div>
        </div>

        <div
          className={`mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 ${emptyFields[0]?.isEmpty ? "pointer-events-none opacity-60" : ""
            }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg border border-slate-200 bg-white p-1.5">
              <Mail size={13} className="text-amber-500" />
            </div>

            <span className="text-[12px] font-bold uppercase tracking-wide text-slate-900">
              Send Mail
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-700">
                Recipient Email
              </span>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={emailInput}
                  disabled={emptyFields[0]?.isEmpty}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  onKeyDown={handleEmailKeyDown}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
                />

                <button
                  type="button"
                  title="Add email"
                  onClick={handleAddEmail}
                  disabled={emptyFields[0]?.isEmpty}
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${emptyFields[0]?.isEmpty
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                    }`}
                >
                  <Plus size={15} />
                </button>
              </div>

              {emailError && (
                <span className="text-[11px] text-red-500">{emailError}</span>
              )}
            </label>

            {emailRecipients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emailRecipients.map((email, index) => (
                  <span
                    key={email}
                    className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700"
                  >
                    <span className="truncate">{email}</span>

                    <button
                      type="button"
                      title="Remove email"
                      onClick={() => handleRemoveEmail(index)}
                      className="text-slate-400 transition-colors hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-700">
                Subject
              </span>

              <input
                type="text"
                value={emailSubject}
                disabled={emptyFields[0]?.isEmpty}
                onChange={(e) => {
                  setEmailSubject(e.target.value);
                  if (emailSubjectError) setEmailSubjectError("");
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
                placeholder="Enter email subject"
              />

              {emailSubjectError && (
                <span className="text-[11px] text-red-500">
                  {emailSubjectError}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-700">
                Body
              </span>

              <textarea
                rows={4}
                value={emailMessage}
                disabled={emptyFields[0]?.isEmpty}
                onChange={(e) => {
                  setEmailMessage(e.target.value);
                  if (emailBodyError) setEmailBodyError("");
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
              />

              {emailBodyError && (
                <span className="text-[11px] text-red-500">
                  {emailBodyError}
                </span>
              )}
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSendMail}
                disabled={emptyFields[0]?.isEmpty}
                className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold uppercase transition-colors ${emptyFields[0]?.isEmpty
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
              >
                {
                  loading ? (<Loader2 size={13} className="animate-spin" />) : <Send size={13} />
                }

                {/* Send Mail */}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded bg-gray-50 py-2 text-[12px] font-bold uppercase text-red-600 hover:bg-gray-100 sm:text-sm"
        >
          <XCircle size={12} />
          Terminated
        </button>
      </div>
    </div>
  );
};