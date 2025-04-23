/* eslint-env jest */
jest.mock('../utils/handleEmail', () => ({
    sendEmail: jest.fn().mockResolvedValue({})
  }));
  
  const supertest    = require('supertest');
  const mongoose     = require('mongoose');
  const app          = require('../app');
  const { usersModel } = require('../models');
  const { encrypt }    = require('../utils/handlePassword');
  const { tokenSign }  = require('../utils/handleJwt');
  const { sendEmail }  = require('../utils/handleEmail');
  
  const api = supertest(app);
  let user, token;
  
  beforeAll(async () => {
    await usersModel.deleteMany({});
    const hash = await encrypt('password123');
    user = await usersModel.create({
      email:    'mail@test.com',
      password: hash,
      verified: true,
      active:   true
    });
    token = tokenSign(user);
  });
  
  
  describe('Pruebas del módulo de Mail (/api/mail)', () => {
    describe('happy path', () => {
      it('POST /api/mail → 200 y mensaje de éxito', async () => {
        const payload = {
          subject: 'Hola',
          text:    'Este es un texto',
          to:      'destino@test.com',
          from:    'origen@test.com'
        };
        const res = await api
          .post('/api/mail')
          .set('Authorization', `Bearer ${token}`)
          .send(payload)
          .expect(200);
  
        expect(sendEmail).toHaveBeenCalledWith(payload);
        expect(res.body.message).toBe('Correo enviado correctamente');
      });
    });
  
    describe('errores', () => {
      it('sin token → 401 unauthorized', () =>
        api
          .post('/api/mail')
          .send({ subject: 'X', text: 'Y', to: 'a@b.com', from: 'c@d.com' })
          .expect(401)
      );
  
      it('payload incompleto → 422 unprocessable entity', async () => {
        const res = await api
          .post('/api/mail')
          .set('Authorization', `Bearer ${token}`)
          .send({ subject: 'Hola' })
          .expect(422);
  
        // al menos tres errores (text, to, from)
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
      });
      
      it('sendEmail lanza error → 500 internal server error', async () => {
        sendEmail.mockRejectedValueOnce(new Error('SMTP down'));
        await api
          .post('/api/mail')
          .set('Authorization', `Bearer ${token}`)
          .send({
            subject: 'Test',
            text:    'msg',
            to:      'a@b.com',
            from:    'c@d.com'
          })
          .expect(500);
      });
    });
  });
  