const deliveryNotesModel = require('../models/deliveryNote'); //? por qué no me funciona con /models?
const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleHttpError');

const PDFDocument = require('pdfkit');
const { uploadToPinata } = require('../utils/handleUploadIPFS');

const createDeliveryNote = async (req, res) => {
  try {
    const user = req.user;
    const data = matchedData(req);

    const newNote = await deliveryNotesModel.create({
      userId: user._id,
      ...data
    });

    return res.status(201).json({
      message: 'Albarán creado con éxito',
      deliveryNote: newNote
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_CREATE_DELIVERY_NOTE', 500);
  }
};


const getAllDeliveryNotes = async (req, res) => {
  try {
    const user = req.user;

    const notes = await deliveryNotesModel.find({ userId: user._id })
      .populate('clientId', 'name cif')
      .populate('projectId', 'name code');

    return res.status(200).json({ deliveryNotes: notes });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_GET_ALL_DELIVERY_NOTES', 500);
  }
};


const getDeliveryNote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const note = await deliveryNotesModel.findOne({
      _id: id,
      userId: user._id
    })
      .populate('userId', 'email role') //? he escogido estos campos, pero pueden ser otros
      .populate('clientId', 'name cif address')
      .populate('projectId', 'name code projectCode');

    if (!note) {
      return res.status(404).json({ message: 'Albarán no encontrado' });
    }

    return res.status(200).json({ deliveryNote: note });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_GET_DELIVERY_NOTE', 500);
  }
};


//******************************** */
//** genera un Buffer PDF a partir de un albarán
const generatePDFBuffer = (deliveryNote) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // === TÍTULO ===
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text(`Albarán #${deliveryNote._id}`, { align: 'center' })
      .moveDown(1.5);

    // === LÍNEA SEPARADORA ===
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();
    doc.moveDown(1);

    // === DATOS GENERALES ===
    doc.fontSize(14).font('Helvetica-Bold').text('Datos generales');
    doc.moveDown(0.5);

    //! ME ESTÁ DANDO NULL
    doc.fontSize(12).font('Helvetica')
      .text(`Fecha: ${deliveryNote.date?.toLocaleDateString() || 'N/A'}`)
      .text(`Usuario: ${deliveryNote.userId?.email || 'N/A'}`)
      .text(`Cliente: ${deliveryNote.clientId?.name || 'N/A'} (CIF: ${deliveryNote.clientId?.cif || 'N/A'})`)
      .text(`Proyecto: ${deliveryNote.projectId?.name || 'N/A'} - ${deliveryNote.projectId?.code || 'N/A'}`)
      .moveDown(1);

    // === FORMATO Y DETALLES ===
    doc.fontSize(14).font('Helvetica-Bold').text('Contenido del albarán');
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica')
      .text(`Formato: ${deliveryNote.format}`);

    if (deliveryNote.format === 'hours') {
      doc.text(`Horas totales: ${deliveryNote.hours}`);
      doc.text(`Trabajadores: ${deliveryNote.workers?.join(', ') || 'Ninguno'}`);
    } else {
      doc.text('Descripción de materiales:');
      doc.font('Helvetica-Oblique')
        .text(deliveryNote.description || 'No especificada');
      doc.font('Helvetica');
    }
    doc.moveDown(1);

    // === ESTADO ===
    doc.fontSize(14).font('Helvetica-Bold').text('Estado del albarán');
    doc.moveDown(0.5);

    if (deliveryNote.sign) {
      doc.fontSize(12).fillColor('green').text('FIRMADO');
    } else {
      doc.fontSize(12).fillColor('red').text('NO FIRMADO');
    }
    doc.fillColor('black'); // restablecer color por si acaso

    doc.end();
  });
};


/*
 * - si el albarán está firmado y tiene pdfUrl, redirigimos a ese PDF
 * - sino, generamos el PDF al vuelo y lo enviamos al cliente.
 */
const getDeliveryNotePdf = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const note = await deliveryNotesModel.findOne({
      _id: id,
      userId: user._id
    })
      .populate('userId', 'email role')
      .populate('clientId', 'name cif address')
      .populate('projectId', 'name code projectCode');

    if (!note) {
      return res.status(404).json({ message: 'Albarán no encontrado' });
    }

    // Si ya está firmado y tiene URL IPFS, respondemos con el enlace
    if (note.sign && note.pdfUrl) {
      return res.json({
        message: 'PDF ya generado y disponible',
        url: note.pdfUrl
      });
    }

    // generamos el pdf en memoria
    const pdfData = await generatePDFBuffer(note);

    // subimos a pinata
    const estado = note.sign ? 'FIRMADO' : 'NOFIRMADO';
    const { IpfsHash } = await uploadToPinata(pdfData, `albaran-${note._id}-${estado}.pdf`);
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;

    // guardamos la URL en el albarán
    note.pdfUrl = ipfsUrl;
    await note.save();

    return res.json({
      message: 'PDF generado correctamente y subido a IPFS',
      url: ipfsUrl
    });

  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_GET_DELIVERY_NOTE_PDF', 500);
  }
};



const signDeliveryNote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const note = await deliveryNotesModel.findOne({
      _id: id,
      userId: user._id
    });

    if (!note) {
      return res.status(404).json({ message: 'Albarán no encontrado' });
    }

    if (note.sign) {
      return res.status(400).json({ message: 'El albarán ya está firmado' });
    }

    // comprobamos que haya un archivo adjunto (firma)
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha enviado ninguna firma' });
    }

    // subimos la firma a pinata
    const { buffer, originalname } = req.file;
    const pinataResponse = await uploadToPinata(buffer, originalname);
    const ipfsHash = pinataResponse.IpfsHash;
    const signURL = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsHash}`;

    // guardamos la firma en la BD
    note.sign = signURL;
    note.pending = false; // dejamos de marcarlo como pendiente
    await note.save();

    // generar PDF y subirlo a IPFS también
    const pdfData = await generatePDFBuffer(note);
    const estado = note.sign ? 'FIRMADO' : 'NOFIRMADO';
    const nombrePDF = `albaran-${note._id}-${estado}.pdf`;
    const pdfPinataResponse = await uploadToPinata(pdfData, nombrePDF);
    const pdfHash = pdfPinataResponse.IpfsHash;
    const pdfURL = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${pdfHash}`;

    // guardamos la url del PDF en la BD
    note.pdfUrl = pdfURL;
    await note.save();

    return res.json({
      message: 'Albarán firmado con éxito',
      sign: note.sign,
      pdfUrl: note.pdfUrl
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_SIGNING_DELIVERY_NOTE', 500);
  }
};

//******************************** */

// borrar albarán
//? también hay hard/soft delete?
const deleteDeliveryNote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const note = await deliveryNotesModel.findOne({
      _id: id,
      userId: user._id
    });
    if (!note) {
      return res.status(404).json({ message: 'Albarán no encontrado' });
    }

    // Si ya está firmado, no lo borramos
    if (note.sign) {
      return res.status(400).json({ message: 'No se puede borrar un albarán firmado' });
    }

    // Borrado físico (hard delete)
    await deliveryNotesModel.deleteOne({ _id: id });

    return res.status(200).json({
      message: 'Albarán eliminado con éxito'
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, 'ERROR_DELETE_DELIVERY_NOTE', 500);
  }
};

module.exports = {
  createDeliveryNote,
  getAllDeliveryNotes,
  getDeliveryNote,
  deleteDeliveryNote,
  getDeliveryNotePdf,
  signDeliveryNote
};
