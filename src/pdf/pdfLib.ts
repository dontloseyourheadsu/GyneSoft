import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import diagramaGenitales from "../assets/diagrams/diagrama1_pendiente.svg";
import diagramaCuadrantes from "../assets/diagrams/diagrama2_cuadrado.svg";
import type { ClinicalHistory, ColposcopyEntry, MedicalNote, Patient } from "../types";

const LETTER = { width: 612, height: 792 };
const MARGINS = { top: 40, right: 40, bottom: 60, left: 40 };

type PdfFonts = {
  regular: any;
  bold: any;
};

type Cursor = {
  pdfDoc: PDFDocument;
  page: any;
  y: number;
};

const BLUE = rgb(0, 0.322, 0.8);
const LIGHT_GRAY = rgb(0.98, 0.985, 0.99);
const BORDER_GRAY = rgb(0.87, 0.88, 0.9);
const TEXT_DARK = rgb(0.09, 0.16, 0.3);
const LABEL_GRAY = rgb(0.42, 0.47, 0.55);

const createDocument = async () => {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  return { pdfDoc, fonts: { regular, bold } };
};

const addPage = (pdfDoc: PDFDocument) => pdfDoc.addPage([LETTER.width, LETTER.height]);

const nextPage = (cursor: Cursor) => {
  const page = addPage(cursor.pdfDoc);
  cursor.page = page;
  cursor.y = LETTER.height - MARGINS.top;
};

const ensureSpace = (cursor: Cursor, heightNeeded: number) => {
  if (cursor.y - heightNeeded < MARGINS.bottom) {
    nextPage(cursor);
  }
};

const wrapText = (text: string, font: any, fontSize: number, maxWidth: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(test, fontSize);
    if (width <= maxWidth) {
      current = test;
      return;
    }

    if (current) lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

const drawSectionHeader = (cursor: Cursor, fonts: PdfFonts, text: string) => {
  const height = 18;
  ensureSpace(cursor, height + 6);

  cursor.page.drawRectangle({
    x: MARGINS.left,
    y: cursor.y - height,
    width: LETTER.width - MARGINS.left - MARGINS.right,
    height,
    color: BLUE,
    borderRadius: 2,
  });

  cursor.page.drawText(text, {
    x: MARGINS.left + 6,
    y: cursor.y - height + 4,
    size: 10,
    font: fonts.bold,
    color: rgb(1, 1, 1),
  });

  cursor.y -= height + 8;
};

const drawTextBlock = (
  cursor: Cursor,
  fonts: PdfFonts,
  text: string,
  options: {
    fontSize?: number;
    maxWidth?: number;
    lineHeight?: number;
    color?: any;
  } = {}
) => {
  const fontSize = options.fontSize ?? 9;
  const maxWidth = options.maxWidth ?? (LETTER.width - MARGINS.left - MARGINS.right);
  const lineHeight = options.lineHeight ?? fontSize * 1.35;
  const lines = wrapText(text, fonts.regular, fontSize, maxWidth);
  const heightNeeded = lines.length * lineHeight;

  ensureSpace(cursor, heightNeeded + 4);

  lines.forEach((line) => {
    cursor.page.drawText(line, {
      x: MARGINS.left,
      y: cursor.y - lineHeight,
      size: fontSize,
      font: fonts.regular,
      color: options.color ?? TEXT_DARK,
    });
    cursor.y -= lineHeight;
  });

  cursor.y -= 4;
};

const drawLabeledValue = (
  cursor: Cursor,
  fonts: PdfFonts,
  label: string,
  value: string,
  options: { x: number; colWidth: number }
) => {
  const labelSize = 7;
  const valueSize = 9;
  const labelLineHeight = labelSize * 1.3;
  const valueLineHeight = valueSize * 1.35;

  cursor.page.drawText(label.toUpperCase(), {
    x: options.x,
    y: cursor.y - labelLineHeight,
    size: labelSize,
    font: fonts.bold,
    color: LABEL_GRAY,
  });

  const valueLines = wrapText(value || "---", fonts.regular, valueSize, options.colWidth - 6).slice(0, 2);
  valueLines.forEach((line, index) => {
    cursor.page.drawText(line, {
      x: options.x,
      y: cursor.y - labelLineHeight - valueLineHeight * (index + 1),
      size: valueSize,
      font: fonts.regular,
      color: TEXT_DARK,
    });
  });

  const rowHeight = labelLineHeight + valueLines.length * valueLineHeight + 6;
  return rowHeight;
};

const drawThreeColumnRow = (cursor: Cursor, fonts: PdfFonts, fields: Array<{ label: string; value?: string | null }>) => {
  const width = LETTER.width - MARGINS.left - MARGINS.right;
  const colWidth = width / 3;
  const heightNeeded = 38;

  ensureSpace(cursor, heightNeeded + 4);

  const rowHeight = Math.max(
    ...fields.map((field, index) =>
      drawLabeledValue(cursor, fonts, field.label, field.value || "---", {
        x: MARGINS.left + colWidth * index,
        colWidth,
      })
    )
  );

  cursor.y -= rowHeight + 4;
};

const drawTextArea = (
  cursor: Cursor,
  fonts: PdfFonts,
  title: string,
  content: string
) => {
  const boxHeight = 56;
  ensureSpace(cursor, boxHeight + 12);

  cursor.page.drawRectangle({
    x: MARGINS.left,
    y: cursor.y - boxHeight,
    width: LETTER.width - MARGINS.left - MARGINS.right,
    height: boxHeight,
    color: LIGHT_GRAY,
    borderColor: BORDER_GRAY,
    borderWidth: 0.5,
    borderRadius: 4,
  });

  cursor.page.drawText(title.toUpperCase(), {
    x: MARGINS.left + 8,
    y: cursor.y - 14,
    size: 7,
    font: fonts.bold,
    color: LABEL_GRAY,
  });

  const contentLines = wrapText(content || "---", fonts.regular, 9, LETTER.width - MARGINS.left - MARGINS.right - 16);
  contentLines.slice(0, 3).forEach((line, index) => {
    cursor.page.drawText(line, {
      x: MARGINS.left + 8,
      y: cursor.y - 28 - index * 12,
      size: 9,
      font: fonts.regular,
      color: TEXT_DARK,
    });
  });

  cursor.y -= boxHeight + 10;
};

const dataUrlToBytes = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const svgUrlToPngBytes = async (url: string, width: number, height: number) => {
  const response = await fetch(url);
  const svgText = await response.text();
  const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.src = svgUrl;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(svgUrl);
    throw new Error("Canvas context not available");
  }
  ctx.drawImage(image, 0, 0, width, height);

  URL.revokeObjectURL(svgUrl);

  const dataUrl = canvas.toDataURL("image/png");
  return dataUrlToBytes(dataUrl);
};

const drawHeader = (
  cursor: Cursor,
  fonts: PdfFonts,
  config: Record<string, string>,
  title: string,
  subtitle?: string
) => {
  const height = 60;
  ensureSpace(cursor, height + 12);

  cursor.page.drawLine({
    start: { x: MARGINS.left, y: cursor.y - height },
    end: { x: LETTER.width - MARGINS.right, y: cursor.y - height },
    thickness: 1,
    color: BLUE,
  });

  const name = config.clinic_name || "GYNESOFT";
  cursor.page.drawText(name, {
    x: MARGINS.left + 70,
    y: cursor.y - 20,
    size: 16,
    font: fonts.bold,
    color: BLUE,
  });

  cursor.page.drawText(title, {
    x: MARGINS.left + 70,
    y: cursor.y - 36,
    size: 11,
    font: fonts.regular,
    color: TEXT_DARK,
  });

  if (subtitle) {
    cursor.page.drawText(subtitle, {
      x: MARGINS.left + 70,
      y: cursor.y - 50,
      size: 9,
      font: fonts.regular,
      color: LABEL_GRAY,
    });
  }

  cursor.y -= height + 10;
};

const drawFooter = (cursor: Cursor, fonts: PdfFonts, config: Record<string, string>) => {
  const y = MARGINS.bottom - 20;
  cursor.page.drawLine({
    start: { x: MARGINS.left, y },
    end: { x: LETTER.width - MARGINS.right, y },
    thickness: 0.5,
    color: BORDER_GRAY,
  });

  cursor.page.drawText(config.clinic_address || "Dirección de la Clínica", {
    x: MARGINS.left,
    y: y - 12,
    size: 8,
    font: fonts.regular,
    color: LABEL_GRAY,
  });

  cursor.page.drawText(`Tel: ${config.clinic_phone || "Teléfono"}`, {
    x: MARGINS.left,
    y: y - 24,
    size: 8,
    font: fonts.regular,
    color: LABEL_GRAY,
  });
};

export const buildClinicalHistoryPdf = async (
  patient: Patient | null,
  history: ClinicalHistory,
  config: Record<string, string>
) => {
  const { pdfDoc, fonts } = await createDocument();
  const cursor: Cursor = { pdfDoc, page: addPage(pdfDoc), y: LETTER.height - MARGINS.top };

  drawHeader(cursor, fonts, config, "HISTORIA CLINICA", `${config.doctor_name || ""} ${config.doctor_specialty || ""}`.trim());

  drawSectionHeader(cursor, fonts, "1. DATOS DE IDENTIFICACION");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Nombre", value: patient?.nombre },
    { label: "Fecha", value: history.fecha },
    { label: "Edad", value: patient?.edad },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Sexo", value: patient?.sexo },
    { label: "Nacimiento", value: patient?.fecha_nacimiento },
    { label: "Edo. Civil", value: patient?.estado_civil },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Escolaridad", value: patient?.escolaridad },
    { label: "Ocupacion", value: patient?.ocupacion },
    { label: "Telefono", value: patient?.telefono },
  ]);
  drawTextBlock(cursor, fonts, `Direccion: ${patient?.direccion || "---"}`, { fontSize: 9 });

  drawSectionHeader(cursor, fonts, "2. ANTECEDENTES HEREDOFAMILIARES");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Diabetes", value: history.diabetes },
    { label: "Hipertension", value: history.hipertension },
    { label: "Cancer", value: history.cancer },
  ]);
  drawTextBlock(cursor, fonts, `Otros Heredo: ${history.otros_heredo || "---"}`, { fontSize: 9 });

  drawSectionHeader(cursor, fonts, "3. PERSONALES NO PATOLOGICOS");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Higiene", value: history.higiene_personal },
    { label: "Alimentacion", value: history.calidad_alimentacion },
    { label: "Tabaquismo", value: history.tabaquismo },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Alcoholismo", value: history.alcoholismo },
    { label: "Grupo RH", value: history.grupo_sanguineo_rh },
    { label: "Otros", value: history.otros_no_patologicos },
  ]);

  drawSectionHeader(cursor, fonts, "4. PERSONALES PATOLOGICOS");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Alergias", value: history.alergias },
    { label: "Quirurgicos", value: history.quirurgicos },
    { label: "Traumaticos", value: history.traumaticos },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Transfusionales", value: history.transfusionales },
    { label: "Medicos", value: history.medicos },
    { label: "", value: "" },
  ]);

  drawSectionHeader(cursor, fonts, "5. ANTECEDENTES GINECO-OBSTETRICOS");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Menarca", value: history.menarca },
    { label: "Telarca", value: history.telarca },
    { label: "Pubarca", value: history.pubarca },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Ritmo", value: history.ritmo },
    { label: "Dismenorrea", value: history.dismenorrea },
    { label: "IVSA", value: history.ivsa },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Parejas", value: history.numero_parejas },
    { label: "Metodo ACO", value: history.metodo_anticonceptivo },
    { label: "Gesta", value: history.gesta },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Para", value: history.para },
    { label: "Cesareas", value: history.cesareas },
    { label: "Abortos", value: history.abortos },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Productos", value: history.productos },
    { label: "FUP", value: history.fup },
    { label: "DOC", value: history.doc },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "FUR", value: history.fur },
    { label: "FPP", value: history.fpp },
    { label: "", value: "" },
  ]);

  drawSectionHeader(cursor, fonts, "6. SIGNOS VITALES");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Peso", value: history.peso ? `${history.peso} kg` : null },
    { label: "Talla", value: history.talla ? `${history.talla} cm` : null },
    { label: "IMC", value: history.imc },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "T/A", value: history.ta },
    { label: "F.C.", value: history.fc },
    { label: "F.R.", value: history.fr },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Temp", value: history.temp ? `${history.temp} C` : null },
    { label: "SO2", value: history.so2 },
    { label: "", value: "" },
  ]);

  drawSectionHeader(cursor, fonts, "7. PADECIMIENTO ACTUAL");
  drawTextArea(cursor, fonts, "Padecimiento actual", history.padecimiento_actual || "Sin observaciones.");

  drawSectionHeader(cursor, fonts, "8. EXPLORACION FISICA");
  drawTextArea(cursor, fonts, "Habitus exterior", history.habitus_exterior || "---");
  drawTextArea(cursor, fonts, "Cabeza", history.cabeza || "---");
  drawTextArea(cursor, fonts, "Torax", history.torax || "---");
  drawTextArea(cursor, fonts, "Abdomen", history.abdomen || "---");
  drawTextArea(cursor, fonts, "Genitales", history.genitales || "---");
  drawTextArea(cursor, fonts, "Extremidades", history.extremidades || "---");

  drawSectionHeader(cursor, fonts, "9. CONCLUSION Y TRATAMIENTO");
  drawTextBlock(cursor, fonts, `Estudios de Laboratorio y Gabinete: ${history.estudios_lab || "---"}`, { fontSize: 9 });
  drawTextBlock(cursor, fonts, `Diagnostico: ${history.diagnostico || "---"}`, { fontSize: 9 });
  drawTextBlock(cursor, fonts, `Tratamiento: ${history.tratamiento || "---"}`, { fontSize: 9 });
  drawTextArea(cursor, fonts, "Comentarios", history.comentarios || "---");

  drawFooter(cursor, fonts, config);

  const bytes = await pdfDoc.save();
  return bytes;
};

export const buildMedicalNotePdf = async (
  patient: Patient | null,
  note: MedicalNote,
  config: Record<string, string>
) => {
  const { pdfDoc, fonts } = await createDocument();
  const cursor: Cursor = { pdfDoc, page: addPage(pdfDoc), y: LETTER.height - MARGINS.top };

  drawHeader(cursor, fonts, config, "NOTA MEDICA DE SEGUIMIENTO");

  drawSectionHeader(cursor, fonts, "DATOS DEL PACIENTE");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Nombre", value: patient?.nombre },
    { label: "Fecha/Hora", value: note.fecha_hora?.replace("T", " ") },
    { label: "", value: "" },
  ]);

  drawSectionHeader(cursor, fonts, "SIGNOS VITALES");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Peso", value: note.peso ? `${note.peso} kg` : null },
    { label: "Talla", value: note.talla ? `${note.talla} cm` : null },
    { label: "T/A", value: note.ta },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "F.C.", value: note.fc },
    { label: "F.R.", value: note.fr },
    { label: "Temp", value: note.temp ? `${note.temp} C` : null },
  ]);

  drawSectionHeader(cursor, fonts, "NOTAS DE EVOLUCION");
  drawTextArea(cursor, fonts, "Notas", note.notas || "Sin contenido.");

  drawSectionHeader(cursor, fonts, "DIAGNOSTICO Y PLAN");
  drawTextBlock(cursor, fonts, `Diagnostico: ${note.dx || "---"}`, { fontSize: 9 });
  drawTextBlock(cursor, fonts, `Plan de Tratamiento: ${note.plan || "---"}`, { fontSize: 9 });

  drawSectionHeader(cursor, fonts, "FIRMA MEDICA");
  drawTextBlock(cursor, fonts, `Doctor: ${config.doctor_name || "---"}`, { fontSize: 9 });
  drawTextBlock(cursor, fonts, `Especialidad: ${config.doctor_specialty || "---"}`, { fontSize: 9 });
  drawTextBlock(cursor, fonts, `Ced. Prof: ${config.cedula_prof || "---"}`, { fontSize: 9 });
  if (config.cedula_esp) {
    drawTextBlock(cursor, fonts, `Ced. Esp: ${config.cedula_esp}`, { fontSize: 9 });
  }

  drawFooter(cursor, fonts, config);

  const bytes = await pdfDoc.save();
  return bytes;
};

export const buildColposcopyPdf = async (
  patient: Patient | null,
  study: ColposcopyEntry,
  config: Record<string, string>
) => {
  const { pdfDoc, fonts } = await createDocument();
  const cursor: Cursor = { pdfDoc, page: addPage(pdfDoc), y: LETTER.height - MARGINS.top };

  drawHeader(cursor, fonts, config, "REPORTE DE COLPOSCOPIA", `${config.doctor_name || ""} ${config.doctor_specialty || ""}`.trim());

  drawSectionHeader(cursor, fonts, "DATOS DE IDENTIFICACION");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Paciente", value: patient?.nombre },
    { label: "Edad", value: patient?.edad ? `${patient.edad} anos` : "---" },
    { label: "Referida por", value: study.envio },
  ]);

  drawSectionHeader(cursor, fonts, "ANTECEDENTES GINECO-OBSTETRICOS");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Menarca", value: study.menarca },
    { label: "Ritmo", value: study.ritmo },
    { label: "MPF", value: study.mpf },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "IVSA", value: study.ivsa },
    { label: "Gestas", value: study.gestas },
    { label: "Partos", value: study.partos },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Abortos", value: study.abortos },
    { label: "Cesareas", value: study.cesareas },
    { label: "FUM", value: study.fum },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Ultimo PAP", value: study.ultimo_pap },
    { label: "", value: "" },
    { label: "", value: "" },
  ]);

  drawSectionHeader(cursor, fonts, "HALLAZGOS COLPOSCOPICOS");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Vulva y Vagina", value: study.vulva_vagina },
    { label: "Tipo Colposcopia", value: study.colposcopia_tipo },
    { label: "Cervix", value: study.cervix },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Zona Transformacion", value: study.zona_transformacion },
    { label: "Superficie", value: study.superficie },
    { label: "Bordes", value: study.bordes },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Epitelio Acetoblanco", value: study.epitelio_acetoblanco },
    { label: "Schiller", value: study.prueba_schiller },
    { label: "", value: "" },
  ]);

  drawSectionHeader(cursor, fonts, "OBSERVACIONES ESPECIFICAS");
  drawThreeColumnRow(cursor, fonts, [
    { label: "Patron Vascular", value: study.patron_vascular_velloso },
    { label: "Vasos Atipicos", value: study.vasos_atipicos },
    { label: "Puntilleo", value: study.puntilleo },
  ]);
  drawThreeColumnRow(cursor, fonts, [
    { label: "Mosaico", value: study.mosaico },
    { label: "", value: "" },
    { label: "", value: "" },
  ]);

  drawSectionHeader(cursor, fonts, "DIAGNOSTICO Y PLAN");
  drawTextBlock(cursor, fonts, `Diagnostico Colposcopico: ${study.diagnostico_colposcopico || "---"}`, { fontSize: 9 });
  drawTextBlock(cursor, fonts, `Otras Observaciones: ${study.otras_observaciones || "---"}`, { fontSize: 9 });
  drawTextBlock(cursor, fonts, `Plan de Tratamiento: ${study.plan_tratamiento || "---"}`, { fontSize: 9 });

  drawSectionHeader(cursor, fonts, "APOYO VISUAL");
  const diagramWidth = 220;
  const diagramHeight = 160;
  ensureSpace(cursor, diagramHeight + 30);

  try {
    const [genitalesBytes, cuadrantesBytes] = await Promise.all([
      svgUrlToPngBytes(diagramaGenitales, diagramWidth, diagramHeight),
      svgUrlToPngBytes(diagramaCuadrantes, diagramWidth, diagramHeight),
    ]);

    const genitalesImg = await pdfDoc.embedPng(genitalesBytes);
    const cuadrantesImg = await pdfDoc.embedPng(cuadrantesBytes);

    const startY = cursor.y - diagramHeight;
    const leftX = MARGINS.left;
    const rightX = MARGINS.left + diagramWidth + 20;

    cursor.page.drawImage(genitalesImg, { x: leftX, y: startY, width: diagramWidth, height: diagramHeight });
    cursor.page.drawImage(cuadrantesImg, { x: rightX, y: startY, width: diagramWidth, height: diagramHeight });

    const drawMarks = (marksJson: string | null | undefined, x: number, y: number, width: number, height: number) => {
      if (!marksJson) return;
      try {
        const marks = JSON.parse(marksJson);
        marks.forEach((mark: { x: number; y: number }) => {
          const cx = x + mark.x * width;
          const cy = y + (1 - mark.y) * height;
          cursor.page.drawLine({
            start: { x: cx - 6, y: cy - 6 },
            end: { x: cx + 6, y: cy + 6 },
            thickness: 1,
            color: BLUE,
          });
          cursor.page.drawLine({
            start: { x: cx + 6, y: cy - 6 },
            end: { x: cx - 6, y: cy + 6 },
            thickness: 1,
            color: BLUE,
          });
        });
      } catch {
        return;
      }
    };

    drawMarks(study.diagram_genitales_marks, leftX, startY, diagramWidth, diagramHeight);
    drawMarks(study.diagram_cuadrantes_marks, rightX, startY, diagramWidth, diagramHeight);

    cursor.page.drawText("Genitales Externos", {
      x: leftX,
      y: startY - 12,
      size: 8,
      font: fonts.bold,
      color: LABEL_GRAY,
    });
    cursor.page.drawText("Cuadrantes Cervicales", {
      x: rightX,
      y: startY - 12,
      size: 8,
      font: fonts.bold,
      color: LABEL_GRAY,
    });

    cursor.y = startY - 26;
  } catch {
    drawTextBlock(cursor, fonts, "No se pudo renderizar el diagrama.", { fontSize: 9 });
  }

  if (study.captures && study.captures.length > 0) {
    drawSectionHeader(cursor, fonts, "CAPTURAS");
    const imgWidth = 160;
    const imgHeight = 120;
    const gap = 12;
    let x = MARGINS.left;
    let y = cursor.y;

    for (const cap of study.captures) {
      ensureSpace(cursor, imgHeight + 20);
      if (x + imgWidth > LETTER.width - MARGINS.right) {
        x = MARGINS.left;
        y -= imgHeight + gap;
        cursor.y = y;
      }
      let image;
      if (cap.startsWith("data:image/png")) {
        image = await pdfDoc.embedPng(dataUrlToBytes(cap));
      } else if (cap.startsWith("data:image/jpeg") || cap.startsWith("data:image/jpg")) {
        image = await pdfDoc.embedJpg(dataUrlToBytes(cap));
      }
      if (image) {
        cursor.page.drawImage(image, { x, y: cursor.y - imgHeight, width: imgWidth, height: imgHeight });
      }
      x += imgWidth + gap;
    }
    cursor.y -= imgHeight + 20;
  }

  drawFooter(cursor, fonts, config);

  const bytes = await pdfDoc.save();
  return bytes;
};

export const createPdfBlobUrl = (bytes: Uint8Array) => {
  const blob = new Blob([bytes], { type: "application/pdf" });
  return URL.createObjectURL(blob);
};

export const downloadPdf = (bytes: Uint8Array, filename: string) => {
  const url = createPdfBlobUrl(bytes);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
