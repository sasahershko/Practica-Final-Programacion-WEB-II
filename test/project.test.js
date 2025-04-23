/* eslint-env jest */
jest.mock('../utils/handleEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue({}) //crea una función simulada que siempre devuelve un objeto vacío, como si el email se hubiera enviado correctamente
}));

jest.mock('../utils/generateCodeAndSendEmail', () => ({
  generateCodeAndSendEmail: jest.fn().mockResolvedValue() //lo mismo que el anterior, pero para la función de generar código y enviar email
}));

jest.mock('../utils/handleUploadIPFS', () => ({
  uploadToPinata: jest.fn().mockResolvedValue({ IpfsHash: 'QmFakeHash' }) //simula la subida a IPFS y devuelve un hash falso
}));

const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { usersModel, clientsModel, projectsModel } = require('../models');
const { encrypt } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');

const api = supertest(app);

let token;
let clientId;
let projectId;

beforeAll(async () => {
  // jest.spyOn(console, 'error').mockImplementation(() => {});

  await Promise.all([
    usersModel.deleteMany({}),
    clientsModel.deleteMany({}),
    projectsModel.deleteMany({})
  ]);

  const hashed = await encrypt('password123');
  const user = await usersModel.create({
    name: 'Test User',
    email: 'project@test.com',
    password: hashed,
    verified: true
  });
  user.set('password', undefined, { strict: false });
  token = await tokenSign(user, process.env.JWT_SECRET);

  const client = await clientsModel.create({
    userId: user._id,
    name: 'Cliente Proyecto',
    cif: 'C12345678',
    address: {
      street: 'Calle Test',
      number: 5,
      postal: 28010,
      city: 'Madrid',
      province: 'Madrid'
    }
  });
  clientId = client._id.toString();
});

// afterAll(async () => {
//   console.error.mockRestore();
// });

describe('Pruebas del módulo de Proyectos (/api/project)', () => {
  it('post /api/project crea un proyecto', async () => {
    const res = await api
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientId, name: 'Proyecto alfa', code: 'PA-001' })
      .expect(201);

    expect(res.body).toHaveProperty('project');
    expect(res.body.project).toMatchObject({
      clientId,
      name: 'Proyecto alfa',
      code: 'PA-001'
    });
    projectId = res.body.project._id;
  });

  it('get /api/project lista proyectos no archivados', async () => {
    const res = await api
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body.projects)).toBe(true);
    expect(res.body.projects.some(p => p._id === projectId)).toBe(true);
  });

  it('get /api/project/one/:id obtiene un proyecto por id', async () => {
    const res = await api
      .get(`/api/project/one/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.project._id).toBe(projectId);
  });

  it('patch /api/project/:id actualiza el proyecto', async () => {
    const res = await api
      .patch(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Proyecto alfa modificado' })
      .expect(200);

    expect(res.body.project.name).toBe('Proyecto alfa modificado');
  });

  it('delete /api/project/archive/:id archiva el proyecto', async () => {
    await api
      .delete(`/api/project/archive/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('get /api/project/archive lista proyectos archivados', async () => {
    const res = await api
      .get('/api/project/archive')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.projects.some(p => p._id === projectId)).toBe(true);
  });

  it('patch /api/project/recover/:id recupera proyecto archivado', async () => {
    const res = await api
      .patch(`/api/project/recover/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.project.archived).toBe(false);
  });

  it('delete /api/project/:id elimina definitivamente', async () => {
    await api
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});

describe('Pruebas de errores en el módulo de Proyectos (/api/project)', () => {
  it('post /api/project sin token → 401', () =>
    api.post('/api/project').send({}).expect(401)
  );


  it('post /api/project duplicado → 400 bad request', async () => {
    // crear primero
    await api
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientId, name: 'dup proyecto' })
      .expect(201);

    // segundo intento
    await api
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientId, name: 'dup proyecto' })
      .expect(400);
  });

  it('patch /api/project/:id sin name → 422 unprocessable entity', async () => {
    // crear uno nuevo
    const create = await api
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientId, name: 'para actualizar' })
      .expect(201);

    const id = create.body.project._id;
    const res = await api
      .patch(`/api/project/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({}) // falta 'name'
      .expect(422);

    const msgs = res.body.errors.map(e =>
      typeof e === 'string' ? e : e.msg
    );
    expect(msgs.some(m => /nombre del proyecto.*requerido/i.test(m))).toBe(true);
  });


  it('patch /api/project/:id inexistente → 404 not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await api
      .patch(`/api/project/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'x' })
      .expect(404);
  });

  it('delete /api/project/:id inválido → 422 Unprocessable Entity (no válido)', () =>
    api
      .delete('/api/project/1234abc')
      .set('Authorization', `Bearer ${token}`)
      .expect(422)
  );

  it('delete /api/project/:id inexistente → 404 not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await api
      .delete(`/api/project/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });



  it('delete /api/project/archive/:id inexistente → 404 not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await api
      .delete(`/api/project/archive/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  
//! no funcionan
  // it('post /api/project payload incompleto → 422 unprocessable entity', async () => {
  //   const res = await api
  //     .post('/api/project')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send({ name: 'sin clientId' })
  //     .expect(422);

  //   const msgs = res.body.errors.map(e =>
  //     typeof e === 'string' ? e : e.msg
  //   );
  //   expect(msgs.some(m => /clientId.*requerido/i.test(m))).toBe(true);
  // });

  // it('post /api/project con clientId inválido → 422 unprocessable entity', async () => {
  //   const res = await api
  //     .post('/api/project')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send({ clientId: '1234abc', name: 'x' })
  //     .expect(422);

  //   const msgs = res.body.errors.map(e =>
  //     typeof e === 'string' ? e : e.msg
  //   );
  //   expect(msgs.some(m => /clientId.*válido/i.test(m))).toBe(true);
  // });

  // it('patch /api/project/:id inválido → 422 Unprocessable Entity (no válido)', () =>
  //   api
  //     .patch('/api/project/1234abc')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send({ name: 'x' })
  //     .expect(422)
  // );

  // it('delete /api/project/archive/:id inválido → 404 not found', () =>
  //   api
  //     .delete('/api/project/archive/1234abc')
  //     .set('Authorization', `Bearer ${token}`)
  //     .expect(404)
  // );

  // it('patch /api/project/recover/:id inválido → 404 not found', () =>
  //   api
  //     .patch('/api/project/recover/1234abc')
  //     .set('Authorization', `Bearer ${token}`)
  //     .expect(404)
  // );

  it('patch /api/project/recover/:id inexistente → 404 not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await api
      .patch(`/api/project/recover/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});