/* eslint-env jest */
const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../app');
const { usersModel } = require('../models');

const api = supertest(app);

let token;

const testUser = {
  email: 'testuser@example.com',
  password: '12345678'
};

beforeAll(async () => {
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) return resolve();
      mongoose.connection.once('connected', resolve);
    });
  
    await usersModel.deleteMany({});
  });
  

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe('Auth API', () => {
  it('POST /api/auth/register => crea un usuario nuevo', async () => {
    const res = await api
      .post('/api/auth/register')
      .send(testUser)
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('POST /api/auth/login => falla porque no está verificado', async () => {
    const res = await api
      .post('/api/auth/login')
      .send(testUser)
      .expect(409);

    expect(res.body.error).toMatch(/no está verificada/i);
  });

  it('POST /api/auth/verify-email => verifica con código correcto', async () => {
    const user = await usersModel.findOne({ email: testUser.email });
    user.code = '123456';
    await user.save();

    const tokenLocal = require('../utils/handleJwt').tokenSign(user);

    const res = await api
      .post('/api/auth/verify-email')
      .set('Authorization', `Bearer ${tokenLocal}`)
      .send({ code: '123456' })
      .expect(200);

    expect(res.body).toHaveProperty('message');
    expect(res.body.user.verified).toBe(true);
  });

  it('POST /api/auth/login => login correcto tras verificar', async () => {
    const res = await api
      .post('/api/auth/login')
      .send(testUser)
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email);

    token = res.body.token;
  });
});
