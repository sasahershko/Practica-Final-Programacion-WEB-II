/* eslint-env jest */
jest.mock('../utils/generateCodeAndSendEmail', () => ({
  generateCodeAndSendEmail: jest.fn().mockResolvedValue()
}));

const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { usersModel } = require('../models');
const { encrypt } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');

const api = supertest(app);

let testUser;
let testToken;
let verifyUser;
let verifyToken;

beforeAll(async () => {
  // silenciar errores de consola
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // limpiar usuarios
  await usersModel.deleteMany({});
});

// afterAll(async () => {
//   await mongoose.connection.close();
//   console.error.mockRestore();
// });

describe('Pruebas del módulo de Auth REGISTRO (/api/auth)', () => {
  it('post /api/auth/register crea usuario y devuelve token + user', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'password123' })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('user@test.com');

    // guardar para login y verify
    testUser = await usersModel.findOne({ email: 'user@test.com' });
    testToken = res.body.token;
  });

  it('post /api/auth/register con email duplicado devuelve 409', async () => {
    await api
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'password123' })
      .expect(409);
  });

  it('post /api/auth/register payload incompleto devuelve 422', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({ email: 'x@x.com' })
      .expect(422);

    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('post /api/auth/register email mal formado devuelve 422', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({ email: 'nope', password: 'password123' })
      .expect(422);

    expect(res.body.errors.some(e => /formato de email inválido/i.test(e.msg))).toBe(true);
  });

  it('post /api/auth/register contraseña corta devuelve 422', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({ email: 'other@test.com', password: 'short' })
      .expect(422);

    expect(res.body.errors.some(e => /mínimo 8 caracteres/i.test(e.msg))).toBe(true);
  });
});

describe('Pruebas del módulo de Auth INICIO DE SESIÓN (/api/auth)', () => {
  beforeAll(async () => {
    // activar y verificar el usuario de prueba
    await usersModel.findByIdAndUpdate(testUser._id, {
      verified: true,
      active: true
    });
  });

  it('post /api/auth/login login exitoso', async () => {
    const res = await api
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('user@test.com');
  });

  it('post /api/auth/login usuario no existe devuelve 404', async () => {
    await api
      .post('/api/auth/login')
      .send({ email: 'nouser@test.com', password: 'password123' })
      .expect(404);
  });

  it('post /api/auth/login usuario desactivado devuelve 403', async () => {
    await usersModel.findByIdAndUpdate(testUser._id, { active: false });
    await api
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' })
      .expect(403);
    // reactivar para siguientes tests
    await usersModel.findByIdAndUpdate(testUser._id, { active: true });
  });

  it('post /api/auth/login cuenta no verificada devuelve 409', async () => {
    await usersModel.findByIdAndUpdate(testUser._id, { verified: false });
    await api
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' })
      .expect(409);
    // verificar para siguientes tests
    await usersModel.findByIdAndUpdate(testUser._id, { verified: true });
  });

  it('post /api/auth/login contraseña inválida devuelve 401', async () => {
    await api
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'wrongpass' })
      .expect(401);
  });

  it('post /api/auth/login payload incompleto devuelve 422', async () => {
    const res = await api
      .post('/api/auth/login')
      .send({ email: 'user@test.com' })
      .expect(422);

    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

describe('Pruebas del módulo de Auth VERIFICACIÓN MAIL (/api/auth)', () => {
  beforeAll(async () => {
    // crear usuario con código y tries
    const hashed = await encrypt('password123');
    verifyUser = await usersModel.create({
      email: 'verify@test.com',
      password: hashed,
      verified: false,
      active: true,
      code: '123456',
      tries: 2
    });
    verifyToken = tokenSign({ _id: verifyUser._id });
  });

  it('post /api/auth/verify-email éxito con código correcto', async () => {
    const res = await api
      .post('/api/auth/verify-email')
      .set('Authorization', `Bearer ${verifyToken}`)
      .send({ code: '123456' })
      .expect(200);

    expect(res.body.message).toMatch(/verificado con éxito/i);
    const updated = await usersModel.findById(verifyUser._id);
    expect(updated.verified).toBe(true);
  });

  it('post /api/auth/verify-email código inválido devuelve 400', async () => {
    // resetear tries y verified
    await usersModel.findByIdAndUpdate(verifyUser._id, {
      verified: false,
      code: '654321',
      tries: 1
    });

    await api
      .post('/api/auth/verify-email')
      .set('Authorization', `Bearer ${verifyToken}`)
      .send({ code: 'wrong' })
      .expect(400);

    const after = await usersModel.findById(verifyUser._id);
    expect(after.tries).toBe(0);
  });

  it('post /api/auth/verify-email sin intentos devuelve 400', async () => {
    await usersModel.findByIdAndUpdate(verifyUser._id, {
      verified: false,
      tries: 0
    });

    await api
      .post('/api/auth/verify-email')
      .set('Authorization', `Bearer ${verifyToken}`)
      .send({ code: '654321' })
      .expect(400);
  });

  it('post /api/auth/verify-email usuario no existe devuelve 404', async () => {
    const fakeToken = tokenSign({ _id: new mongoose.Types.ObjectId() });
    await api
      .post('/api/auth/verify-email')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({ code: 'anything' })
      .expect(404);
  });

  it('post /api/auth/verify-email sin token devuelve 401', async () => {
    await api
      .post('/api/auth/verify-email')
      .send({ code: '123456' })
      .expect(401);
  });
});

describe('Pruebas de errores en el módulo de Auth REGISTRO(/api/auth)', () => {
  it('post /api/auth/register con email duplicado → 409 conflict', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'password123' })
      .expect(409);

    // debe devolver { error: 'Correo ya registrado' }
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/correo ya registrado/i);
  });

  it('post /api/auth/register payload incompleto → 422 unprocessable entity', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({ email: 'x@x.com' })
      .expect(422);

    // debe devolver array de errores de validación
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

describe('Pruebas de errores en el módulo de Auth INICIO DE SESIÓN (/api/auth)', () => {
  it('post /api/auth/login usuario no existe → 404 not found', async () => {
    const res = await api
      .post('/api/auth/login')
      .send({ email: 'nouser@test.com', password: 'password123' })
      .expect(404);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/usuario no encontrado/i);
  });

  it('post /api/auth/login usuario desactivado → 403 forbidden', async () => {
    await usersModel.findByIdAndUpdate(testUser._id, { active: false });
    const res = await api
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' })
      .expect(403);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/usuario desactivado/i);
    await usersModel.findByIdAndUpdate(testUser._id, { active: true });
  });

  it('post /api/auth/login cuenta no verificada → 409 conflict', async () => {
    await usersModel.findByIdAndUpdate(testUser._id, { verified: false });
    const res = await api
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' })
      .expect(409);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/no está verificada/i);
    await usersModel.findByIdAndUpdate(testUser._id, { verified: true });
  });

  it('post /api/auth/login contraseña inválida → 401 unauthorized', async () => {
    const res = await api
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'wrongpass' })
      .expect(401);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/contraseña inválida/i);
  });

  it('post /api/auth/login payload incompleto → 422 unprocessable entity', async () => {
    const res = await api
      .post('/api/auth/login')
      .send({ email: 'user@test.com' })
      .expect(422);

    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

describe('Pruebas de errores en el módulo de Auth VERIFICAR MAIL (/api/auth)', () => {
  it('post /api/auth/verify-email código inválido → 400 bad request', async () => {
    // resetear tries y código
    await usersModel.findByIdAndUpdate(verifyUser._id, {
      verified: false,
      code: '654321',
      tries: 1
    });

    const res = await api
      .post('/api/auth/verify-email')
      .set('Authorization', `Bearer ${verifyToken}`)
      .send({ code: 'wrong' })
      .expect(400);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/código inválido/i);
  });

  it('post /api/auth/verify-email sin intentos → 400 bad request', async () => {
    await usersModel.findByIdAndUpdate(verifyUser._id, { verified: false, tries: 0 });
    const res = await api
      .post('/api/auth/verify-email')
      .set('Authorization', `Bearer ${verifyToken}`)
      .send({ code: 'anything' })
      .expect(400);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/se acabaron los intentos/i);
  });

  it('post /api/auth/verify-email usuario no existe → 404 not found', async () => {
    const fakeToken = tokenSign({ _id: new mongoose.Types.ObjectId() });
    await api
      .post('/api/auth/verify-email')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({ code: 'anything' })
      .expect(404);
  });

  it('post /api/auth/verify-email sin token → 401 unauthorized', async () => {
    await api
      .post('/api/auth/verify-email')
      .send({ code: '123456' })
      .expect(401);
  });
});

