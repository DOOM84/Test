import {
    getFirestore
} from "firebase-admin/firestore";
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import * as yup from 'yup';

const db = getFirestore();

const schema = yup.object({

    updated: yup.object({

        name: yup.string('errors.title_string')
            .trim('errors.title_required').required('errors.title_required'),
        description: yup.string('errors.description_string')
            .trim('errors.description_required').required('errors.description_required'),
    })
})

export default async (req, res) => {

    if (req.originalUrl === '/api/admin/topics/edit' && req.method.toLowerCase() === 'post') {
        try {

            const form = formidable();

            const {data} = await new Promise((resolve, reject) => {
                form.parse(req, (err, fields, files) => {
                    resolve(firstValues(form, fields))
                });
            })

            const updated = JSON.parse(data);

            await schema.validate({
                updated
            });

            if (updated) {

                const topicRef = db.collection('topics').doc(updated.dbId);

                const { dbId, ...updatedRest } = updated;

                const updRes = await topicRef.update(updatedRest);
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                result: updated
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