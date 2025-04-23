const { IncomingWebhook } = require('@slack/webhook');

const isTest = process.env.NODE_ENV === 'test';
const webHook = new IncomingWebhook(process.env.SLACK_WEBHOOK);

const loggerStream = {
  write: message => {
    if (!isTest) {
      // en test no hacemos la llamada real
      webHook.send({ text: message }).catch(console.error);
    }
  }
};

module.exports = loggerStream;
