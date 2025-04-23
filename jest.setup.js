const mongoose = require('mongoose');


beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// un único afterAll para TODA la suite
afterAll(async () => {
  console.log.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();

  // solo cerramos si sigue abierta
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});


