/*
    He separado la lógica del servidor (app.listen) de la configuración de la aplicacion (app.js), para evitar problemas al hacer los teset con Jest, donde importar 'app'
    no debería iniciar el servidor automáticamente
    Así, puedo reutilizar la configuración de la app en los test sin que se escuche en un puerto (sino me dice que el puerto ya está escuchando)

*/
const app = require('./app');
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
  console.log(`Documentación Swagger en http://localhost:${port}/api-docs`);
});
