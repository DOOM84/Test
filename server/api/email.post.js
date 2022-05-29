import nodemailer from 'nodemailer';
import {useCookie} from "h3";
import admin from "firebase-admin";

export default defineEventHandler(async (event) => {

        try {

            const token = useCookie(event.req, 'token') || useQuery(event).token;

            const data = await useBody(event);

            const userInfo = await admin.auth().verifyIdToken(token);

            const userEmail = userInfo.email;

            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: 'emsend84@gmail.com',
                    pass: 'Lacrimosa7!',
                },
            });

            const email = 'robot@designs.network';
            const name = 'Testing System';

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"' + name + '" <' + email + '>', // sender address
                to: userEmail, // list of receivers
                subject: data.subject, // Subject line
                //text: "Hello world?", // plain text body
                html: data.info
            });

            event.res.setHeader('Content-Type', 'application/json');
            event.res.end(JSON.stringify({msg: 'Success'}));

        } catch (e) {
           // console.log(e);
            event.res.statusCode = 401;
            event.res.end(JSON.stringify({msg: 'no or expired token'}));
        }
})