import formidable from "formidable";
//import SibApiV3Sdk from 'sib-api-v3-sdk'
import nodemailer from 'nodemailer';
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import url from "url";
import {useCookie} from "h3";
import admin from "firebase-admin";

export default async (req, res) => {

    if (req.originalUrl === '/api/email' && req.method.toLowerCase() === 'post') {

        try {

            let {token} = url.parse(req.url, true).query;

            if (!token) {
                token = useCookie(req, 'token')
            }

            const form = formidable();

            const data = await new Promise((resolve, reject) => {
                form.parse(req, (err, fields, files) => {
                    resolve(firstValues(form, fields))
                });
            })

            const userInfo = await admin.auth().verifyIdToken(token);

            const userEmail = userInfo.email;


            let transporter = nodemailer.createTransport({
                host: "smtp-relay.sendinblue.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: '', // generated ethereal user
                    pass: '', // generated ethereal password
                },
            });

            const email = 'robot@designs.network';
            const name = 'Testing System';

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"' + name + '" <' + email + '>', // sender address
                to: userEmail, // list of receivers
                subject: "Статистика по тестам", // Subject line
                //text: "Hello world?", // plain text body
                html: data.info
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({msg: 'Success'}));

        } catch (e) {
           // console.log(e);
            res.statusCode = 401;
            res.end(JSON.stringify({msg: 'no or expired token'}));
        }

    } else {
        res.statusCode = 404;
        res.end('wrong URL');
    }
}