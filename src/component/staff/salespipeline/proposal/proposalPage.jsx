import React from "react";
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
    PageBreak,
    UnderlineType
} from "docx";

// import logo from '../../../../../../assest/eimcta.png';
// import iso from '../../../../../../assest/iso.png';
// import watermark from '../../../../../../assest/iso.png';

import logo from '../../../../assest/eimcta.png'
import iso from '../../../../assest/iso.png'
import watermark from '../../../../assest/iso.png'

// ═══════════════════════════════════════════════════════════════════════════
//  STATIC DOCUMENT CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STATIC_REF_NO = "EIMCTA/PROP/2026/0142";

const PROPOSAL_OBJECTIVES = [
    {
        title: "Objective 01: Process & Compliance Standardization",
        desc: "Design and implement robust operational framework aligned with international and national standards."
    },
    {
        title: "Objective 02: Capacity Building & Staff Training",
        desc: "Deliver targeted workshops, active learning modules, and competency evaluation for key personnel."
    },
    {
        title: "Objective 03: Pre-Audit & Certification Readiness",
        desc: "Perform comprehensive internal audit, gap assessment, and liaison for external certification."
    }
];

const PROPOSAL_TERMS = [
    "This proposal is valid for 30 calendar days from the date of issuance.",
    "Mobilization of consultancy services begins upon receipt of formal purchase order or signed agreement.",
    "All customized documents, tools, and training materials remain standard IP of EIMCTA until project commencement.",
    "Payment schedule and commercial milestones shall follow the mutually agreed Service Level Agreement."
];

const NOTES = [
    "To accept this proposal, please sign the Acceptance section below and return a scanned copy to +977 9741766637 (WhatsApp) or info@eimcta.com.np.",
    "Detailed timeline and resource scheduling will be finalized during the kickoff meeting.",
    "Transportation, food/hotel outside Kathmandu Valley & Koshi Province shall be borne by the CLIENT.",
    "Travel time exceeding 2 hours from EIMCTA HQ in Kathmandu to Client location is chargeable @ NPR 2,000.00/hr."
];

const scopeDeliverables = [
    "Comprehensive Organizational Gap Assessment & Baseline Report",
    "Tailored Quality Manual, Standard Operating Procedures (SOPs), and Forms",
    "Staff Training, Awareness Workshops, and Capacity Building Sessions",
    "Internal Audit Execution, Corrective Action Plan (CAP), and Management Review",
    "Pre-Certification Audit Assistance & Liaison with Certification Bodies",
    "Post-Certification Support & Continuous Improvement Guidance"
];

// ═══════════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS & STYLING
// ═══════════════════════════════════════════════════════════════════════════

const FONT = "Roboto";

/** Usable text width: page 11906 twip − left 864 − right 864. */
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

const listItem = (text, bulletReference) => p(text, {
    spacing: { after: 120, line: 360 },
    numbering: { reference: bulletReference, level: 0 },
    color: C.black,
    size: 20
});

const suggestionBlock = (title, points) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
        ...NO_BORDER,
        left: { style: BorderStyle.SINGLE, size: 24, color: C.amberSolid },
    },
    rows: [
        new TableRow({
            children: [
                cell({
                    bg: C.amberWash,
                    margins: { top: 160, bottom: 160, left: 160, right: 120 },
                    children: [
                        p(title, { bold: true, size: 20, color: C.darkBlue, spacing: { after: 120 } }),
                        ...points.map((pt, index) => p(pt, {
                            spacing: { after: 100, line: 360 },
                            numbering: { reference: "bullet-amber", level: 0 },
                            color: C.black,
                            size: 18,
                            bold: index === 1,
                        }))
                    ]
                })
            ]
        })
    ]
});

const checkItem = (label, opts = {}) => p("", {
    spacing: { after: opts.after ?? 100, line: 360 },
    children: [
        tr("☐  ", { bold: true, size: 20, color: C.royalBlue }),
        tr(label, { bold: true, size: 20, color: C.darkBlue }),
    ],
});

const spacer = (after = 200) => p("", { spacing: { after } });

// ═══════════════════════════════════════════════════════════════════════════
//  DOCUMENT TITLE — decorated "BUSINESS & TECHNICAL PROPOSAL" banner
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
//  METADATA BAR — Proposal Ref. / Prepared By / Proposal Validity
// ═══════════════════════════════════════════════════════════════════════════

const metadataBar = (data) => {
    const RULE_TOP = { style: BorderStyle.SINGLE, size: 12, color: C.darkBlue };
    const RULE_BASE = { style: BorderStyle.SINGLE, size: 8, color: C.royalBlue };
    const HAIR = { style: BorderStyle.SINGLE, size: 4, color: C.hairline };

    const metaLabel = (label, color) => new Paragraph({
        spacing: { after: 70, line: 200 },
        children: [
            new TextRun({
                text: label.toUpperCase(),
                font: FONT,
                size: 13,
                bold: true,
                color: color || C.slate,
                characterSpacing: 16,
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
                    text: filled ? String(value) : " ",
                    font: FONT,
                    size: opts.size || 20,
                    bold: true,
                    color: opts.color || C.black,
                }),
            ],
        });
    };

    const metaCell = (label, value, opts = {}) => cell({
        width: opts.width,
        bg: opts.bg || C.slateBg,
        margins: { top: 130, bottom: 130, left: 170, right: 150 },
        borders: {
            top: RULE_TOP,
            bottom: RULE_BASE,
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
        borders: {
            top: RULE_TOP,
            bottom: RULE_BASE,
            left: OFF,
            right: OFF,
            insideHorizontal: OFF,
            insideVertical: HAIR,
        },
        rows: [
            new TableRow({
                cantSplit: true,
                children: [
                    metaCell("Proposal Ref. No.", data.refNumber, {
                        width: 36,
                        bg: C.amberWash,
                        accent: C.amberSolid,
                        labelColor: C.amberInk,
                        color: C.amberInkDeep,
                        ruleColor: C.amberSolid,
                        size: 21,
                    }),
                    metaCell("Proposal Prepared By", data.salesRep, { width: 32 }),
                    metaCell("Validity Period", data.validity || "30 Days from Issuance", { width: 32, last: true }),
                ],
            }),
        ],
    });
};

// ═══════════════════════════════════════════════════════════════════════════
//  SERVICE SELECTION CARD
// ═══════════════════════════════════════════════════════════════════════════

const serviceSelectionCard = () => {
    const FRAME = { style: BorderStyle.SINGLE, size: 8, color: C.royalBlue };
    const TRIM = { style: BorderStyle.SINGLE, size: 4, color: C.amberSolid };
    const INNER = { style: BorderStyle.SINGLE, size: 4, color: C.lightBlue };

    const bandCell = (children, { bg, top, bottom, margins }) => new TableCell({
        columnSpan: 2,
        shading: { fill: bg, type: ShadingType.CLEAR, color: "auto" },
        borders: { top, bottom, left: FRAME, right: FRAME },
        verticalAlign: VerticalAlign.CENTER,
        margins: margins || { top: 100, bottom: 100, left: 170, right: 150 },
        children,
    });

    const gridCell = (children, side, bottom) => new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        shading: { fill: C.white, type: ShadingType.CLEAR, color: "auto" },
        borders: {
            top: OFF,
            bottom: bottom || OFF,
            left: side === "left" ? FRAME : INNER,
            right: side === "left" ? INNER : FRAME,
        },
        verticalAlign: VerticalAlign.TOP,
        margins: { top: 150, bottom: 150, left: side === "left" ? 200 : 170, right: 150 },
        children,
    });

    const bandLabel = (text) => new Paragraph({
        spacing: { after: 0, line: 260 },
        children: [
            new TextRun({ text, bold: true, size: 17, color: C.darkBlue, font: FONT, characterSpacing: 10 }),
        ],
    });

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [CONTENT_WIDTH / 2, CONTENT_WIDTH / 2],
        borders: {
            top: FRAME,
            bottom: FRAME,
            left: FRAME,
            right: FRAME,
            insideHorizontal: INNER,
            insideVertical: INNER,
        },
        rows: [
            new TableRow({
                cantSplit: true,
                children: [
                    bandCell([
                        new Paragraph({
                            spacing: { after: 0, line: 300 },
                            children: [
                                tr("☐   ", { bold: true, size: 24, color: C.white }),
                                tr("PROPOSED SERVICE CATEGORIES", { bold: true, size: 22, color: C.white, characterSpacing: 10 }),
                            ],
                        }),
                    ], {
                        bg: C.royalBlue,
                        top: FRAME,
                        bottom: TRIM,
                        margins: { top: 130, bottom: 130, left: 170, right: 150 },
                    }),
                ],
            }),

            new TableRow({
                cantSplit: true,
                children: [
                    bandCell([bandLabel("CERTIFICATION & QUALITY STANDARDS")], {
                        bg: C.amberWash,
                        top: TRIM,
                        bottom: TRIM,
                        margins: { top: 90, bottom: 90, left: 170, right: 150 },
                    }),
                ],
            }),

            new TableRow({
                cantSplit: true,
                children: [
                    gridCell([
                        p("", {
                            spacing: { after: 100, line: 360 },
                            children: [
                                tr("☐  ISO  ", { bold: true, size: 20, color: C.royalBlue }),
                                tr("____________________", {
                                    size: 20,
                                    bold: true,
                                    color: C.amberSolid,
                                    underline: { type: UnderlineType.SINGLE, color: C.amberSolid },
                                }),
                            ],
                        }),
                        checkItem("GMP (Good Manufacturing Practice)"),
                        checkItem("HACCP Food Safety", { after: 0 }),
                    ], "left"),
                    gridCell([
                        checkItem("OHS Occupational Health"),
                        checkItem("EIA Environmental Impact"),
                        checkItem("IATF 16949 / Automotive", { after: 0 }),
                    ], "right"),
                ],
            }),

            new TableRow({
                cantSplit: true,
                children: [
                    bandCell([bandLabel("CORPORATE CONSULTANCY & AUDIT SERVICES")], {
                        bg: C.amberWash,
                        top: TRIM,
                        bottom: TRIM,
                        margins: { top: 90, bottom: 90, left: 170, right: 150 },
                    }),
                ],
            }),

            new TableRow({
                cantSplit: true,
                children: [
                    gridCell([
                        checkItem("Management Systems Audit"),
                        checkItem("Corporate Capacity Training"),
                        checkItem("Detailed Gap Analysis Report"),
                        checkItem("Compliance / 2nd Party Audit", { after: 0 }),
                    ], "left", FRAME),
                    gridCell([
                        checkItem("Customer Satisfaction Survey"),
                        checkItem("Technical Due Diligence"),
                        checkItem("Third Party Certification Audit", { after: 0 }),
                    ], "right", FRAME),
                ],
            }),
        ],
    });
};

// ═══════════════════════════════════════════════════════════════════════════
//  APPROVAL / ACCEPTANCE SIGNATURE SECTION
// ═══════════════════════════════════════════════════════════════════════════

function createSignatureSection(clientName = "[Client Organization Name]", clientContact = "+977-__________") {
    const partyFieldCell = (text, theme) => new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: theme.fieldBg, type: ShadingType.CLEAR, color: "auto" },
        borders: CELL_BORDERS,
        margins: { top: 120, bottom: 120, left: 140, right: 100 },
        children: [
            new Paragraph({
                spacing: { after: 0, line: 300 },
                children: [new TextRun({ text, bold: true, color: C.darkBlue, size: 18, font: FONT })],
            }),
        ],
    });

    const partyValueCell = (children) => new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        borders: CELL_BORDERS,
        margins: { top: 100, bottom: 100, left: 140, right: 100 },
        children,
    });

    const partyBanner = (theme) => new TableRow({
        cantSplit: true,
        children: [
            new TableCell({
                columnSpan: 2,
                shading: { fill: theme.bannerBg, type: ShadingType.CLEAR, color: "auto" },
                borders: CELL_BORDERS,
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 110, bottom: 110, left: 100, right: 100 },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 0, line: 280 },
                        children: [new TextRun({ text: theme.title, bold: true, color: theme.bannerText, size: 20, font: FONT })],
                    }),
                ],
            }),
        ],
    });

    const partyBlock = (theme, authName, authNameSub, contact, dateText, dateColor) => [
        partyBanner(theme),
        new TableRow({
            cantSplit: true,
            children: [
                partyFieldCell("Authorized Name *", theme),
                partyValueCell(authNameSub ? [
                    new Paragraph({ spacing: { after: 40, line: 300 }, children: [tr(authName, { bold: true })] }),
                    new Paragraph({ spacing: { after: 0, line: 280 }, children: [tr(authNameSub, { size: 16, color: C.slateDark })] })
                ] : [
                    new Paragraph({ spacing: { after: 0, line: 300 }, children: [tr(authName, { bold: true })] })
                ]),
            ]
        }),
        new TableRow({
            cantSplit: true,
            children: [
                partyFieldCell("Contact Number *", theme),
                partyValueCell([new Paragraph({ spacing: { after: 0, line: 300 }, children: [tr(contact)] })]),
            ]
        }),
        new TableRow({
            cantSplit: true,
            height: { value: 800, rule: HeightRule.ATLEAST },
            children: [
                partyFieldCell("Authorized Signature *", theme),
                partyValueCell([new Paragraph({ text: "" })]),
            ]
        }),
        new TableRow({
            cantSplit: true,
            children: [
                partyFieldCell("Date (DD/MM/YY) *", theme),
                partyValueCell([new Paragraph({ spacing: { after: 0, line: 300 }, children: [tr(dateText, { color: dateColor })] })]),
            ]
        }),
        new TableRow({
            cantSplit: true,
            height: { value: 1400, rule: HeightRule.ATLEAST },
            children: [
                partyFieldCell("Company Seal *", theme),
                partyValueCell([new Paragraph({ text: "" })]),
            ]
        }),
    ];

    const blueTheme = { title: "Proposal Issued By (EIMCTA Representative)", bannerBg: C.royalBlue, bannerText: C.white, fieldBg: C.lightBlue };
    const amberTheme = { title: "Proposal Acceptance (Client Representative)", bannerBg: C.amberSolid, bannerText: C.darkBlue, fieldBg: C.amberWash };

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [2646, 7532],
        borders: TABLE_BORDERS,
        rows: [
            new TableRow({
                cantSplit: true,
                children: [
                    new TableCell({
                        columnSpan: 2,
                        shading: { fill: C.darkBlue, type: ShadingType.CLEAR, color: "auto" },
                        borders: CELL_BORDERS,
                        verticalAlign: VerticalAlign.CENTER,
                        margins: { top: 120, bottom: 120, left: 100, right: 100 },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 0, line: 300 },
                                children: [new TextRun({ text: "PROPOSAL APPROVAL & ACCEPTANCE SECTION", bold: true, color: C.white, size: 20, font: FONT, characterSpacing: 8 })],
                            }),
                        ],
                    }),
                ],
            }),
            ...partyBlock(blueTheme, "Shailendra Kumar Kharel", "(Chairman & Managing Director)", "+977-9800000000 / +977-9741766637", "29 / 07 / 2026", C.black),
            ...partyBlock(amberTheme, clientName, null, clientContact, "        /        / 2026", C.slate),
        ]
    });
}

// ═══════════════════════════════════════════════════════════════════════════
//  PROPOSAL DOCUMENT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export async function BuildProposalDocx(dynamicClientData = null, dynamicPricingData = null) {
    const formatAmount = (num) => {
        const val = Number(num);
        if (isNaN(val)) return "NPR 0.00";
        return "NPR " + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const numberToWords = (n) => {
        if (n === 0) return 'Zero';
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const convert = (num) => {
            if (num < 20) return a[num];
            if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + a[num % 10] : '');
            if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convert(num % 100) : '');
            if (num < 1000000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
            return convert(Math.floor(num / 1000000)) + ' Million' + (num % 1000000 !== 0 ? ' ' + convert(num % 1000000) : '');
        };

        const [integerPart, decimalPart] = Number(n).toFixed(2).split('.');
        let result = convert(parseInt(integerPart, 10));
        if (parseInt(decimalPart, 10) > 0) result += ` and ${decimalPart}/100`;
        else result += " and 00/100";
        return result + ' Only.';
    };

    const basePrice = Number(dynamicClientData?.basePrice || 1500000);
    const discountApplied = Number(dynamicClientData?.discountApplied || 0);

    const postDiscountBase = basePrice * (1 - (discountApplied / 100));
    const phase1Amount = postDiscountBase * 0.40;
    const phase2Amount = postDiscountBase * 0.35;
    const phase3Amount = postDiscountBase * 0.25;

    const subTotal = phase1Amount + phase2Amount + phase3Amount;
    const discountAmount = basePrice - subTotal;
    const totalAfterDiscount = subTotal;
    const vatAmount = totalAfterDiscount * 0.13;
    const grandTotal = totalAfterDiscount + vatAmount;

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
    const row = dynamicPricingData?.[0] || {};

    const clientData = {
        clientName: dyn.clientName || row.organizationName || "[Client Organization Name]",
        contactPerson: dyn.contactPerson || row.contactPersonName || "[Contact Person]",
        contactNo: dyn.contactNo || row.contactPersonNumber || "[Phone]",
        address: dyn.address || row.address || "[Client Address, Nepal]",
        companyRegNo: dyn.companyRegNo || row.registrationNumber || "[Reg. Number]",
        branchLocations: dyn.branchLocations || row.branchLocations || "[Branch Locations]",
        email: dyn.email || row.email || "[Email Address]",
        employees: dyn.employees || row.totalEmp_learners || "[No. of Employees]",
        scope: dyn.scope || row.scope || "[Product/Services/Operations]",

        refNumber: dyn.refNumber || STATIC_REF_NO,
        salesRep: dyn.salesRep || "",
        salesContact: dyn.salesContact || "",
        date: dyn.date || "July 29, 2026",
    };

    const doc = new Document({
        creator: "EIMCTA Proposal Engine",
        title: "Commercial & Technical Proposal - EIMCTA",

        numbering: {
            config: [
                {
                    reference: "bullet-amber",
                    levels: [{
                        level: 0, format: LevelFormat.BULLET, text: "■", alignment: AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 420, hanging: 240 } }, run: { color: C.amberSolid, size: 20, font: FONT } },
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
                p(companyData.branchOffice, { size: 20, color: C.slate, spacing: { after: 40 } }),
                p(`Email: ${companyData.email}  |  Contact: ${companyData.phone}`, { size: 20, color: C.slate, spacing: { after: 40 } }),

                spacer(60),

                // ── PROPOSAL TITLE BANNER ───────────────────────────
                ...documentTitleBlock("BUSINESS & TECHNICAL PROPOSAL", "Commercial Offer for Professional Consultancy & System Implementation"),

                spacer(160),

                // ── METADATA BAR ────────────────────────────────────
                metadataBar(clientData),

                spacer(160),

                // ── CLIENT DETAILS ──────────────────────────────────
                sectionHeading("Client Profile & Project Scope"),
                spacer(80),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    columnWidths: [CONTENT_WIDTH / 2, CONTENT_WIDTH / 2],
                    borders: TABLE_BORDERS,
                    rows: [
                        new TableRow({ cantSplit: true, children: [cell({ width: 50, children: [docInfoP("Target Organization", clientData.clientName)] }), cell({ width: 50, children: [docInfoP("Address", clientData.address)] })] }),
                        new TableRow({ cantSplit: true, children: [cell({ width: 50, children: [docInfoP("Co. Registration No", clientData.companyRegNo)] }), cell({ width: 50, children: [docInfoP("Branch Location(s)", clientData.branchLocations)] })] }),
                        new TableRow({ cantSplit: true, children: [cell({ width: 50, children: [docInfoP("Contact Person", clientData.contactPerson)] }), cell({ width: 50, children: [docInfoP("Phone / Email", `${clientData.contactNo} | ${clientData.email}`)] })] }),
                        new TableRow({ cantSplit: true, children: [cell({ width: 50, children: [docInfoP("Target Personnel", clientData.employees)] }), cell({ width: 50, children: [docInfoP("Operational Scope", clientData.scope)] })] }),
                    ],
                }),

                spacer(120),

                // ── SERVICE SELECTION CARD ──────────────────────────
                sectionHeading("Proposed Services & Technical Coverage"),
                spacer(100),
                serviceSelectionCard(),

                spacer(140),

                // ── PROPOSAL EXECUTIVE OVERVIEW ──────────────────────
                sectionHeading("Executive Summary & Engagement Strategy"),
                spacer(80),
                p("EIMCTA is pleased to present this technical and commercial proposal tailored for your organization. Our approach combines rigorous gap analysis, system design, practical training workshops, and thorough internal audit assistance to ensure complete compliance and audit readiness. This proposal outlines the comprehensive scope, key milestones, timeline, and financial investment required for project execution.", { spacing: { after: 200, line: 360 }, alignment: AlignmentType.JUSTIFIED }),

                // ── PROPOSED OBJECTIVES ─────────────────────────────
                sectionHeading("Key Proposal Objectives"),
                spacer(100),
                ...PROPOSAL_OBJECTIVES.flatMap((obj) => [
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            ...NO_BORDER,
                            left: { style: BorderStyle.SINGLE, size: 18, color: C.royalBlue }
                        },
                        rows: [
                            new TableRow({
                                cantSplit: true,
                                children: [
                                    cell({
                                        bg: C.slateBg,
                                        margins: { top: 120, bottom: 120, left: 140, right: 140 },
                                        children: [
                                            p(obj.title, { bold: true, size: 20, color: C.darkBlue, spacing: { after: 40, line: 320 } }),
                                            p(obj.desc, { size: 18, color: C.slateDark, spacing: { after: 0, line: 320 } })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    spacer(80)
                ]),

                // ── FINANCIAL INVESTMENT & COST BREAKDOWN ─────────────
                sectionHeading("Financial Proposal & Commercial Breakdown"),
                spacer(100),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: TABLE_BORDERS,
                    rows: [
                        new TableRow({
                            tableHeader: true,
                            cantSplit: true,
                            children: [
                                new TableCell({ children: [p("SN", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Proposed Project Phase", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Key Deliverables", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Estimated Timeline", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Quality Standard", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Investment (NPR)", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                            ],
                        }),

                        // Phase 1
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ children: [p("1", { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Phase 1: Gap Analysis & Documentation Design", { bold: true, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Gap Assessment Report & Customized SOP Manuals", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Weeks 1 to 4", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("ISO / Standard Compliance", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p(formatAmount(phase1Amount), { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                            ],
                        }),

                        // Phase 2
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ children: [p("2", { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Phase 2: Training Workshops & Rollout Support", { bold: true, spacing: { after: 0, line: 360 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Interactive Staff Training & Active Execution Support", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Weeks 5 to 8", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("KUAHA Active Learning", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p(formatAmount(phase2Amount), { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                            ],
                        }),

                        // Phase 3
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ children: [p("3", { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Phase 3: Internal Audit & Pre-Certification Review", { bold: true, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Full Internal Audit, CAP, & Certification Support", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Weeks 9 to 12", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Audit Readiness Standard", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p(formatAmount(phase3Amount), { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                            ],
                        }),

                        // Subtotal
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ columnSpan: 5, shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p("Proposed Professional Fee (Subtotal)", { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] }),
                                new TableCell({ shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p(formatAmount(subTotal), { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] })
                            ]
                        }),

                        // Discount
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ columnSpan: 5, shading: { fill: C.white }, verticalAlign: "center", children: [p(`Less: Promotional Concession ${discountApplied > 0 ? '(' + discountApplied + '%)' : ''}`, { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] }),
                                new TableCell({ shading: { fill: C.white }, verticalAlign: "center", children: [p(discountApplied > 0 ? formatAmount(discountAmount) : "-", { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] })
                            ]
                        }),

                        // Taxable Amount
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ columnSpan: 5, shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p("Net Taxable Amount", { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] }),
                                new TableCell({ shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p(formatAmount(totalAfterDiscount), { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] })
                            ]
                        }),

                        // VAT
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ columnSpan: 5, shading: { fill: C.white }, verticalAlign: "center", children: [p("Government VAT 13%", { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] }),
                                new TableCell({ shading: { fill: C.white }, verticalAlign: "center", children: [p(formatAmount(vatAmount), { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] })
                            ]
                        }),

                        // Grand Total
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ columnSpan: 5, shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p("Total Proposed Investment (NPR)", { bold: true, color: C.darkBlue, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] }),
                                new TableCell({ shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p(formatAmount(grandTotal), { bold: true, color: C.darkBlue, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] })
                            ]
                        }),

                        // Words
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({
                                    columnSpan: 6, shading: { fill: C.white }, verticalAlign: "center",
                                    children: [
                                        new Paragraph({
                                            spacing: { after: 0, line: 360 },
                                            children: [
                                                new TextRun({ text: "Total Amount in Words: Nepalese Rupees ", bold: true, font: FONT }),
                                                new TextRun({ text: numberToWords(grandTotal), color: "00B0F0", bold: true, font: FONT })
                                            ]
                                        })
                                    ],
                                })
                            ]
                        }),
                    ],
                }),

                // ── SCOPE DELIVERABLES ──────────────────────────────
                spacer(160),
                sectionHeading("Key Deliverables Included in Proposal"),
                spacer(80),
                ...scopeDeliverables.map((item) => listItem(item, "bullet-amber")),

                spacer(140),

                // ── PROPOSAL TERMS ──────────────────────────────────
                sectionHeading("Proposal Validity & Commercial Terms"),
                spacer(80),
                ...PROPOSAL_TERMS.map((term) => listItem(term, "bullet-amber")),

                spacer(60),
                suggestionBlock("Next Steps & Operational Notes", NOTES),

                // ── SIGNATURE / ACCEPTANCE SECTION ──────────────────
                new Paragraph({ spacing: { after: 0 }, children: [new PageBreak()] }),
                sectionHeading("Proposal Acceptance & Authorization"),
                spacer(120),
                createSignatureSection(clientData.clientName, clientData.contactNo),
                p("")
            ],
        }],
    });

    return await Packer.toBlob(doc);
}