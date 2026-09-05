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

import logo from '../../../../../../assest/eimcta.png';
import iso from '../../../../../../assest/iso.png';
import watermark from '../../../../../../assest/iso.png';

// ═══════════════════════════════════════════════════════════════════════════
//  STATIC DOCUMENT CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fixed reference number printed in the metadata bar. The two sales fields
 * beside it are intentionally left as ruled blank lines to be completed by
 * hand on the printed copy, so they have no static default.
 */
const STATIC_REF_NO = "EIMCTA/SLA/2026/0142";

const ANNEXES_DETAILS = [
    {
        title: "Annexure - 01: Service Details",
        desc: "Comprehensive scope of work, technical specifications, resource allocation, and milestone deliverables."
    },
    {
        title: "Annexure - 02: Terms, Conditions & Definitions",
        desc: "Governing legal framework, client responsibilities, validity, and dispute resolution."
    }
];

const PAYMENT_TERMS = [
    "40% of Grand Total on Signing of Contract",
    "30% on Submission of Documents",
    "20% Prior Booking of Training",
    "10% on Prior Audit and Certification",
];

const NOTES = [
    "Once agreed and signed, please revert scanned copy of this document to +977 9741766637 (WhatsApp) or info@eimcta.com.np to proceed further.",
    "Kindly read, understand, agree and sign off Annexure-01 and Annexure-02 before signing this SLA/Contract.",
    "Transportation, food/hotel outside Kathmandu Valley & Koshi Province shall be borne by the CLIENT only.",
    "If travel time from EIMCTA HQ in KTM to Client Location exceeds 2 hrs., it is chargeable @ NPR 2,000.00/hr.",
];

const additionalCosts = [
    "Full Time EOMS Officer (Vice Principal)",
    "Data Entry Operator (DEO) one/250 Learners",
    "Printables Flex, Board, Press Items (2000/Section or Class room)",
    "Time for Educators to evaluate CW/HW and Unitwise Test",
    "Cost for Monthly Appraisal Prizes: 1st Prize, 2nd Prize and 3rd Prize with Certification and Rolling Trophy",
    "Book Free Friday (Unit Based Exhibition & Integrated Classes)",
    "Month-end School off for Monthly Review Meeting",
    "Early Child (Play Group) Curriculum for Emotional Development - with separate facility to take rest, take food, Indoor Activity Space, Outdoor Facility Space"
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

/**
 * Cell-level variant of TABLE_BORDERS. A TableCell accepts only the four
 * edges — insideHorizontal / insideVertical are table-level keys and are
 * silently dropped, so they are omitted here rather than deleted later.
 */
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
    // `border` is the correct Paragraph key in docx; `borders` is kept for
    // backwards compatibility with existing call sites.
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

const divider = () =>
    new Paragraph({
        spacing: { before: 120, after: 180 },
        border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: "1E3A8A" } },
    });

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

// ═══════════════════════════════════════════════════════════════════════════
//  DOCUMENT TITLE — decorated "SERVICE LEVEL AGREEMENT" banner
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
//  METADATA BAR — Ref. No. / Sales Representative / Sales Contact
//
//  Design: a single three-up strip framed by a heavy dark-blue rule above and
//  a royal-blue rule below, split by hairline dividers.
//
//    • Ref. No.              → STATIC value, given an amber accent bar, amber
//                              wash, and deep-orange ink so the eye lands on
//                              it first. It is the document's identity.
//    • Sales Representative  → ruled blank line for hand completion
//    • Sales Contact         → ruled blank line for hand completion
//
//  The blank fields are drawn with a paragraph bottom border rather than a run
//  of underscore characters, so each line prints as one clean, evenly
//  weighted rule that always spans the full column.
// ═══════════════════════════════════════════════════════════════════════════

const metadataBar = (data) => {
    const RULE_TOP = { style: BorderStyle.SINGLE, size: 12, color: C.darkBlue };
    const RULE_BASE = { style: BorderStyle.SINGLE, size: 8, color: C.royalBlue };
    const HAIR = { style: BorderStyle.SINGLE, size: 4, color: C.hairline };

    // Tiny, wide-tracked caps — reads as a field label, not as content.
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

    // Underlined value slot. Renders the value when one exists, otherwise an
    // empty ruled line of the same height — so filled and blank columns stay
    // perfectly aligned.
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
        // Twips, proportional to 36 / 32 / 32 of the usable text width.
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
                    metaCell("Ref. No.", data.refNumber, {
                        width: 36,
                        bg: C.amberWash,
                        accent: C.amberSolid,
                        labelColor: C.amberInk,
                        color: C.amberInkDeep,
                        ruleColor: C.amberSolid,
                        size: 21,
                    }),
                    metaCell("Sales Representative", data.salesRep, { width: 32 }),
                    metaCell("Sales Contact", data.salesContact, { width: 32, last: true }),
                ],
            }),
        ],
    });
};

// ═══════════════════════════════════════════════════════════════════════════
//  SERVICE SELECTION CARD — "CONSULTANCY FOR CERTIFICATION"
//
//  Structure (one single Table, five rows — not four stacked tables):
//
//    Row 1  ┃ ☐ CONSULTANCY FOR CERTIFICATION      (royal-blue banner, span 2)
//    Row 2  ┃ CERTIFICATION STANDARDS              (amber band, span 2)
//    Row 3  ┃ ISO ____ / GMP / HACCP  │  OHS / EIA / IATF 16949...
//    Row 4  ┃ OTHER PROFESSIONAL SERVICES          (amber band, span 2)
//    Row 5  ┃ 4 service checkboxes    │  3 service checkboxes
//
//  Collapsing this into one table is what makes the block hold together:
//  stacked tables leave hairline seams between them in Word, their outer
//  frames never line up to the pixel, and each one can break away onto a
//  different page. One table with cantSplit rows behaves as a single unit.
// ═══════════════════════════════════════════════════════════════════════════

const serviceSelectionCard = () => {
    const FRAME = { style: BorderStyle.SINGLE, size: 8, color: C.royalBlue };
    const TRIM = { style: BorderStyle.SINGLE, size: 4, color: C.amberSolid };
    const INNER = { style: BorderStyle.SINGLE, size: 4, color: C.lightBlue };

    // Full-width band spanning both columns (banners and sub-headers).
    const bandCell = (children, { bg, top, bottom, margins }) => new TableCell({
        columnSpan: 2,
        shading: { fill: bg, type: ShadingType.CLEAR, color: "auto" },
        borders: { top, bottom, left: FRAME, right: FRAME },
        verticalAlign: VerticalAlign.CENTER,
        margins: margins || { top: 100, bottom: 100, left: 170, right: 150 },
        children,
    });

    // One half of a checkbox grid row. `side` picks which edge carries the
    // outer frame and which carries the inner divider.
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
            // ── Row 1: primary service banner ────────────────────────────
            new TableRow({
                cantSplit: true,
                children: [
                    bandCell([
                        new Paragraph({
                            spacing: { after: 0, line: 300 },
                            children: [
                                tr("☐   ", { bold: true, size: 24, color: C.white }),
                                tr("CONSULTANCY FOR CERTIFICATION", { bold: true, size: 22, color: C.white, characterSpacing: 10 }),
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

            // ── Row 2: standards band ────────────────────────────────────
            new TableRow({
                cantSplit: true,
                children: [
                    bandCell([bandLabel("CERTIFICATION STANDARDS")], {
                        bg: C.amberWash,
                        top: TRIM,
                        bottom: TRIM,
                        margins: { top: 90, bottom: 90, left: 170, right: 150 },
                    }),
                ],
            }),

            // ── Row 3: standards checkbox grid ───────────────────────────
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
                        checkItem("GMP"),
                        checkItem("HACCP", { after: 0 }),
                    ], "left"),
                    gridCell([
                        checkItem("OHS"),
                        checkItem("EIA"),
                        checkItem("IATF 16949...", { after: 0 }),
                    ], "right"),
                ],
            }),

            // ── Row 4: other services band ───────────────────────────────
            new TableRow({
                cantSplit: true,
                children: [
                    bandCell([bandLabel("OTHER PROFESSIONAL SERVICES")], {
                        bg: C.amberWash,
                        top: TRIM,
                        bottom: TRIM,
                        margins: { top: 90, bottom: 90, left: 170, right: 150 },
                    }),
                ],
            }),

            // ── Row 5: other services checkbox grid ──────────────────────
            new TableRow({
                cantSplit: true,
                children: [
                    gridCell([
                        checkItem("Management Systems Audit"),
                        checkItem("Corporate Training"),
                        checkItem("Gap Analysis"),
                        checkItem("Second Party / Compliance Audit", { after: 0 }),
                    ], "left", FRAME),
                    gridCell([
                        checkItem("Customer Survey"),
                        checkItem("Due Diligence"),
                        checkItem("Third Party / Compliance / Certification Audit", { after: 0 }),
                    ], "right", FRAME),
                ],
            }),
        ],
    });
};

// ═══════════════════════════════════════════════════════════════════════════
//  APPROVAL / SIGNATURE SECTION
//
//  The "APPROVAL SECTION (AUTHORISED SIGNATORY ONLY)" bar is a normal first
//  row — deliberately NOT marked `tableHeader`, because a header row is what
//  Word repeats at the top of every page the table spills onto. Combined with
//  `cantSplit` on every row (no row is ever torn in half) and a hard page
//  break before the section, the bar is printed exactly once.
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

    const blueTheme = { title: "First Party (Service Provider - EIMCTA)", bannerBg: C.royalBlue, bannerText: C.white, fieldBg: C.lightBlue };
    const amberTheme = { title: "Second Party (Client Organization)", bannerBg: C.amberSolid, bannerText: C.darkBlue, fieldBg: C.amberWash };

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        // Twips, proportional to 26 / 74 of the usable text width.
        columnWidths: [2646, 7532],
        borders: TABLE_BORDERS,
        rows: [
            // ── Section bar — printed ONCE. No `tableHeader: true` here, or
            //    Word would reprint it at the top of every continuation page.
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
                                children: [new TextRun({ text: "APPROVAL SECTION (AUTHORISED SIGNATORY ONLY)", bold: true, color: C.white, size: 20, font: FONT, characterSpacing: 8 })],
                            }),
                        ],
                    }),
                ],
            }),
            // ── Row group 1: First Party (Service Provider - EIMCTA) — blue theme
            ...partyBlock(blueTheme, "Shailendra Kumar Kharel", "(Chairman & Managing Director)", "+977-9800000000 / +977-9741766637", "29 / 07 / 2026", C.black),
            // ── Row group 2: Second Party (Client Organization) — amber theme
            ...partyBlock(amberTheme, clientName, null, clientContact, "        /        / 2026", C.slate),
        ]
    });
}

// ═══════════════════════════════════════════════════════════════════════════
//  DOCUMENT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export async function BuildSlaDocx(dynamicClientData = null, dynamicPricingData = null) {
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

    // Merge rather than replace: previously `dynamicClientData || { ...defaults }`
    // discarded every default the moment any dynamic data was supplied, which
    // left refNumber / date undefined. Field-by-field fallback keeps the static
    // values reliable while still honouring anything explicitly passed in.
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

        // ── Metadata bar ────────────────────────────────────────────────
        refNumber: dyn.refNumber || STATIC_REF_NO,   // static, always printed
        salesRep: dyn.salesRep || "",                // blank ruled line
        salesContact: dyn.salesContact || "",        // blank ruled line

        date: dyn.date || "July 29, 2026",
    };

    const doc = new Document({
        creator: "EIMCTA Document Engine",
        title: "Service Level Agreement (SLA) - EIMCTA",

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

                // ── DOCUMENT TITLE (decorated "SERVICE LEVEL AGREEMENT" banner) ──
                ...documentTitleBlock("SERVICE LEVEL AGREEMENT", "Professional Consultancy, Certification & Compliance Services"),

                spacer(160),

                // ── TOP METADATA BLOCK (REF. NO. / SALES REPRESENTATIVE / SALES CONTACT) ──
                metadataBar(clientData),

                spacer(160),

                // ── CLIENT & SERVICE INFORMATION ─────────────────────────
                sectionHeading("Client & Operational Details"),
                spacer(80),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    columnWidths: [CONTENT_WIDTH / 2, CONTENT_WIDTH / 2],
                    borders: TABLE_BORDERS,
                    rows: [
                        new TableRow({ cantSplit: true, children: [cell({ width: 50, children: [docInfoP("Organization Name", clientData.clientName)] }), cell({ width: 50, children: [docInfoP("Address", clientData.address)] })] }),
                        new TableRow({ cantSplit: true, children: [cell({ width: 50, children: [docInfoP("Co. Registration No", clientData.companyRegNo)] }), cell({ width: 50, children: [docInfoP("Branch Location(s)", clientData.branchLocations)] })] }),
                        new TableRow({ cantSplit: true, children: [cell({ width: 50, children: [docInfoP("Contact Person", clientData.contactPerson)] }), cell({ width: 50, children: [docInfoP("Phone / Email", `${clientData.contactNo} | ${clientData.email}`)] })] }),
                        new TableRow({ cantSplit: true, children: [cell({ width: 50, children: [docInfoP("No. of Employees", clientData.employees)] }), cell({ width: 50, children: [docInfoP("Operational Scope", clientData.scope)] })] }),
                    ],
                }),

                spacer(120),

                // ── SUBJECT: PROFESSIONAL SERVICE(S) PROPOSAL FOR ──────────
                sectionHeading("Subject: Professional Service(s) Proposal For"),
                spacer(100),

                // ═══ Service Selection Card — ONE unified table ═══════════
                serviceSelectionCard(),

                spacer(140),

                sectionHeading("Preamble & Operational Terms"),
                spacer(80),
                p("This SLA is submitted on enquiry of the client or its representative(s). After signing this SLA document, and after receiving initial payment from the second party (the client) only, the first party (the service provider) will start progressing the agreed services. Hence, the first party shall not be liable for service hampered or delayed due to illegal, incorrect, or delay in providing information to the service provider (the first party). It's considered that the attached Annexures 1 and 2, as critical parts of this SLA, are fully read, understood, and agreed by both parties before signing off these documents.", { spacing: { after: 200, line: 360 }, alignment: AlignmentType.JUSTIFIED }),

                // ── SERVICE DETAILS / COST TABLE ─────────────────────────
                sectionHeading("Service Details / Cost Table"),
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
                                new TableCell({ children: [p("Description of Services", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Deliverables", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Timeline", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Quality Benchmark", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Total Cost (NPR)", { bold: true, color: C.white, alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.darkBlue }, verticalAlign: "center" }),
                            ],
                        }),

                        // Phase 1
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ children: [p("1", { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Phase 1: Gap Analysis, System Design & Documentation", { bold: true, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Gap Report, QMS Manual, & SOPs", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Month 1: Weeks 1 to 4 (Baseline & Drafting)", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("ISO / National Compliance Standard", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p(formatAmount(phase1Amount), { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                            ],
                        }),

                        // Phase 2
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ children: [p("2", { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Phase 2: Capacity Building, Training & Rollout Support", { bold: true, spacing: { after: 0, line: 360 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Staff Training Sessions, Workshops, & Implementation", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Month 2: Weeks 5 to 8 (Training & Execution)", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p("KUAHA & Active Learning Models", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                                new TableCell({ children: [p(formatAmount(phase2Amount), { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })], shading: { fill: C.lightBlue }, verticalAlign: "center" }),
                            ],
                        }),

                        // Phase 3
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ children: [p("3", { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Phase 3: Internal Audit, Review & Certification Support", { bold: true, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Internal Audit Report, CAP, & Certification Liaison", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("Month 3: Weeks 9 to 12 (Audit & Closure)", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p("ISO 9001 / 21001 / OHS Standards", { alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                                new TableCell({ children: [p(formatAmount(phase3Amount), { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })], shading: { fill: C.white }, verticalAlign: "center" }),
                            ],
                        }),

                        // Subtotal
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ columnSpan: 5, shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p("Subtotal / Total Cost", { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] }),
                                new TableCell({ shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p(formatAmount(subTotal), { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] })
                            ]
                        }),

                        // Discount
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ columnSpan: 5, shading: { fill: C.white }, verticalAlign: "center", children: [p(`Less: Discount ${discountApplied > 0 ? '(' + discountApplied + '%)' : ''}`, { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] }),
                                new TableCell({ shading: { fill: C.white }, verticalAlign: "center", children: [p(discountApplied > 0 ? formatAmount(discountAmount) : "-", { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] })
                            ]
                        }),

                        // Taxable Amount
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ columnSpan: 5, shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p("Taxable Amount", { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] }),
                                new TableCell({ shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p(formatAmount(totalAfterDiscount), { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] })
                            ]
                        }),

                        // VAT
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ columnSpan: 5, shading: { fill: C.white }, verticalAlign: "center", children: [p("VAT 13%", { bold: true, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] }),
                                new TableCell({ shading: { fill: C.white }, verticalAlign: "center", children: [p(formatAmount(vatAmount), { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] })
                            ]
                        }),

                        // Grand Total
                        new TableRow({
                            cantSplit: true,
                            children: [
                                new TableCell({ columnSpan: 5, shading: { fill: C.lightBlue }, verticalAlign: "center", children: [p("Grand Total Investment (NPR)", { bold: true, color: C.darkBlue, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })] }),
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
                                                new TextRun({ text: "Grand Total Amount in Words: Nepalese Rupees ", bold: true, font: FONT }),
                                                new TextRun({ text: numberToWords(grandTotal), color: "00B0F0", bold: true, font: FONT })
                                            ]
                                        })
                                    ],
                                })
                            ]
                        }),
                    ],
                }),

                // ── PAYMENT TERMS & SCHEDULE ─────────────────────────────
                spacer(160),
                sectionHeading("Payment Terms & Schedule"),
                spacer(80),
                ...PAYMENT_TERMS.map((term) => listItem(term, "bullet-amber")),
                spacer(140),

                // ── ATTACHED / INCLUDED ANNEXURES ───────────────────────
                sectionHeading("Attached / Included Annexures"),
                spacer(100),
                ...ANNEXES_DETAILS.flatMap((annex) => [
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
                                            p(annex.title, { bold: true, size: 20, color: C.darkBlue, spacing: { after: 40, line: 320 } }),
                                            p(annex.desc, { size: 18, color: C.slateDark, spacing: { after: 0, line: 320 } })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    spacer(80)
                ]),

                spacer(60),
                suggestionBlock("Operational Notes", NOTES),
                spacer(100),

                // ── ADDITIONAL REQUIREMENTS ──────────────────────────────
                sectionHeading("Note to the Clients: Additional Operational Considerations"),
                spacer(80),
                ...additionalCosts.map(item => listItem(item, "bullet-amber")),

                // ── SIGNATURE SECTION ────────────────────────────────────
                //  Hard page break: the approval block always begins on a
                //  clean page and fits entirely within it, so the section bar
                //  can never be reprinted as a continuation header.
                new Paragraph({ spacing: { after: 0 }, children: [new PageBreak()] }),
                sectionHeading("Authorization & Contract Sign-Off"),
                spacer(120),
                createSignatureSection(clientData.clientName, clientData.contactNo),
                p("")
            ],
        }],
    });

    return await Packer.toBlob(doc);
}
