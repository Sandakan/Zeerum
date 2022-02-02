const nodemailer = require('nodemailer');
const ejs = require('ejs');
require('dotenv').config();

const sendMail = (fullPathToEjsView, ejsParams = {}, emailData = {}) => {
	return new Promise(async (resolve, reject) => {
		if (fullPathToEjsView && emailData.to && emailData.subject) {
			await ejs.renderFile(fullPathToEjsView, ejsParams, async (err, emailBody) => {
				if (err) return reject(err);
				else {
					const transporter = nodemailer.createTransport({
						host: process.env.MAIL_HOST,
						secureConnection: false,
						port: 587,
						tls: {
							ciphers: 'SSLv3',
						},
						auth: {
							user: process.env.MAIL_ACCOUNT,
							pass: process.env.MAIL_PASSWORD,
						},
					});
					await transporter.sendMail(
						{
							from: `Zeerum Team <${process.env.MAIL_ACCOUNT}>`,
							to: emailData.to,
							subject: emailData.subject,
							html: emailBody,
						},
						(err, result) => {
							if (err) return reject(err);
							else resolve({ success: true, result });
						}
					);
				}
			});
		} else reject('Missing required parameters to send an email.');
	});
};
module.exports = { sendMail };
