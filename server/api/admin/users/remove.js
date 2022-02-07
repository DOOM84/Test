import admin from "firebase-admin";
import {
    FieldValue,
    getFirestore
} from "firebase-admin/firestore";
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';

const db = getFirestore();

export default async (req, res) => {

    if (req.originalUrl === '/api/admin/users/remove' && req.method.toLowerCase() === 'post') {
        try {


            const form = formidable();

            const {data} = await new Promise((resolve, reject) => {
                form.parse(req, (err, fields, files) => {
                    resolve(firstValues(form, fields))
                });
            })

            const {id} = JSON.parse(data);

            if (id) {
                await admin.auth().deleteUser(id);
                await db.collection('users').doc(id).delete();

                const resultsSnap = await db.collection('results').where('userId', '==', id).get();

                resultsSnap.forEach(doc => {
                    doc.ref.delete()
                })
            }

            await db.collection('totals').doc('users').update({
                count: FieldValue.increment(-1)
            });

            res.setHeader('Content-Type', 'application/json');

            res.end(JSON.stringify({
                id
            }));
        } catch (e) {

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 401;
            res.end(JSON.stringify({msg: 'error_auth'}));
        }
    } else {
        res.statusCode = 404;
        res.end('wrong URL');
    }
}
