/* eslint-env jest */
jest.mock('../utils/generateCodeAndSendEmail', () => ({
    generateCodeAndSendEmail: jest.fn().mockResolvedValue()
  }));
  
  const supertest    = require('supertest');
  const mongoose     = require('mongoose');
  const app          = require('../app');
  const { usersModel } = require('../models');
  const { encrypt }    = require('../utils/handlePassword');
  const { tokenSign }  = require('../utils/handleJwt');
  
  const api = supertest(app);
  
  let primaryUser, primaryToken;
  let recoverUser;
  let inviterUser, inviterToken;
  
  beforeAll(async () => {
    // jest.spyOn(console, 'error').mockImplementation(() => {});
    await usersModel.deleteMany({});
  
    // usuario principal
    const h1 = await encrypt('password123');
    primaryUser = await usersModel.create({
      email:    'primary@test.com',
      password: h1,
      name:     'Primario',
      surnames: 'Usuario',
      nif:      'A12345678',
      verified: true,
      active:   true
    });
    primaryToken = tokenSign(primaryUser);
  
    // usuario para recuperar contraseña
    const h2 = await encrypt('resetpass');
    recoverUser = await usersModel.create({
      email:    'recover@test.com',
      password: h2,
      verified: true,
      active:   true
    });
    await usersModel.findByIdAndUpdate(recoverUser._id, {
      code:  '111111',
      tries: 1
    });
  
    // invitador con compañía
    const h3 = await encrypt('invitepass');
    inviterUser = await usersModel.create({
      email:    'inviter@test.com',
      password: h3,
      verified: true,
      active:   true,
      company: {
        name:     'Org',
        cif:      'B87654321',
        street:   'Calle X',
        number:   1,
        postal:   28001,
        city:     'Madrid',
        province: 'Madrid'
      }
    });
    inviterToken = tokenSign(inviterUser);
  });
  
  // afterAll(async () => {
  //   console.error.mockRestore();
  // });
  
  describe('Pruebas del módulo de Usuarios (/api/user) – happy path', () => {
    it('GET /api/user → 200 y usuario sanitizado', async () => {
      const res = await api
        .get('/api/user')
        .set('Authorization', `Bearer ${primaryToken}`)
        .expect(200);
      expect(res.body.user).toMatchObject({
        email:    'primary@test.com',
        name:     'Primario',
        surnames: 'Usuario',
        nif:      'A12345678'
      });
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).not.toHaveProperty('code');
      expect(res.body.user).not.toHaveProperty('tries');
    });
  
    it('PATCH /api/user/register → 200 y usuario actualizado', async () => {
      const res = await api
        .patch('/api/user/register')
        .set('Authorization', `Bearer ${primaryToken}`)
        .send({
          email:    'updated@test.com',
          name:     'Nuevo',
          surnames: 'Nombre',
          nif:      'B23456789'
        })
        .expect(200);
      expect(res.body.user).toMatchObject({
        email:    'updated@test.com',
        name:     'Nuevo',
        surnames: 'Nombre',
        nif:      'B23456789'
      });
    });
  
    it('PATCH /api/user/company → 200 y compañía actualizada', async () => {
      const comp = {
        name:     'MiEmpresa',
        cif:      'B12345678',
        street:   'Calle Falsa',
        number:   42,
        postal:   28080,
        city:     'Madrid',
        province: 'Madrid'
      };
      const res = await api
        .patch('/api/user/company')
        .set('Authorization', `Bearer ${primaryToken}`)
        .send({ company: comp })
        .expect(200);
      expect(res.body.user.company).toMatchObject(comp);
    });
  
    it('POST /api/user/recover → 200 y código enviado', async () => {
      const res = await api
        .post('/api/user/recover')
        .send({ email: 'recover@test.com' })
        .expect(200);
      expect(res.body.message).toMatch(/código enviado/i);
    });
  
    it('PUT /api/user/validation → 200 y token', async () => {
      const res = await api
        .put('/api/user/validation')
        .send({ email: 'recover@test.com', code: '111111' })
        .expect(200);
      expect(res.body.token).toBeDefined();
    });
  
    it('POST /api/user/invite → 201 y usuario invitado', async () => {
      const res = await api
        .post('/api/user/invite')
        .set('Authorization', `Bearer ${inviterToken}`)
        .send({ email: 'guest@test.com' })
        .expect(201);
      expect(res.body.user.email).toBe('guest@test.com');
      expect(res.body.user.role).toBe('guest');
    });
  
    it('DELETE /api/user (soft) → 200 y desactivado', async () => {
      await api
        .delete('/api/user')
        .set('Authorization', `Bearer ${primaryToken}`)
        .expect(200);
      const u = await usersModel.findById(primaryUser._id);
      expect(u.active).toBe(false);
    });
  
    it('DELETE /api/user?soft=false (hard) → 200 y eliminado', async () => {
      await usersModel.findByIdAndUpdate(primaryUser._id, { active: true });
      await api
        .delete('/api/user?soft=false')
        .set('Authorization', `Bearer ${primaryToken}`)
        .expect(200);
      const u = await usersModel.findById(primaryUser._id);
      expect(u).toBeNull();
    });
  });
  
  describe('Pruebas de errores en el módulo de Usuarios (/api/user)', () => {
    let errUser, errToken;
    beforeAll(async () => {
      await usersModel.deleteMany({});
      // usuario para payload inválido
      const hErr = await encrypt('password123');
      errUser = await usersModel.create({
        email:    'err@test.com',
        password: hErr,
        name:     'Err',
        surnames: 'Test',
        nif:      'C12345678',
        verified: true,
        active:   true
      });
      errToken = tokenSign(errUser);
      // recrear invitador con compañía
      const hInv = await encrypt('invitepass');
      inviterUser = await usersModel.create({
        email:    'inviter@test.com',
        password: hInv,
        verified: true,
        active:   true,
        company: {
          name:     'Org',
          cif:      'B87654321',
          street:   'Calle X',
          number:   1,
          postal:   28001,
          city:     'Madrid',
          province: 'Madrid'
        }
      });
      inviterToken = tokenSign(inviterUser);
      // crear guest para "ya invitado"
      await api
        .post('/api/user/invite')
        .set('Authorization', `Bearer ${inviterToken}`)
        .send({ email: 'guest@test.com' });
    });
  
    it('GET /api/user sin token → 401', () =>
      api.get('/api/user').expect(401)
    );
  
    it('PATCH /api/user/register sin token → 401', () =>
      api.patch('/api/user/register').send({}).expect(401)
    );
  
    it('PATCH /api/user/register payload inválido → 422', async () => {
      const res = await api
        .patch('/api/user/register')
        .set('Authorization', `Bearer ${errToken}`)
        .send({ email: 'bad', nif: '' })
        .expect(422);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  
    it('PATCH /api/user/company sin token → 401', () =>
      api.patch('/api/user/company').send({}).expect(401)
    );
  
    it('PATCH /api/user/company payload inválido → 422', async () => {
      const res = await api
        .patch('/api/user/company')
        .set('Authorization', `Bearer ${errToken}`)
        .send({ company: { cif: '123' } })
        .expect(422);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  
    it('POST /api/user/recover email desconocido → 404', async () => {
      const res = await api
        .post('/api/user/recover')
        .send({ email: 'nope@test.com' })
        .expect(404);
      expect(res.body.error).toMatch(/usuario no encontrado/i);
    });
  
    it('PUT /api/user/validation código incorrecto → 400', async () => {
      await usersModel.findByIdAndUpdate(errUser._id, { code: '222222', tries: 1 });
      const res = await api
        .put('/api/user/validation')
        .send({ email: 'err@test.com', code: 'wrong' })
        .expect(400);
      expect(res.body.error).toMatch(/código incorrecto/i);
    });
  
    it('PUT /api/user/validation usuario no existe → 404', async () => {
      const res = await api
        .put('/api/user/validation')
        .send({ email: 'nouser@test.com', code: '123456' })
        .expect(404);
      expect(res.body.error).toMatch(/usuario no encontrado/i);
    });
  
    it('POST /api/user/invite sin token → 401', () =>
      api.post('/api/user/invite').send({ email: 'x@test.com' }).expect(401)
    );
  
    it('POST /api/user/invite self → 400', async () => {
      const res = await api
        .post('/api/user/invite')
        .set('Authorization', `Bearer ${inviterToken}`)
        .send({ email: 'inviter@test.com' })
        .expect(400);
      expect(res.body.error).toMatch(/no puedes invitarte a ti mismo/i);
    });
  
    it('POST /api/user/invite miembro ya invitado → 400', async () => {
      const res = await api
        .post('/api/user/invite')
        .set('Authorization', `Bearer ${inviterToken}`)
        .send({ email: 'guest@test.com' })
        .expect(400);
      expect(res.body.error).toMatch(/ya pertenece a una compañía/i);
    });
  
    it('DELETE /api/user sin token → 401', () =>
      api.delete('/api/user').expect(401)
    );
  });
  