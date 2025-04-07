const { sendEmail } = require('./handleEmail');

const generateCodeAndSendEmail = async (user, type = 'register') => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.code = code;
  user.tries = 3;
  await user.save();

  let subject, html;

  switch (type) {
    case 'register':
      subject = 'Verificación de cuenta';
      html = `<h1>Bienvenido/a</h1><p>Tu código de verificación es: <b>${code}</b></p>`;
      break;

    case 'reset':
      subject = 'Código de recuperación de contraseña';
      html = `<p>Tu código de recuperación es: <b>${code}</b></p>`;
      break;

    case 'invite':
      subject = 'Has sido invitado a la plataforma';
      html = `
        <p>Has sido invitado a unirte a la empresa <b>${user.company?.name || ''}</b>.</p>
        <p>Tu código de acceso es: <b>${code}</b></p>
        <p>Accede a <a href="${process.env.FRONTEND_URL}/auth/reset">este enlace</a> para establecer tu contraseña.</p>
      `;
      break;

    default:
      throw new Error('Tipo de email no soportado');
  }

  await sendEmail({
    to: user.email,
    subject,
    html
  });
};

module.exports = { generateCodeAndSendEmail };
