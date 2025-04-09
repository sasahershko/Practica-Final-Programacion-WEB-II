const express = require('express');
const PDFDocument = require('pdfkit');
const pdfRouter = express.Router();


pdfRouter.get('/', (req, res) =>{
    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filenam="documento.pdf"');
    res.setHeader('Content-Type', 'aapplicatrion/pdf');
    doc.pipe(res);
    doc.text("Generando un  texto en un  pdf");
    doc.end();
})

module.exports = pdfRouter;