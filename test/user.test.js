/* eslint-env jest */
const supertest = require('supertest');
const mongoose = require('mongoose');

const app  = require('../app');
const { usersModel } = require('../models');

const { encrypt } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');

const api = supertest(app);

let token;

const testUserData = {
    name: 'Test User',
    age: 25,
    email: 'test@example.com',
    password: 'password123',
};

beforeAll(async () => {
    await new Promise((resolve) => {
        if (mongoose.connection.readyState === 1) return resolve();
        mongoose.connection.once('connected', resolve);
    });

    // limpio la colección de usuarios
    await usersModel.deleteMany({});

    const hashedPassword = await encrypt(testUserData.password);
    const createdUser = await usersModel.create({
        ...testUserData,
        password: hashedPassword,
    });

    createdUser.set('password', undefined, { strict: false });
    token = await tokenSign(createdUser, process.env.JWT_SECRET);

    console.log('Token para tests:', token);
});

afterAll(async () => {
    await mongoose.connection.close();
  });
  

describe('Pruebas para el módulo de Usuarios (/api/user)', () => {
    //
    // 1. Comportamiento sin token
    //
    describe('Sin token', () => {
        it('GET /api/user => 401 UNAUTHORIZED', async () => {
            await api
                .get('/api/user')
                .expect(401); // sin token => 401
        });

        it('DELETE /api/user => 401 UNAUTHORIZED', async () => {
            await api
                .delete('/api/user')
                .expect(401);
        });

        it('PATCH /api/user/register => 401 UNAUTHORIZED', async () => {
            await api
                .patch('/api/user/register')
                .expect(401);
        });
    });

    //
    // 2. Comportamiento con token
    //
    describe('Con token válido', () => {
        it('GET /api/user => 200 OK y devuelve los datos del usuario', async () => {
            const response = await api
                .get('/api/user')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect('Content-Type', /application\/json/);

                expect(response.body).toHaveProperty('user');
                expect(response.body.user).toHaveProperty('email', testUserData.email);                
        });

        it('PATCH /api/user/register => 200 OK y actualiza datos personales', async () => {
            const newName = 'Updated User';
            const response = await api
                .patch('/api/user/register')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated User',
                    surnames: 'Apellido Test',
                    nif: '12345678Z',
                    email: testUserData.email 
                  })                                   
                .expect(200);

                expect(response.body).toHaveProperty('user');
                expect(response.body.user).toHaveProperty('name', newName);                
        });

        it('DELETE /api/user => 200 OK al borrar la cuenta', async () => {
            const response = await api
                .delete('/api/user')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/Usuario desactivado/i);
        });


        it('PATCH /api/user/company => 200 OK y actualiza la empresa del usuario', async () => {
            const response = await api
                .patch('/api/user/company')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    company: {
                        name: 'Mi Empresa S.A.',
                        cif: 'B12345678',
                        street: 'Gran Vía',
                        number: 123,
                        postal: 28013,
                        city: 'Madrid',
                        province: 'Madrid'
                    }
                })
                .expect(200);
        
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.company).toHaveProperty('name', 'Mi Empresa S.A.');
        });


        it('POST /api/user/recover => 200 OK si el email existe', async () => {
            const response = await api
                .post('/api/user/recover')
                .send({ email: testUserData.email })
                .expect(200);
        
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/código enviado/i);
        });

        it('PUT /api/user/validation => 200 OK si el código es válido', async () => {
            // actualizamos manualmente el código en BD para el test
            const user = await usersModel.findOne({ email: testUserData.email });
            user.code = '654321';
            await user.save();
        
            const response = await api
                .put('/api/user/validation')
                .send({ email: testUserData.email, code: '654321' })
                .expect(200);
        
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('token');
        });
        
        it('POST /api/user/invite => 201 OK e invita a un usuario nuevo', async () => {
            // primero actualizamos el usuario con una compañía
            await usersModel.findOneAndUpdate(
                { email: testUserData.email },
                {
                    company: {
                        name: 'Mi Empresa',
                        cif: 'B12345678',
                        street: 'Gran Vía',
                        number: 123,
                        postal: 28013,
                        city: 'Madrid',
                        province: 'Madrid'
                    }
                }
            );
        
            const response = await api
                .post('/api/user/invite')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'invitado@example.com' })
                .expect(201);
        
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.role).toBe('guest');
        });
        
        //! REALIZAR LOGO Y PASSWORD?

    });
});
