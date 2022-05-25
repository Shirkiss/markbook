const fs = require('fs');
let nodemailer = require('nodemailer');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

async function sendMail(email, senderName) {
    let transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: 'markbook-now@outlook.com',
            pass: "wN+Aai%.a9^'z8Y"
        }
    });

    let mailOptions = {
        from: 'markbook-now@outlook.com',
        to: email,
        subject: 'Join Markbook family',
        text: `${senderName} invited you to join Markbook`,
        html: await readFile('/Users/shirfrauenglas/WebstormProjects/markbook/src/services/mail/mail.html')
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


module.exports = {
    sendMail
}