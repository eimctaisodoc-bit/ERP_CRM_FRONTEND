import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    BorderStyle,
    AlignmentType,
    ImageRun,
    Header,
    HorizontalPositionAlign,
    HorizontalPositionRelativeFrom,
    VerticalPositionAlign,
    VerticalPositionRelativeFrom,
    Table,
    TableRow,
    TableCell,
    WidthType,
    VerticalAlign,
} from "docx";
// import JSZip from "jszip";

import logo from '../../../../../assest/eimcta.png';
import iso from '../../../../../assest/iso.png';
import { repairDocxBlob } from './repair.js';


// ─── Theme & Typography Configurations ──────────────────────────────────────

const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const baseFontName = fontLight.fontFamily.split(',')[0].replace(/'/g, '').trim();

const THEME = {
    primaryBlue: "1E3A8A",
    accentAmber: "F59E0B", // This is our Orange color
    textMuted: "64748B",
    textDark: "0F172A",
    slate300: "CBD5E1",
};

// Reusable invisible border configuration for clean layout tables
const NO_BORDERS = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getImageBytes(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load image asset from: ${url}`);

    const buffer = await res.arrayBuffer();

    if (buffer.byteLength < 1000) {
        console.error(`WARNING: The image at ${url} is only ${buffer.byteLength} bytes. Check your import path.`);
        throw new Error("Image path returned an HTML fallback instead of binary image data.");
    }

    return buffer;
}

async function getWashedOutImageBytes(url, opacity = 0.25) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");

            ctx.globalAlpha = opacity;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(async (blob) => {
                if (blob) {
                    resolve(await blob.arrayBuffer());
                } else {
                    reject(new Error("Failed to convert canvas to blob"));
                }
            }, "image/png");
        };

        img.onerror = () => reject(new Error(`Failed to load image for washout: ${url}`));
        img.src = url;
    });
}

const textRun = (text, options = {}) => {
    return new TextRun({
        text,
        font: baseFontName,
        bold: options.bold || false,
        size: options.size || 20,
        color: options.color || THEME.textDark,
        ...options
    });
};

const p = (text, options = {}) => {
    const { children, alignment, spacing, ...rest } = options;
    return new Paragraph({
        alignment: alignment || AlignmentType.LEFT,
        spacing: spacing || { after: 80 },
        children: children || [textRun(text, rest)],
    });
};

// ─── Main Generator ─────────────────────────────────────────────────────────

export async function BuildSlaDocx() {

    // Fetch Image Data
    const logoBytes = await getImageBytes(logo);
    const isoBytes = await getWashedOutImageBytes(iso, 0.25);

    const doc = new Document({
        creator: "System",
        title: "Contract Header",
        styles: {
            default: { document: { run: { font: baseFontName, size: 20, color: THEME.textDark } } }
        },
        sections: [{
            properties: {
                page: {
                    // Standard A4 Paper Size (in DXA: 11906 x 16838)
                    size: { width: 11906, height: 16838 },
                    // Margins
                    margin: { top: 144, right: 360, bottom: 360, left: 360 }
                },
            },

            // 1. GLOBAL ISO WATERMARK
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: isoBytes,
                                    transformation: { width: 550, height: 550 },
                                    altText: {
                                        title: "Background Watermark",
                                        description: "Watermark",
                                        name: "watermark.png"
                                    },
                                    floating: {
                                        zIndex: -1,
                                        behindDocument: true,
                                        horizontalPosition: {
                                            relative: HorizontalPositionRelativeFrom.PAGE,
                                            align: HorizontalPositionAlign.CENTER,
                                        },
                                        verticalPosition: {
                                            relative: VerticalPositionRelativeFrom.PAGE,
                                            align: VerticalPositionAlign.CENTER,
                                        },
                                    },
                                }),
                            ],
                        }),
                    ],
                }),
            },

            children: [
                // 2. TOP RIGHT DATE
                p("Date: 2082/01/15", { alignment: AlignmentType.RIGHT, size: 16, color: THEME.textMuted, spacing: { after: 120 } }),

                // 3. LOGO AND COMPANY INFO (Master 3-Column Layout)
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: NO_BORDERS,
                    rows: [
                        new TableRow({
                            children: [
                                // Column 1: LOGO (With Border)
                                new TableCell({
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER,
                                    margins: { top: 60, bottom: 60, left: 60, right: 60 }, // Padding inside border
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 4, color: THEME.slate300 },
                                        bottom: { style: BorderStyle.SINGLE, size: 4, color: THEME.slate300 },
                                        left: { style: BorderStyle.SINGLE, size: 4, color: THEME.slate300 },
                                        right: { style: BorderStyle.SINGLE, size: 4, color: THEME.slate300 },
                                    },
                                    children: [
                                        p("", {
                                            alignment: AlignmentType.CENTER,
                                            children: [
                                                new ImageRun({
                                                    data: logoBytes,
                                                    transformation: { width: 170, height: 100 },
                                                    altText: {
                                                        title: "Logo",
                                                        description: "Official Logo",
                                                        name: "logo.png"
                                                    }
                                                })
                                            ],
                                            spacing: { after: 0 }
                                        })
                                    ],
                                }),

                                // Column 2: SPACER (Creates the gap)
                                new TableCell({
                                    width: { size: 5, type: WidthType.PERCENTAGE },
                                    borders: NO_BORDERS,
                                    children: [p("", { spacing: { after: 0 } })],
                                }),

                                // Column 3: COMPANY INFO
                                new TableCell({
                                    width: { size: 75, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER,
                                    borders: NO_BORDERS,
                                    children: [
                                        // Main Title (size: 36 = 18pt Font)
                                        p("Everest International Management Consultancy & Training Agency Pvt. Ltd.", { alignment: AlignmentType.LEFT, bold: true, size: 36, color: THEME.primaryBlue, spacing: { after: 120 } }),

                                        // Nested 2-Column Table for Contact Info
                                        new Table({
                                            width: { size: 100, type: WidthType.PERCENTAGE },
                                            borders: NO_BORDERS,
                                            rows: [
                                                new TableRow({
                                                    children: [
                                                        // Info Column 1
                                                        new TableCell({
                                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                                            children: [
                                                                p("📍 Kageshwori Manohara-05, Kathmandu", { alignment: AlignmentType.LEFT, size: 18, color: THEME.textDark, spacing: { after: 40 } }),
                                                                p("✉ eimcta.md@gmail.com", { alignment: AlignmentType.LEFT, size: 18, color: THEME.textDark, spacing: { after: 0 } }),
                                                            ]
                                                        }),
                                                        // Info Column 2
                                                        new TableCell({
                                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                                            children: [
                                                                p("🌐 www.everestconsultrain.com", { alignment: AlignmentType.LEFT, size: 18, color: THEME.textDark, spacing: { after: 40 } }),
                                                                p("📞 +977-1-5903211 | 9741766637", { alignment: AlignmentType.LEFT, size: 18, color: THEME.textDark, spacing: { after: 0 } }),
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),

                // 4. HORIZONTAL LINE
                new Paragraph({
                    thematicBreak: true,
                    spacing: { before: 120, after: 120 } // Reduced 'after' spacing to pull the box closer
                }),

                // 5. REF & ISO BOX (Dotted Orange Border)
                new Table({
                    alignment: AlignmentType.RIGHT,
                    width: { size: 0, type: WidthType.AUTO }, // Alternatively, use { size: 100, type: WidthType.PERCENTAGE } to fill page width
                    borders: {
                        top: { style: BorderStyle.DOTTED, size: 0, color: THEME.accentAmber },
                        bottom: { style: BorderStyle.DOTTED, size: 0, color: THEME.accentAmber },
                        left: { style: BorderStyle.DOTTED, size: 0, color: THEME.accentAmber },
                        right: { style: BorderStyle.DOTTED, size: 0, color: THEME.accentAmber },
                        insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" }, // Keeps the invisible line between columns
                        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
                    },
                    rows: [
                        // EDIT 1: We are back to a single TableRow
                        new TableRow({
                            children: [
                                // Column 1 (Left Cell): Reference Number
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE }, // EDIT 2: Width set back to 50%
                                    verticalAlign: VerticalAlign.RIGHT,
                                    margins: { top: 80, bottom: 80 },
                                    children: [
                                        p("ISO 21001:2018", { alignment: AlignmentType.RIGHT, bold: true, size: 29, color: THEME.primaryBlue, spacing: { after: 0 } }),
                                        p("Ref: R.K:232/43/12", { alignment: AlignmentType.RIGHT, bold: true, size: 20, color: THEME.textDark, spacing: { after: 0 } }),
                                    ]
                                }),



                            ]
                        })
                    ]
                }),
                // Add this right after your previous table code

                // A helper for invisible borders so we don't repeat it 20 times

                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                        bottom: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                        left: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                        right: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                        insideVertical: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                        insideHorizontal: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    shading: { fill: "0F172A" }, // slate-900
                                    margins: { top: 110, bottom: 110, left: 170, right: 170 }, // Padding
                                    borders: {
                                        top: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                        bottom: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                        left: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                        right: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                    },
                                    children: [
                                        // Nested table to place the Icon on the left and Text on the right
                                        new Table({
                                            width: { size: 100, type: WidthType.PERCENTAGE },
                                            borders: {
                                                top: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                bottom: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                left: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                right: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                insideVertical: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                insideHorizontal: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                            },
                                            rows: [
                                                new TableRow({
                                                    children: [
                                                        // Column 1: The Icon
                                                        new TableCell({
                                                            width: { size: 8, type: WidthType.PERCENTAGE },
                                                            verticalAlign: VerticalAlign.CENTER,
                                                            borders: {
                                                                top: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                                bottom: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                                left: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                                right: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                            },
                                                            children: [
                                                                new Paragraph({
                                                                    alignment: AlignmentType.LEFT,
                                                                    children: [
                                                                        // REPLACED IMAGERUN WITH TEXTRUN ICON
                                                                        new TextRun({
                                                                            text: "❖", // The Unicode Icon
                                                                            color: "FCD34D", // amber-300
                                                                            size: 64, // 32pt font
                                                                        }),
                                                                    ],
                                                                }),
                                                            ],
                                                        }),

                                                        // Column 2: The Text
                                                        new TableCell({
                                                            width: { size: 92, type: WidthType.PERCENTAGE },
                                                            verticalAlign: VerticalAlign.CENTER,
                                                            borders: {
                                                                top: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                                bottom: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                                left: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                                right: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                                                            },
                                                            children: [
                                                                // Main Heading
                                                                new Paragraph({
                                                                    spacing: { after: 40 }, // Tiny gap between heading and subheading
                                                                    children: [
                                                                        new TextRun({
                                                                            text: "SCOPE OF SERVICES",
                                                                            color: "FCD34D", // amber-300
                                                                            bold: true,
                                                                            size: 28, // Adjusted to 28 (docx uses half-points: 28 = 14pt font)
                                                                        }),
                                                                    ],
                                                                }),

                                                                // Subheading
                                                                new Paragraph({
                                                                    spacing: { before: 0 },
                                                                    children: [
                                                                        new TextRun({
                                                                            text: "Consultancy, Academic ERP, Audit and ISO 21001:2018 EOMS Certification",
                                                                            color: "FFFFFF", // white
                                                                            size: 20, // 20 half-points = 10pt font
                                                                        }),
                                                                    ],
                                                                }),
                                                            ],
                                                        })
                                                    ],
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
                // Adding a bit of space below the new box
                p("", { spacing: { after: 200 } })
            ]
        }]
    });

    const rawBlob = await Packer.toBlob(doc);
    return await repairDocxBlob(rawBlob);

}