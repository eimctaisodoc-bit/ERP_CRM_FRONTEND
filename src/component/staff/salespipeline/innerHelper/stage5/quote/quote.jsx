import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    BorderStyle,
    AlignmentType,
    ImageRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    VerticalAlign,
    ShadingType,
    LevelFormat,
    HorizontalPositionAlign,
    HorizontalPositionRelativeFrom,
    HeightRule,
    VerticalPositionRelativeFrom,
    VerticalPositionAlign,
    TextWrappingType,
    Header,
    Footer,
    PageNumber,
    PageBreak,
    UnderlineType
} from "docx";

import logo from '../../../../../../assest/eimcta.png';
import iso from '../../../../../../assest/iso.png';
import watermark from '../../../../../../assest/iso.png';

// ═══════════════════════════════════════════════════════════════════════════
//  STATIC DOCUMENT CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STATIC_REF_NO = "EIMCTA/QTN/2026/0142";

const PAYMENT_TERMS = [
    { title: "1st Installment (50%):", text: "Due immediately upon the signing and activation of this contract to initiate services." },
    { title: "2nd Installment (30%):", text: "Due upon the completion of required system documentation, but strictly prior to its formal submittal." },
    { title: "3rd Installment (10%):", text: "Due prior to the commencement of training sessions or before the formal application for certification/accreditation." },
    { title: "Final Installment (10%):", text: "Due upon the full completion of consultancy, training services or upon the successful delivery of the official Certification/Accreditation." }
];

const CONSULTANCY_SERVICES = [
    { title: "Gap Analysis:", text: "Assessing current readiness against the standard." },
    { title: "Documentation:", text: "Drafting required manuals, policies, and SOPs." },
    { title: "Implementation:", text: "Integrating new processes into daily operations." },
    { title: "Training:", text: "Educating staff and preparing internal auditors." },
    { title: "Internal Audits:", text: "Conducting pre-certification 'mock' audits." },
    { title: "Audit Support:", text: "Assisting management during the official external audit." },
    { title: "Maintenance:", text: "Managing ongoing compliance and continuous improvement." }
];

const CERTIFICATION_SERVICES = [
    { title: "Scoping:", text: "Defining the specific boundaries of the certification." },
    { title: "Stage 1 Audit:", text: "Reviewing system documentation for compliance." },
    { title: "Stage 2 Audit:", text: "On-site verification of actual, day-to-day practices." },
    { title: "Certification:", text: "Issuing the globally recognized official certificate." },
    { title: "Surveillance Audits:", text: "Annual check-ins to ensure sustained compliance." },
    { title: "Recertification:", text: "Full renewal audit conducted every three years." }
];

// ═══════════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS & STYLING
// ═══════════════════════════════════════════════════════════════════════════

const FONT = "Roboto";
const CONTENT_WIDTH = 10178;

const C = {
    darkBlue: "0A192F",
    royalBlue: "2563EB",
    lightBlue: "E0F2FE",
    slateBg: "F1F5F9",
    slate: "64748B",
    slateDark: "475569",
    black: "0F172A",
    white: "FFFFFF",
    amberSolid: "F59E0B",
    amberWash: "FFFBEB",
    amberInk: "B45309",
    amberInkDeep: "C2410C",
    rule: "94A3B8",
    hairline: "CBD5E1",
};

const NO_BORDER = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
};

const OFF = { style: BorderStyle.NONE, size: 0, color: "auto" };

const TABLE_BORDERS = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "BAE6FD" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "BAE6FD" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "BAE6FD" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "BAE6FD" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "BAE6FD" },
    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "BAE6FD" },
};

const CELL_BORDERS = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "BAE6FD" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "BAE6FD" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "BAE6FD" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "BAE6FD" },
};

// ═══════════════════════════════════════════════════════════════════════════
//  IMAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

async function getImageBytes(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load image: ${url}`);
        return await res.arrayBuffer();
    } catch (e) {
        console.warn(e);
        return null;
    }
}

async function createWatermarkBytes(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.globalAlpha = 0.10;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (blob) => {
                if (blob) resolve(await blob.arrayBuffer());
                else reject(new Error("Failed to convert canvas to Blob"));
            }, "image/png");
        };
        img.onerror = () => reject(new Error(`Failed to load image for canvas: ${imageUrl}`));
        img.src = imageUrl;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
//  PRIMITIVES & COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const tr = (text, opts = {}) => new TextRun({
    text,
    font: FONT,
    bold: opts.bold || false,
    size: opts.size || 20,
    color: opts.color || C.black,
    ...opts,
});

const p = (text, opts = {}) => new Paragraph({
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: opts.spacing || { after: 120, line: 360 },
    shading: opts.shading,
    border: opts.border || opts.borders,
    indent: opts.indent,
    numbering: opts.numbering,
    keepNext: opts.keepNext,
    children: opts.children || (text ? [tr(text, opts)] : []),
});

const cell = ({ children, width, margins, bg, borders, vAlign, span }) => {
    const safeBorders = borders ? { ...borders } : { ...NO_BORDER };
    delete safeBorders.insideHorizontal;
    delete safeBorders.insideVertical;

    return new TableCell({
        children,
        width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
        columnSpan: span || 1,
        margins: margins || { top: 100, bottom: 100, left: 120, right: 120 },
        shading: bg ? { fill: bg, type: ShadingType.CLEAR, color: "auto" } : undefined,
        borders: safeBorders,
        verticalAlign: vAlign || VerticalAlign.CENTER,
    });
};

const spacer = (after = 200) => p("", { spacing: { after } });

const docInfoP = (label, value) => p("", {
    spacing: { after: 80, line: 320 },
    children: [
        tr(`${label}: `),
        tr(value || "N/A", { bold: true })
    ]
});

const sectionHeading = (title) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    rows: [
        new TableRow({
            cantSplit: true,
            children: [
                cell({
                    bg: C.slateBg,
                    borders: {
                        ...NO_BORDER,
                        left: { style: BorderStyle.SINGLE, size: 16, color: C.royalBlue },
                    },
                    margins: { top: 80, bottom: 80, left: 140, right: 140 },
                    children: [p(title.toUpperCase(), { bold: true, size: 22, color: C.darkBlue, spacing: { after: 0 } })]
                })
            ]
        })
    ]
});

// Used for bold title + standard text list items
const boldListItem = (title, text, bulletReference) => p("", {
    spacing: { after: 120, line: 360 },
    numbering: { reference: bulletReference, level: 0 },
    children: [
        tr(title + " ", { bold: true, size: 20, color: C.black }),
        tr(text, { size: 20, color: C.black })
    ]
});

// ═══════════════════════════════════════════════════════════════════════════
//  DOCUMENT TITLE BLOCK
// ═══════════════════════════════════════════════════════════════════════════

const documentTitleBlock = (title, subtitle) => ([
    new Paragraph({
        spacing: { before: 0, after: 0 },
        run: { size: 2 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.amberSolid, space: 1 } },
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 70, after: 70 },
        border: {
            top: { style: BorderStyle.DOUBLE, size: 10, color: C.darkBlue, space: 8 },
            bottom: { style: BorderStyle.DOUBLE, size: 10, color: C.darkBlue, space: 8 },
        },
        children: [
            new TextRun({ text: title, bold: true, size: 34, color: C.darkBlue, font: FONT, characterSpacing: 30 }),
        ],
    }),
    new Paragraph({
        spacing: { before: 0, after: 0 },
        run: { size: 2 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.amberSolid, space: 1 } },
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 90, after: 0 },
        children: [
            new TextRun({ text: subtitle, italics: true, size: 17, color: C.slateDark, font: FONT, characterSpacing: 4 }),
        ],
    }),
]);

// ═══════════════════════════════════════════════════════════════════════════
//  METADATA BAR
// ═══════════════════════════════════════════════════════════════════════════

const metadataBar = (data) => {
    const RULE_TOP = { style: BorderStyle.SINGLE, size: 12, color: C.darkBlue };
    const RULE_BASE = { style: BorderStyle.SINGLE, size: 8, color: C.royalBlue };
    const HAIR = { style: BorderStyle.SINGLE, size: 4, color: C.hairline };

    const metaLabel = (label, color) => new Paragraph({
        spacing: { after: 70, line: 200 },
        children: [
            new TextRun({
                text: label.toUpperCase(), font: FONT, size: 13, bold: true, color: color || C.slate, characterSpacing: 16,
            }),
        ],
    });

    const metaValue = (value, opts) => {
        const filled = value !== undefined && value !== null && String(value).trim() !== "";
        return new Paragraph({
            spacing: { before: 30, after: 0, line: 280 },
            border: {
                bottom: { style: BorderStyle.SINGLE, size: 6, color: opts.ruleColor || C.rule, space: 2 },
            },
            children: [
                new TextRun({
                    text: filled ? String(value) : " ", font: FONT, size: opts.size || 20, bold: true, color: opts.color || C.black,
                }),
            ],
        });
    };

    const metaCell = (label, value, opts = {}) => cell({
        width: opts.width,
        bg: opts.bg || C.slateBg,
        margins: { top: 130, bottom: 130, left: 170, right: 150 },
        borders: {
            top: RULE_TOP, bottom: RULE_BASE,
            left: opts.accent ? { style: BorderStyle.SINGLE, size: 18, color: opts.accent } : OFF,
            right: opts.last ? OFF : HAIR,
        },
        vAlign: VerticalAlign.CENTER,
        children: [
            metaLabel(label, opts.labelColor),
            metaValue(value, opts),
        ],
    });

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [3664, 3257, 3257],
        borders: { top: RULE_TOP, bottom: RULE_BASE, left: OFF, right: OFF, insideHorizontal: OFF, insideVertical: HAIR },
        rows: [
            new TableRow({
                cantSplit: true,
                children: [
                    metaCell("Ref. No.", data.refNumber, { width: 36, bg: C.amberWash, accent: C.amberSolid, labelColor: C.amberInk, color: C.amberInkDeep, ruleColor: C.amberSolid, size: 21 }),
                    metaCell("Sales Representative", data.salesRep, { width: 32 }),
                    metaCell("Sales Contact", data.salesContact, { width: 32, last: true }),
                ],
            }),
        ],
    });
};

// ═══════════════════════════════════════════════════════════════════════════
//  DOCUMENT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export async function BuildQuotationDocx(dynamicClientData = null) {
    const [logoBytes, isoOriginalBytes, watermarkBytes] = await Promise.all([
        getImageBytes(logo),
        getImageBytes(iso),
        createWatermarkBytes(watermark),
    ]);

    const companyData = {
        nameMain: "EVEREST INTERNATIONAL MANAGEMENT CONSULTANCY & TRAINING AGENCY",
        nameSub: "(EIMCTA) PVT. LTD.",
        address: "Head Office: Kageshwori Manohara-05, Kathmandu, Nepal",
        branchOffice: "Branch Office: Biratnagar Line, Itahari, Koshi Province, Nepal",
        email: "info@eimcta.com.np",
        phone: "+977-9800000000",
        registrationNo: "280667/078/079",
        vatNo: "610183126"
    };

    const dyn = dynamicClientData || {};

    const clientData = {
        clientName: dyn.clientName || "[Client Organization Name]",
        contactPerson: dyn.contactPerson || "[Contact Person]",
        contactNo: dyn.contactNo || "[Phone]",
        address: dyn.address || "[Client Address, Nepal]",
        companyRegNo: dyn.companyRegNo || "[Reg. Number]",
        branchLocations: dyn.branchLocations || "[Branch Locations]",
        email: dyn.email || "[Email Address]",
        employees: dyn.employees || "[No. of Employees]",
        
        refNumber: dyn.refNumber || STATIC_REF_NO,
        salesRep: dyn.salesRep || "",
        salesContact: dyn.salesContact || "",
        date: dyn.date || new Date().toLocaleDateString('en-GB'),
    };

    const doc = new Document({
        creator: "EIMCTA Document Engine",
        title: "Quotation for Services - EIMCTA",
        numbering: {
            config: [
                {
                    reference: "bullet-amber",
                    levels: [{
                        level: 0, format: LevelFormat.BULLET, text: "■", alignment: AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 420, hanging: 240 } }, run: { color: C.amberSolid, size: 20, font: FONT } },
                    }],
                },
                {
                    reference: "numbered-list",
                    levels: [{
                        level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 420, hanging: 240 } }, run: { color: C.royalBlue, size: 20, font: FONT, bold: true } },
                    }],
                },
            ],
        },
        styles: {
            default: {
                document: { run: { font: FONT, size: 20, color: C.black } },
            },
        },
        sections: [{
            properties: {
                page: {
                    size: { width: 11906, height: 16838 },
                    margin: { top: 720, right: 864, bottom: 864, left: 864 },
                },
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    type: "png",
                                    data: new Uint8Array(watermarkBytes),
                                    transformation: { width: 550, height: 550 },
                                    floating: {
                                        zIndex: 0, behindDocument: true, wrap: { type: TextWrappingType.NONE },
                                        horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, align: HorizontalPositionAlign.CENTER },
                                        verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, align: VerticalPositionAlign.CENTER },
                                    },
                                }),
                            ],
                        }),
                    ],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.hairline, space: 10 } },
                            spacing: { before: 120 },
                            children: [
                                new TextRun({ text: "Everest International Management Consultancy Training & Agency Pvt. Ltd. | Date: " + clientData.date, size: 16, color: C.slate }),
                                new TextRun({ text: " | Page ", size: 16, color: C.slate }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.slate }),
                                new TextRun({ text: " of ", size: 16, color: C.slate }),
                                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: C.slate }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: NO_BORDER,
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ borders: NO_BORDER, verticalAlign: VerticalAlign.CENTER, children: [p(`Co. Reg. No: ${companyData.registrationNo} | VAT No: ${companyData.vatNo}`, { bold: true, size: 18, color: C.darkBlue, spacing: { after: 0 } })] }),
                                new TableCell({ borders: NO_BORDER, verticalAlign: VerticalAlign.CENTER, children: [p(`Date: ${clientData.date}`, { alignment: AlignmentType.RIGHT, size: 16, bold: true, color: C.slate, spacing: { after: 0 } })] })
                            ]
                        })
                    ]
                }),
                p("", {
                    children: [
                        new ImageRun({
                            type: "png", data: new Uint8Array(isoOriginalBytes), transformation: { width: 183, height: 183 },
                            floating: { zIndex: 10, behindDocument: false, wrap: { type: TextWrappingType.SQUARE }, horizontalPosition: { relative: HorizontalPositionRelativeFrom.MARGIN, align: HorizontalPositionAlign.RIGHT, offset: 9000000 }, verticalPosition: { relative: VerticalPositionRelativeFrom.PARAGRAPH, offset: 0 } },
                        }),
                    ]
                }),
                p("", { spacing: { after: 80, before: 100 }, children: [new ImageRun({ type: "png", data: new Uint8Array(logoBytes), transformation: { width: 140, height: 82 } })] }),
                p(companyData.nameMain, { bold: true, size: 26, color: C.darkBlue, spacing: { before: 20, after: 10 } }),
                p(companyData.nameSub, { size: 20, color: C.slate, spacing: { after: 40 } }),
                p(companyData.address, { size: 20, color: C.slate, spacing: { after: 40 } }),
                p(`Email: ${companyData.email}  |  Contact: ${companyData.phone}`, { size: 20, color: C.slate, spacing: { after: 40 } }),

                spacer(60),

                // ── DOCUMENT TITLE ───────────────────────────────────────
                ...documentTitleBlock("QUOTATION FOR SERVICES", "Professional Consultancy, Certification & Compliance"),

                spacer(160),

                // ── METADATA & CLIENT DETAILS ────────────────────────────
                metadataBar(clientData),
                spacer(160),
                sectionHeading("Client Information"),
                spacer(80),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    columnWidths: [CONTENT_WIDTH / 2, CONTENT_WIDTH / 2],
                    borders: TABLE_BORDERS,
                    rows: [
                        new TableRow({ cantSplit: true, children: [cell({ width: 50, children: [docInfoP("Organization Name", clientData.clientName)] }), cell({ width: 50, children: [docInfoP("Address", clientData.address)] })] }),
                        new TableRow({ cantSplit: true, children: [cell({ width: 50, children: [docInfoP("Contact Person", clientData.contactPerson)] }), cell({ width: 50, children: [docInfoP("Phone / Email", `${clientData.contactNo} | ${clientData.email}`)] })] }),
                    ],
                }),
                spacer(120),

                // ── QUOTATION SERVICES SCOPE ──────────────────────────────
                sectionHeading("Scope of Proposed Services"),
                spacer(100),
                
                p("A. Consultancy to Certification of ....... (Particular standard i.e. ISO 9001 QMS)", { bold: true, size: 22, color: C.darkBlue, spacing: { after: 120 } }),
                p("B. Certification of ....... (Particular Standard)", { bold: true, size: 22, color: C.darkBlue, spacing: { after: 200 } }),

                p("A. ISO Consultancy Services:", { bold: true, size: 20, color: C.amberInkDeep, spacing: { after: 120 } }),
                ...CONSULTANCY_SERVICES.map(item => boldListItem(item.title, item.text, "numbered-list")),
                
                spacer(120),
                
                p("B. ISO Certification Services:", { bold: true, size: 20, color: C.amberInkDeep, spacing: { after: 120 } }),
                ...CERTIFICATION_SERVICES.map(item => boldListItem(item.title, item.text, "numbered-list")),

                spacer(160),

                // ── PAYMENT TERMS & SCHEDULE ─────────────────────────────
                sectionHeading("Payment Schedule"),
                spacer(80),
                ...PAYMENT_TERMS.map(item => boldListItem(item.title, item.text, "bullet-amber")),
                
                // ── PAGE BREAK FOR LEGAL TERMS ───────────────────────────
                new Paragraph({ children: [new PageBreak()] }),

                // ── TERMS AND CONDITIONS ─────────────────────────────────
                sectionHeading("Terms and Conditions"),
                spacer(100),
                p("1. Validity: This quotation is valid for a period of 30 days from the date of issue.", { spacing: { after: 100 } }),
                p("2. Scope Modification: Any changes to the operational scope or location structure after signing will require a revised commercial proposal.", { spacing: { after: 100 } }),
                p("3. Taxation: All quoted prices are exclusive of applicable Government taxes unless explicitly stated otherwise.", { spacing: { after: 100 } }),
                p("4. Client Responsibilities: The client agrees to provide necessary access to facilities, accurate information, and internal resources to ensure smooth gap analysis and audit progression.", { spacing: { after: 100 } }),
                
                spacer(160),

                // ── NON-DISCLOSURE AND CONFIDENTIALITY ───────────────────
                sectionHeading("Non-Disclosure and Confidentiality Terms"),
                spacer(100),
                p("1. Purpose: Both parties agree that any sensitive business, technical, or financial information shared during the consultancy and certification process shall remain strictly confidential.", { spacing: { after: 100 } }),
                p("2. Protection of Information: Everest International Management Consultancy Training & Agency Pvt. Ltd. (EIMCTA) commits to utilizing the disclosed information solely for the execution of the services outlined in this agreement.", { spacing: { after: 100 } }),
                p("3. Third-Party Disclosure: Confidential data shall not be shared with external auditors or third-party bodies without the explicit written consent of the client, except where mandated by standard accreditation requirements.", { spacing: { after: 100 } }),
                p("4. Survival: The obligations of confidentiality shall survive the completion or termination of this quotation and subsequent service agreements.", { spacing: { after: 100 } }),
            ],
        }],
    });

    return await Packer.toBlob(doc);
}