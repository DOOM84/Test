import {
    getFirestore
} from "firebase-admin/firestore";
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import * as yup from 'yup';

const db = getFirestore();

const schema = yup.object({

    updated: yup.object({

        text: yup.string('errors.task_string')
            .trim('errors.task_required').required('errors.task_required'),
        answer: yup
            .string()
            .when('type', {
                is: value => !!value,
                then: yup.string().trim('errors.answer_required').required('errors.answer_required')
            }),
        answers: yup.array()
            .when('type', {
                is: value => !value,
                then: yup.array()
                    .of(
                        yup.object().shape({
                            body:yup.string('errors.answer_string')
                                .max(255)
                                .required('errors.answer_required')
                                .label('body')
                        })
                    )
                    .min(1, 'errors.answer_required')
            }),
        level: yup.string('errors.level_required').trim('errors.level_required').required('errors.level_required'),
    })
})

export default async (req, res) => {

    if (req.originalUrl === '/api/admin/tasks/edit' && req.method.toLowerCase() === 'post') {
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

            const taskRef = db.collection('tasks').doc(updated.dbId);

                const { dbId, ...updatedRest } = updated;

                const updRes = await taskRef.update(updatedRest);

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
