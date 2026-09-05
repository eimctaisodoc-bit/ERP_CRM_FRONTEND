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
    VerticalPositionRelativeFrom,
    VerticalPositionAlign,
    TextWrappingType,
    Header
} from "docx";

import logo from "../../../../../assest/eimcta.png";
import iso from "../../../../../assest/iso.png";

// ═══════════════════════════════════════════════════════════════════════════
//  DATA CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const scopeEnglish = [
    "Initial Kick-Off Plan & EOMS Orientation",
    "GAP/SWOT Analysis: Document review & Findings",
    "Re-organize Org Structure & Committees",
    "Printable Items & Maintenance of forms",
    "RALP & DLP Implementation & ERP integration",
    "KUAHA Improvement Program & Data Analysis",
    "ERP System: Configuration & MIS Dashboards",
    "Unit Based Exhibition (UBE) & Evaluations",
    "TNA & CPD Training Need Analysis",
    "Class Observation & Log Deviations",
    "Learner Zoning & Unit-wise targets",
    "Scorecard/KPI & Appraisals",
    "Weekly/Monthly MRM (EOMS Reviews)",
    "Emergency Mock-Up Drills (Fire/Earthquake)",
    "Social Awareness Campaign (SAC) Events",
    "Olympiad: Volunteers & Business Plans",
    "Documentation Control (IP Kit Release)",
    "Suggestion & Feedback Management",
    "Committee Formation & Action Plans",
    "Good Parenting & Guardian Policy",
    "EOMS Academic Audit & Corrective Actions",
    "ISO Certificate Handover Ceremony",
];

const scopeNepali = [
    "सुरुवाती योजना र ओरियन्टेसन",
    "ग्याप/स्वोट विश्लेषण र नतिजा",
    "संस्थागत संरचना पुनर्गठन र समितिहरू",
    "प्रिन्ट सामग्री मार्गदर्शन र फारमहरू",
    "RALP र DLP कार्यान्वयन तथा ERP",
    "KUAHA सुधार कार्यक्रम र तथ्याङ्क विश्लेषण",
    "ERP प्रणाली कन्फिगरेशन र MIS ड्यासबोर्ड",
    "युनिटमा आधारित प्रदर्शनी",
    "तालिम आवश्यकता विश्लेषण र CPD",
    "कक्षा अवलोकन र त्रुटि अभिलेख",
    "विद्यार्थी जोनिङ र युनिट लक्ष्यहरू",
    "स्कोरकार्ड/KPI कार्यान्वयन र मूल्याङ्कन",
    "साप्ताहिक र मासिक समीक्षा बैठक",
    "आपतकालीन पूर्वतयारी अभ्यास",
    "सामाजिक जनचेतना अभियान",
    "ओलम्पियाड र व्यावसायिक योजना",
    "कागजात व्यवस्थापन",
    "सुझाव तथा प्रतिक्रिया व्यवस्थापन",
    "समिति गठन र कार्ययोजना",
    "असल अभिभावकत्व र नीति",
    "शैक्षिक अडिट र सुधारका कार्यहरू",
    "प्रमाणपत्र हस्तान्तरण समारोह",
];

const definitionsEnglish = [
    "ISO: International Organization for Standardization",
    "SA / KPI: Surveillance Audit / Key Performance Indicator",
    "VAT / TDS: Value Added Tax / Tax Deducted at Source",
    "KYC / Proposal: Know Your Customer / 3-year Service Proposal",
];

const definitionsNepali = [
    "ISO: इन्टरनेशनल अर्गनाइजेसन फर स्ट्यान्डर्डाइजेसन",
    "SA / KPI: सर्भिलेन्स अडिट / मुख्य कार्यसम्पादन सूचक",
    "VAT / TDS: भ्याट र स्रोतमा कर कट्टी",
    "KYC / Proposal: ग्राहक पहिचान / ३ वर्षको सेवा प्रस्ताव",
];

const obligationsEnglish = [
    "Client Data Accuracy: EIMCTA takes no responsibility for additional costs, delays, or non-delivery caused by incorrect or altered client information.",
    "Compliance & Legal Liability: CLIENT is solely responsible for corrective actions, ISO implementation, and certificate validity.",
    "Resource Allocation: EIMCTA holds exclusive right to select accreditation body, auditors, trainers, and certification body.",
    "Right to Dismissal: EIMCTA reserves the right to dismiss this Contract before collection of the first payment.",
];

const obligationsNepali = [
    "तथ्याङ्क सत्यता: ग्राहकले दिएको जानकारी गलत भएमा हुने थप लागत वा ढिलाइको जिम्मेवारी EIMCTA ले लिने छैन।",
    "अनुपालन र कानुनी दायित्व: सुधारका कार्यहरू, ISO कार्यान्वयन र प्रमाणपत्र वैधताको जिम्मेवारी ग्राहकको हुनेछ।",
    "स्रोत छनोट: अडिटर, ट्रेनर र प्रमाणीकरण निकाय छनोट गर्ने अधिकार EIMCTA सँग सुरक्षित छ।",
    "खारेजीको अधिकार: पहिलो भुक्तानी प्राप्त हुनु अघि सम्झौता खारेज गर्ने अधिकार EIMCTA मा निहित छ।",
];

const ipEnglish = [
    "Absolute Ownership: All information, records, SOPs, and materials provided are the exclusive intellectual property of EIMCTA.",
    "Strict Prohibition: CLIENT is prohibited from copying, communicating, or transmitting materials to any third party without written consent.",
    "Legal Action: Unauthorized disclosure may result in escalation to District Court for enforcement and judgment.",
    "Indefinite Survival: Confidentiality obligations survive termination and continue indefinitely.",
];

const ipNepali = [
    "पूर्ण स्वामित्व: EIMCTA ले प्रदान गरेका सम्पूर्ण कागजात, SOPs र विवरणहरू EIMCTA को बौद्धिक सम्पत्ति हुन्।",
    "कडा निषेध: लिखित स्वीकृति बिना सामग्री तेस्रो पक्षलाई बाँड्न वा प्रतिलिपि गर्न निषेध छ।",
    "कानुनी कारबाही: अनाधिकृत प्रयोग भएमा जिल्ला अदालतमा कानुनी कारबाही अगाडि बढाउन सकिनेछ।",
    "निरन्तरता: गोपनीयताको नियम सम्झौता सकिएपछि पनि लागू रहनेछ।",
];

// ═══════════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const FONT = "Roboto";

const C = {
    darkBlue: "0A192F",
    royalBlue: "2563EB",
    lightBlue: "E0F2FE",
    slateBg: "F8FAFC",
    slate: "64748B",
    slateDark: "475569",
    black: "0F172A",
    white: "FFFFFF",
    amberSolid: "B45309",
    amberWash: "FFFBEB",
    redDark: "991B1B",
    borderBlue: "BFDBFE",
    borderAmber: "FCD34D",
    borderSlate: "E2E8F0"
};

const NO_BORDER = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
};

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
            ctx.globalAlpha = 0.06; // Fainter watermark for terms & conditions
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (blob) => {
                if (blob) {
                    resolve(await blob.arrayBuffer());
                } else {
                    reject(new Error("Failed to convert canvas"));
                }
            }, "image/png");
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
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
    size: opts.size || 18, // Defaulting to 9pt to fit dense information
    color: opts.color || C.slateDark,
    ...opts,
});

const p = (text, opts = {}) => new Paragraph({
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: opts.spacing || { after: 120, line: 320 },
    borders: opts.borders,
    numbering: opts.numbering,
    children: opts.children || (text ? [tr(text, opts)] : []),
});

const cell = ({ children, width, margins, bg, borders, vAlign }) => {
    return new TableCell({
        children,
        width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
        margins: margins || { top: 100, bottom: 100, left: 120, right: 120 },
        shading: bg ? { fill: bg, type: ShadingType.CLEAR, color: "auto" } : undefined,
        borders: borders || NO_BORDER,
        verticalAlign: vAlign || VerticalAlign.CENTER,
    });
};

const spacer = (after = 160) => p("", { spacing: { after } });

// Bilingual Section Heading
const sectionHeading = (enTitle, npTitle) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    rows: [
        new TableRow({
            children: [
                cell({
                    width: 50, bg: C.slateBg,
                    borders: { ...NO_BORDER, left: { style: BorderStyle.SINGLE, size: 24, color: C.darkBlue } },
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    children: [p(enTitle.toUpperCase(), { bold: true, size: 18, color: C.darkBlue, spacing: { after: 0 } })]
                }),
                cell({
                    width: 50, bg: C.slateBg, borders: NO_BORDER,
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    children: [p(npTitle, { bold: true, size: 18, color: C.amberSolid, alignment: AlignmentType.RIGHT, spacing: { after: 0 } })]
                })
            ]
        })
    ]
});

// Generic Two-Column Box Layout for Bilingual Content
const bilingualTable = (leftContent, rightContent, bgFill = C.white, borderColor = C.borderSlate) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
        left: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
        right: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" }
    },
    rows: [
        new TableRow({
            children: [
                cell({ width: 50, bg: bgFill, vAlign: VerticalAlign.TOP, children: leftContent }),
                cell({ width: 50, bg: bgFill, vAlign: VerticalAlign.TOP, children: rightContent })
            ]
        })
    ]
});

const makeBullets = (items) => items.map(item => p(item, {
    spacing: { after: 80, line: 300 },
    numbering: { reference: "bullet-slate", level: 0 },
    color: C.slateDark,
    size: 17
}));

// ═══════════════════════════════════════════════════════════════════════════
//  DOCUMENT GENERATOR EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export async function BuildBackSideDocx() {
    
    const [isoOriginalBytes, watermarkBytes] = await Promise.all([
        getImageBytes(iso),
        createWatermarkBytes(iso),
    ]);

    const doc = new Document({
        creator: "EIMCTA Document Engine",
        title: "SLA Bilingual Terms & Conditions",
        
        numbering: {
            config: [
                {
                    reference: "bullet-slate",
                    levels: [{
                        level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 360, hanging: 240 } }, run: { color: C.slate, size: 18, font: FONT } },
                    }],
                }
            ],
        },

        styles: {
            default: { document: { run: { font: FONT, size: 18, color: C.slateDark } } },
        },
        
        sections: [{
            properties: {
                page: {
                    size: { width: 11906, height: 16838 }, // A4 Portrait
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
                // ── INTRO CARD (Service Provider & Client) ───────────────────
                bilingualTable(
                    [
                        p("", { children: [tr("Service Provider: ", { bold: true, color: C.darkBlue }), tr("Everest International Management Consultancy & Training Agency Pvt. Ltd. (EIMCTA).")] }),
                        p("", { children: [tr("Client: ", { bold: true, color: C.darkBlue }), tr("The organization desiring to take the services of EIMCTA.")] })
                    ],
                    [
                        p("", { children: [tr("सेवा प्रदायक: ", { bold: true, color: C.darkBlue }), tr("एभरेष्ट इन्टरनेशनल म्यानेजमेन्ट कन्सल्टेन्सी एण्ड ट्रेनिङ्ग एजेन्सी प्रा. लि.।")] }),
                        p("", { children: [tr("ग्राहक: ", { bold: true, color: C.darkBlue }), tr("EIMCTA को सेवा लिन इच्छुक संस्था।")] })
                    ],
                    "EFF6FF", // Light blue BG
                    C.borderBlue
                ),
                spacer(),

                // ── 1. DEFINITIONS ───────────────────────────────────────────
                sectionHeading("1. Definitions", "१. परिभाषाहरू"),
                spacer(80),
                bilingualTable(
                    makeBullets(definitionsEnglish),
                    makeBullets(definitionsNepali),
                    C.white,
                    C.borderSlate
                ),
                spacer(),

                // ── 2. SCOPE OF SERVICES ─────────────────────────────────────
                sectionHeading("2. Scope of Services", "२. सेवाको दायरा"),
                spacer(80),
                bilingualTable(
                    [
                        p("ENGLISH VERSION", { bold: true, color: C.darkBlue, size: 16, spacing: { after: 100 } }),
                        ...makeBullets(scopeEnglish)
                    ],
                    [
                        p("नेपाली संस्करण", { bold: true, color: C.darkBlue, size: 16, spacing: { after: 100 } }),
                        ...makeBullets(scopeNepali)
                    ],
                    C.white,
                    C.borderSlate
                ),
                spacer(),

                // ── 3. FINANCIAL TERMS ───────────────────────────────────────
                sectionHeading("3. Financial Terms, Penalties & Extra Charges", "३. आर्थिक सर्त, जरिवाना तथा अतिरिक्त शुल्क"),
                spacer(80),
                bilingualTable(
                    [
                        p("", { children: [tr("Validity: ", { bold: true }), tr("30 days. All amounts in NRs.")] }),
                        p("", { children: [tr("Taxes: ", { bold: true }), tr("13% VAT & TDS additional to service charge.")] }),
                        p("", { children: [tr("Travel: ", { bold: true }), tr("Local >2 hrs: NRs. 2000/hr. Outside Valley: All costs by CLIENT.")] })
                    ],
                    [
                        p("", { children: [tr("वैधता: ", { bold: true }), tr("३० दिन। सम्पूर्ण रकम नेपाली रुपैयाँमा।")] }),
                        p("", { children: [tr("कर: ", { bold: true }), tr("१३% भ्याट र टीडीएस अतिरिक्त।")] }),
                        p("", { children: [tr("भ्रमण: ", { bold: true }), tr("उपत्यका बाहिरको सम्पूर्ण खर्च ग्राहकले व्यहोर्नुपर्ने।")] })
                    ],
                    C.white,
                    C.borderSlate
                ),
                spacer(80),

                // PENALTY BOX
                bilingualTable(
                    [
                        p("STRICT SCHEDULE PENALTY", { bold: true, color: C.redDark, size: 17, spacing: { after: 80 } }),
                        p("", { children: [tr("Alteration notice must be provided 3 days prior. Failure incurs "), tr("NRs. 16,000 + 13% VAT", { bold: true }), tr(" per man-day.")] })
                    ],
                    [
                        p("तालिका परिवर्तन जरिवाना", { bold: true, color: C.redDark, size: 17, spacing: { after: 80 } }),
                        p("", { children: [tr("३ दिन अगावै सूचना नदिएमा प्रति दिन "), tr("रु. १६,००० + १३% भ्याट", { bold: true }), tr(" जरिवाना लाग्नेछ।")] })
                    ],
                    C.amberWash,
                    C.borderAmber
                ),
                spacer(),

                // ── 4. OBLIGATIONS ───────────────────────────────────────────
                sectionHeading("4. Obligations & Absolute Limitation of Liability", "४. दायित्व र सीमित जवाफदेहिता"),
                spacer(80),
                bilingualTable(
                    makeBullets(obligationsEnglish),
                    makeBullets(obligationsNepali),
                    C.white,
                    C.borderSlate
                ),
                spacer(),

                // ── 5. INTELLECTUAL PROPERTY ─────────────────────────────────
                sectionHeading("5. Intellectual Property & Non-Disclosure", "५. बौद्धिक सम्पत्ति र गोपनीयता संरक्षण"),
                spacer(80),
                bilingualTable(
                    makeBullets(ipEnglish),
                    makeBullets(ipNepali),
                    C.white,
                    C.borderSlate
                ),
                spacer(),

                // ── 6. TERMINATION ───────────────────────────────────────────
                sectionHeading("6. Contract Termination & Dispute Resolution", "६. सम्झौता खारेजी र विवाद समाधान"),
                spacer(80),
                bilingualTable(
                    [
                        p("", { children: [tr("Termination by CLIENT: ", { bold: true }), tr("If the CLIENT wishes to terminate this Contract, they must provide a 60-day prior written notice to EIMCTA.")] }),
                        p("", { children: [tr("Governing Law: ", { bold: true }), tr("This Agreement is governed by the laws of Nepal. Disputes shall first be attempted amicably. If unresolved, it proceeds to Arbitration Act 2053 BS.")] })
                    ],
                    [
                        p("", { children: [tr("ग्राहकद्वारा खारेजी: ", { bold: true }), tr("ग्राहकले सम्झौता खारेज गर्न चाहेमा ६० दिन अगावै EIMCTA लाई लिखित सूचना दिनुपर्नेछ।")] }),
                        p("", { children: [tr("कानुन र अधिकारक्षेत्र: ", { bold: true }), tr("यो सम्झौता नेपालको कानुन बमोजिम हुनेछ। विवादहरू सुरुमा आपसी समझदारीमा समाधान गरिनेछ।")] })
                    ],
                    C.white,
                    C.borderSlate
                ),
                spacer(),

                // ── 7. SIGNATURES ────────────────────────────────────────────
                sectionHeading("7. Signatures", "७. हस्ताक्षर"),
                spacer(80),
                bilingualTable(
                    [
                        p("EIMCTA", { bold: true, size: 18, color: C.darkBlue, alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                        p("Authorized Signatory", { size: 16, color: C.slate, alignment: AlignmentType.CENTER, spacing: { after: 700 } }), // Large spacing for signature
                        p("Name / Signature / Date / Stamp", { size: 15, bold: true, color: C.slateDark, alignment: AlignmentType.CENTER, borders: { top: { style: BorderStyle.SINGLE, size: 4, color: C.slateDark, space: 10 } } })
                    ],
                    [
                        p("THE CLIENT", { bold: true, size: 18, color: C.darkBlue, alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                        p("Authorized Signatory", { size: 16, color: C.slate, alignment: AlignmentType.CENTER, spacing: { after: 700 } }), // Large spacing for signature
                        p("Name / Signature / Date / Stamp", { size: 15, bold: true, color: C.slateDark, alignment: AlignmentType.CENTER, borders: { top: { style: BorderStyle.SINGLE, size: 4, color: C.slateDark, space: 10 } } })
                    ],
                    C.white,
                    "CBD5E1" // slate-300
                ),
                spacer(),

                // ── FOOTER NOTES ─────────────────────────────────────────────
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: C.borderBlue },
                        bottom: { style: BorderStyle.SINGLE, size: 4, color: C.borderBlue },
                        left: { style: BorderStyle.SINGLE, size: 4, color: C.borderBlue },
                        right: { style: BorderStyle.SINGLE, size: 4, color: C.borderBlue },
                    },
                    rows: [
                        new TableRow({
                            children: [
                                cell({
                                    bg: "EFF6FF", // Light Blue
                                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                                    children: [
                                        p("This document has been prepared as a bilingual service agreement format for EIMCTA consultancy, training, documentation, and ISO 21001:2018 EOMS support services.", { size: 16, color: C.slateDark, bold: true, alignment: AlignmentType.CENTER })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                
                // Copyright & Document Ref
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: { top: { style: BorderStyle.SINGLE, size: 4, color: C.borderSlate } },
                    margins: { top: 80, bottom: 0, left: 0, right: 0 },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: NO_BORDER,
                                    children: [p("© Everest International Management Consultancy & Training Agency Pvt. Ltd.", { size: 14, color: C.slate, spacing: { before: 80, after: 0 } })]
                                }),
                                new TableCell({
                                    borders: NO_BORDER,
                                    children: [p("EIMCTA / ISO-MOU / 2024", { size: 14, color: C.slate, alignment: AlignmentType.RIGHT, spacing: { before: 80, after: 0 } })]
                                })
                            ]
                        })
                    ]
                })

            ],
        }],
    });

    return await Packer.toBlob(doc);
}