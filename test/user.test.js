/* eslint-env jest */
const supertest = require('supertest');
const mongoose = require('mongoose');

const { app, server } = require('../app');
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

    // limpo la colección de usuarios
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
    server.close();
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

            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('email', testUserData.email);
        });

        it('PATCH /api/user/register => 200 OK y actualiza datos personales', async () => {
            const newName = 'Updated User';
            const response = await api
                .patch('/api/user/register')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: newName, age: 30 })
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('name', newName);
        });

        it('DELETE /api/user => 200 OK al borrar la cuenta', async () => {
            const response = await api
                .delete('/api/user')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/Usuario eliminado/i);
        });

    });
});
