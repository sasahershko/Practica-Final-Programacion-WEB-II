/* eslint-env jest */
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { usersModel } = require('../models');
const { encrypt } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');

const api = supertest(app);
let token;
let deliveryNoteId;

const testUserData = {
  name: 'Test User',
  email: 'albaran@test.com',
  password: 'password123',
};

beforeAll(async () => {
  await usersModel.deleteMany({});

  const hashedPassword = await encrypt(testUserData.password);
  const createdUser = await usersModel.create({
    ...testUserData,
    password: hashedPassword,
    verified: true,
  });

  createdUser.set('password', undefined, { strict: false });
  token = await tokenSign(createdUser, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Pruebas del módulo de Albaranes (/api/deliverynote)', () => {
  it('POST /api/deliverynote => crea un albarán nuevo', async () => {
    const response = await api
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId: '67f56118132ecbe949246382',
        projectId: '67f572fdf6b774fa67eb122a',
        format: 'both',
        name: 'Albarán de prueba',
        description: 'Trabajo con materiales',
        workers: [
          { name: 'Juan', hours: 5 },
        ],
        materials: [
          { name: 'Tornillos', quantity: 100, unit: 'unidades' },
        ]
      })
      .expect(201);

    expect(response.body).toHaveProperty('deliveryNote');
    deliveryNoteId = response.body.deliveryNote._id;
  });

  it('GET /api/deliverynote => lista todos los albaranes', async () => {
    const response = await api
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('deliveryNotes');
    expect(Array.isArray(response.body.deliveryNotes)).toBe(true);
  });

  it('GET /api/deliverynote/:id => obtiene un albarán por ID', async () => {
    const response = await api
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.deliveryNote._id).toBe(deliveryNoteId);
  });

  it('DELETE /api/deliverynote/:id => elimina un albarán', async () => {
    const response = await api
      .delete(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toMatch(/eliminado/i);
  });

  //! Firmar albarán
});
