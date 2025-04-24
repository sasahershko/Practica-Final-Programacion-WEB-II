const express = require('express');
const PDFDocument = require('pdfkit');
const pdfRouter = express.Router();


/**
 * @swagger
 * /api/pdf:
 *   get:
 *     summary: Generate and download a PDF file
 *     description: Creates a simple PDF document and returns it as a downloadable file.
 *     tags: [PDF]
 *     produces:
 *       - application/pdf
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
pdfRouter.get('/', (req, res) =>{
    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filenam="documento.pdf"');
    res.setHeader('Content-Type', 'aapplicatrion/pdf');
    doc.pipe(res);
    doc.text("Generando un  texto en un  pdf");
    doc.end();
})

module.exports = pdfRouter;