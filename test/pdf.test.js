/* eslint-env jest */
const supertest = require('supertest');
const mongoose  = require('mongoose');
const app       = require('../app');

const api = supertest(app);


describe('Pruebas del módulo de PDF (/api/pdf)', () => {
  it('GET /api/pdf → 200 y devuelve un PDF', async () => {
    const res = await api
      .get('/api/pdf')
      .expect(200);

    // comprueba cabeceras
    expect(res.headers['content-disposition']).toMatch(/attachment;.*documento\.pdf/);
    expect(res.headers['content-type']).toMatch(/pdf/);

    // supertest coloca el contenido binario en res.text
    expect(typeof res.text).toBe('string'); //comprobamos que es un string
    expect(res.text.length).toBeGreaterThan(0); //comprobamos que no es vacío
  });
});
