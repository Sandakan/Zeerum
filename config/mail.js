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
						port: 587,
						secure: false, // true for 465, false for other ports
						auth: {
							user: process.env.MAIL_ACCOUNT, // generated ethereal user
							pass: process.env.MAIL_PASSWORD, // generated ethereal password
						},
					});
					await transporter.sendMail(
						{
							from: 'Zeerum Team <zeerumtest@outlook.com>',
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
			// ? //////
		} else reject('Missing required parameters to send an email.');
	});
};
module.exports = { sendMail };
