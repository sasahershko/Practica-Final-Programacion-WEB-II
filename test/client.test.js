/* eslint-env jest */
const supertest = require('supertest');
const mongoose = require('mongoose');
const  app  = require('../app');
const { usersModel, clientsModel } = require('../models');
const { encrypt } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');

const api = supertest(app);
let token;
let clientId;

const testUserData = {
  name: 'Test User',
  email: 'cliente@test.com',
  password: 'password123',
};

beforeAll(async () => {
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});

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
  

describe('Pruebas del módulo de Clientes (/api/client)', () => {
  it('POST /api/client => crea un cliente nuevo', async () => {
    const response = await api
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Test',
        cif: 'B12345678',
        address: {
          street: 'Calle Prueba',
          number: 10,
          postal: 28080,
          city: 'Madrid',
          province: 'Madrid'
        }
      })
      .expect(201);

    expect(response.body).toHaveProperty('client');
    clientId = response.body.client._id;
  });

  it('GET /api/client => devuelve todos los clientes del usuario', async () => {
    const response = await api
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('clients');
    expect(Array.isArray(response.body.clients)).toBe(true);
  });

  it('GET /api/client/:id => devuelve un cliente específico', async () => {
    const response = await api
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('client');
    expect(response.body.client.name).toBe('Cliente Test');
  });

  it('PATCH /api/client/:id => actualiza un cliente', async () => {
    const response = await api
      .patch(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Modificado',
        cif: 'B87654321',
        address: {
          street: 'Nueva Calle',
          number: 15,
          postal: 28081,
          city: 'Getafe',
          province: 'Madrid'
        }
      })
      .expect(200);

    expect(response.body.client.name).toBe('Cliente Modificado');
  });

  it('DELETE /api/client/archive/:id => archiva un cliente', async () => {
    const response = await api
      .delete(`/api/client/archive/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toMatch(/archivado/i);
  });

  it('PATCH /api/client/recover/:id => recupera un cliente archivado', async () => {
    const response = await api
      .patch(`/api/client/recover/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toMatch(/restaurado/i);
  });

  it('DELETE /api/client/:id => elimina cliente permanentemente', async () => {
    const response = await api
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toMatch(/eliminado/i);
  });

  it('GET /api/client/archive => recupera cliente eliminado', async() =>{
    const response = await api
      .get(`/api/client/archive`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })
});
