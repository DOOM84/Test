import {
    FieldValue,
    getFirestore
} from "firebase-admin/firestore";
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';

const db = getFirestore();

export default async (req, res) => {

    if (req.originalUrl === '/api/admin/topics/remove' && req.method.toLowerCase() === 'post') {
        try {

            const form = formidable();

            const {id} = await new Promise((resolve, reject) => {
                form.parse(req, (err, fields, files) => {
                    resolve(firstValues(form, fields))
                });
            })

            if (id) {
                await db.collection('topics').doc(id).delete();
            }

            await db.collection('totals').doc('topics').update({
                count: FieldValue.increment(-1)
            });

            res.setHeader('Content-Type', 'application/json');

            res.end(JSON.stringify({
                id
            }));

        } catch (e) {

            if (e.path) {
                res.statusCode = 422;
                res.end(JSON.stringify({
                    msg: e.errors[0]
                }));

            } else {

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 401;
                res.end(JSON.stringify({msg: 'error_auth'}));

            }
        }
    } else {
        res.statusCode = 404;
        res.end('wrong URL');
    }
}
