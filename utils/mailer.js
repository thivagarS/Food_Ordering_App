const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const keys = require('../config/keys');

const options = {
    auth: {
        api_key: keys.sendGridKey
    }
};

const mailer = nodemailer.createTransport(sgTransport(options));

exports.sendMail = mailDetails => {
    const email = {
        to: mailDetails.to,
        from: mailDetails.from,
        subject: mailDetails.subject,
        text: mailDetails.text,
        html: mailDetails.html
    };
    return mailer.sendMail(email);
}
