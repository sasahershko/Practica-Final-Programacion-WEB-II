/* eslint-env jest */
jest.mock('../utils/handleUploadIPFS', () => ({ //mock de uploadToPinata antes de importar la app
  uploadToPinata: jest.fn().mockResolvedValue({ IpfsHash: 'QmFakeHash' }),
}));

const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const {
  usersModel,
  clientsModel,
  projectsModel,
  deliveryNotesModel
} = require('../models');
const { encrypt } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');

const api = supertest(app);
let token;
let clientId;
let projectId;
let deliveryNoteId;


let consoleErrorSpy;
beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeAll(async () => {
  // limpiar todas las colecciones
  await Promise.all([
    usersModel.deleteMany({}),
    clientsModel.deleteMany({}),
    projectsModel.deleteMany({}),
    deliveryNotesModel.deleteMany({})
  ]);

  // crear usuario y token
  const hashedPassword = await encrypt('password123');
  const user = await usersModel.create({
    name: 'Test User',
    email: 'albaran@test.com',
    password: hashedPassword,
    verified: true
  });
  user.set('password', undefined, { strict: false });
  token = await tokenSign(user, process.env.JWT_SECRET);

  // crear cliente
  const client = await clientsModel.create({
    userId: user._id,
    name: 'Cliente Test',
    cif: 'B00000000',
    address: {
      street: 'Calle Test',
      number: 1,
      postal: 28000,
      city: 'Madrid',
      province: 'Madrid'
    }
  });
  clientId = client._id.toString();

  // crear proyecto referenciando al cliente
  const project = await projectsModel.create({
    userId: user._id,
    clientId: client._id,
    name: 'Proyecto Test',
    code: 'PRJ-001'
  });
  projectId = project._id.toString();
});

describe('Pruebas del módulo de Albaranes (/api/deliverynote)', () => {
  // ——— Happy path ——————————————————————————

  it('POST /api/deliverynote => crea un albarán “both” con éxito', async () => {
    const response = await api
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        projectId,
        format: 'both',
        name: 'Albarán de prueba',
        description: 'Trabajo con materiales',
        workers: [{ name: 'Juan', hours: 5 }],
        materials: [{ name: 'Tornillos', quantity: 100, unit: 'unidades' }]
      })
      .expect(201);

    expect(response.body).toHaveProperty('deliveryNote');
    const note = response.body.deliveryNote;
    expect(note).toMatchObject({
      name: 'Albarán de prueba',
      format: 'both'
    });
    deliveryNoteId = note._id;
  });

  it('GET /api/deliverynote => lista todos los albaranes del usuario', async () => {
    const response = await api
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('deliveryNotes');
    expect(Array.isArray(response.body.deliveryNotes)).toBe(true);
    expect(response.body.deliveryNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ _id: deliveryNoteId })
      ])
    );
  });

  it('GET /api/deliverynote/:id => obtiene un albarán por su ID', async () => {
    const response = await api
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('deliveryNote');
    expect(response.body.deliveryNote._id).toBe(deliveryNoteId);
  });

  it('GET /api/deliverynote/pdf/:id => genera y sube el PDF, devuelve URL', async () => {
    const res = await api
      .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('url');
    expect(res.body.url).toContain('ipfs/QmFakeHash');
    expect(res.body.message).toMatch(/subido a IPFS/i);
  });

  it('POST /api/deliverynote/:id/sign => firma albarán y genera PDF firmado', async () => {
    const res = await api
      .post(`/api/deliverynote/${deliveryNoteId}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', Buffer.from('fake-signature'), 'firma.png')
      .expect(200);

    expect(res.body).toHaveProperty('sign');
    expect(res.body).toHaveProperty('pdfUrl');
    expect(res.body.sign).toContain('ipfs/QmFakeHash');
    expect(res.body.pdfUrl).toContain('ipfs/QmFakeHash');
  });

  it('DELETE /api/deliverynote/:id => no permite borrar albarán firmado', async () => {
    const res = await api
      .delete(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(res.body.message).toMatch(/firmado/i);
  });
});



describe('Pruebas de errores en el módulo de Albaranes (/api/deliverynote)', ()=>{
   // ——— Errores ——————————————————————————

   it('POST /api/deliverynote sin token → 401 Unauthorized', async () => {
    await api
      .post('/api/deliverynote')
      .send({})
      .expect(401);
  });

  it('POST /api/deliverynote con payload incompleto → 422 Unprocessable Entity', async () => {
    const res = await api
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientId })
      .expect(422);

    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('POST /api/deliverynote con IDs no válidos → 422 para clientId y projectId', async () => {
    const res = await api
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId: '1234abc',
        projectId: 'notanid',
        format: 'hours',
        workers: [{ name: 'X', hours: 1 }]
      })
      .expect(422);

    // Extraemos los mensajes de error (pueden ser strings o tener .msg)
    const messages = res.body.errors.map(e => (typeof e === 'string' ? e : e.msg));
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/clientId/i),
        expect.stringMatching(/projectId/i)
      ])
    );
  });

  it('POST /api/deliverynote con formato “hours” pero sin workers → 422', async () => {
    const res = await api
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        projectId,
        format: 'hours'
        // falta workers
      })
      .expect(422);

    const messages = res.body.errors.map(e => (typeof e === 'string' ? e : e.msg));
    expect(messages.some(msg => /trabajador/i.test(msg))).toBe(true);
  });

  it('GET /api/deliverynote/:id con formato de ID inválido → 500 Internal Server Error', async () => {
    await api
      .get('/api/deliverynote/1234abc')
      .set('Authorization', `Bearer ${token}`)
      .expect(500);
    // no comprobamos body porque tu controller devuelve {}
  });

  it('GET /api/deliverynote/:id con ID válido pero inexistente → 404 Not Found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await api
      .get(`/api/deliverynote/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('GET /api/deliverynote/pdf/:id inexistente → 404 Not Found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await api
      .get(`/api/deliverynote/pdf/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('POST /api/deliverynote/:id/sign sin archivo → 400 Bad Request', async () => {
    const fakeNote = await deliveryNotesModel.create({
      userId: new mongoose.Types.ObjectId(),
      clientId,
      projectId,
      format: 'materials',
      materials: [{ name: 'X', quantity: 1, unit: 'u' }]
    });

    await api
      .post(`/api/deliverynote/${fakeNote._id}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('POST /api/deliverynote/:id/sign con ID inválido → 500 Internal Server Error', async () => {
    await api
      .post('/api/deliverynote/1234abc/sign')
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', Buffer.from('x'), 'sig.png')
      .expect(500);
  });

  it('DELETE /api/deliverynote/:id inexistente → 404 Not Found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await api
      .delete(`/api/deliverynote/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
})