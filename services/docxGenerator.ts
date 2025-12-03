import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { ReportData } from "../types";

// Helper to convert points to "half-points" used by docx library (1pt = 2 half-points)
// The Python script requested Arial 11pt.
const FONT_NAME = "Arial";
const FONT_SIZE = 22; // 11pt * 2

export const generateDocxBlob = async (data: ReportData): Promise<Blob> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // 1. Cabeçalho
          new Paragraph({
            children: [
              new TextRun({
                text: "Embrapa",
                bold: true,
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.unitName.toUpperCase(),
                bold: true,
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.areaName,
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
            spacing: { after: 400 }, // Add some space after header
          }),

          // 2. Título do Relatório
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "RELATÓRIO",
                bold: true,
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
            spacing: { before: 200, after: 400 },
          }),

          // 3. Introdução
          new Paragraph({
            children: [
              new TextRun({
                text: "Introdução",
                bold: true,
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.introduction || "Texto da introdução...",
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
            spacing: { after: 300 },
          }),

          // 4. Tópicos
          ...data.topics.flatMap((topic, index) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: topic.title,
                  bold: true,
                  font: FONT_NAME,
                  size: FONT_SIZE,
                }),
              ],
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: topic.content || "Conteúdo do tópico...",
                  font: FONT_NAME,
                  size: FONT_SIZE,
                }),
              ],
              spacing: { after: 200 },
            }),
          ]),

          // 5. Considerações Finais
          new Paragraph({
            children: [
              new TextRun({
                text: "Considerações finais",
                bold: true,
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.finalConsiderations || "Texto das considerações finais...",
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
            spacing: { after: 600 },
          }),

          // 6. Data e Assinatura
          new Paragraph({
            children: [
              new TextRun({
                text: `${data.city}, ${data.date}.`,
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
            spacing: { after: 800 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: data.signerName.toUpperCase(),
                bold: true,
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.signerRole,
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};
