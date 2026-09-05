import htmlToPdfmake from "html-to-pdfmake";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts?.pdfMake?.vfs ?? pdfFonts?.vfs;

// Converts img src → base64 dataURL
const toBase64 = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

// Replaces all <img src="..."> with base64 in a cloned element
const resolveImages = async (element) => {
  const clone = element.cloneNode(true);
  const imgs = Array.from(clone.querySelectorAll("img"));

  await Promise.all(
    imgs.map(async (img) => {
      try {
        img.src = await toBase64(img.src);
      } catch {
        img.remove();
      }
    })
  );

  return clone;
};

/**
 * HTML → PDF (html-to-pdfmake)
 */
export const htmlToPdf = async (rawElement, fileName = "document.pdf") => {
  let element = rawElement;

  // Smart element resolution
  if (typeof rawElement === "string") {
    element =document.getElementById(rawElement) ||
      document.querySelector(rawElement);
  } else if (rawElement?.current) {
    element = rawElement.current;
  }

  if (!element || typeof element.querySelectorAll !== "function") {
    throw new Error("Invalid element passed to htmlToPdf()");
  }

  // ✅ Resolve images to base64 before converting
  const resolved = await resolveImages(element);

  const content = htmlToPdfmake(resolved.innerHTML);

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    content,
  };

  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.download(fileName);
      resolve(pdfDoc);
    } catch (err) {
      reject(err);
    }
  });
};