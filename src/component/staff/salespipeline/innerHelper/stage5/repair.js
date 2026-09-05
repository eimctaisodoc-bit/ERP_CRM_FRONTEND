import JSZip from "jszip"; // Ensure you have installed this: npm install jszip

export async function repairDocxBlob(blob) {
  try {
    const zip = await JSZip.loadAsync(blob);

    const xmlFiles = Object.keys(zip.files).filter(
      (name) => name.endsWith(".xml") || name.endsWith(".rels")
    );

    for (const fileName of xmlFiles) {
      const file = zip.file(fileName);
      if (!file) continue;

      let xml = await file.async("string");

      // Remove invalid XML control characters
      xml = xml.replace(
        /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,
        ""
      );

      // Fix empty image names
      xml = xml.replace(
        /<pic:cNvPr\b([^>]*?)name=""([^>]*)\/>/g,
        `<pic:cNvPr$1name="image"$2/>`
      );

      // Fix missing image names
      let picIndex = 1;
      xml = xml.replace(
        /<pic:cNvPr\b((?!name=)[^>]*)\/>/g,
        () => `<pic:cNvPr id="${picIndex++}" name="image-${picIndex}"/>`
      );

      // Fix missing docPr names
      let docPrIndex = 1;
      xml = xml.replace(
        /<wp:docPr\b([^>]*?)\/>/g,
        (match, attrs) => {
          if (/name="/.test(attrs)) return match;
          return `<wp:docPr${attrs} name="Picture ${docPrIndex++}"/>`;
        }
      );

      // Remove empty hyperlinks
      xml = xml.replace(
        /<w:hyperlink[^>]*r:id=""[^>]*>/g,
        "<w:r>"
      );

      // Validate XML
      try {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(xml, "application/xml");

        if (parsed.querySelector("parsererror")) {
          console.warn(`XML parse error in ${fileName}`);
        }
      } catch (e) {
        console.warn(`Validation failed for ${fileName}`, e);
      }

      zip.file(fileName, xml);
    }

    return await zip.generateAsync({
      type: "blob",
      mimeType: DOCX_MIME_TYPE,
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });
  } catch (error) {
    console.error("DOCX repair failed:", error);
    return blob;
  }
}