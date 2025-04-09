const {IncomingWebhook} = require('@slack/webhook')

//PARA SLACK
const webHook = new IncomingWebhook(process.env.SLACK_WEBHOOK);
const loggerStream = {
    write: message =>{
        webHook.send({text:message});
    }
}

module.exports = loggerStream;