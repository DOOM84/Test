import {
    FieldValue,
    getFirestore
} from "firebase-admin/firestore";
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

export default defineEventHandler(async (event) => {

        try {

            const updated = await useBody(event);

            await schema.validate({
                updated
            });

            const { id } = await db.collection("tasks").add(updated);

            updated.dbId = id;

            await db.collection('totals').doc('tasks').update({
                count: FieldValue.increment(1)
            });

            return {
                result: updated
            };
        } catch (e) {

            if (e.path) {
                event.res.statusCode = 422;
                event.res.end(JSON.stringify({
                    msg: e.errors[0]
                }));

            } else {

                event.res.setHeader('Content-Type', 'application/json');
                event.res.statusCode = 401;
                event.res.end(JSON.stringify({msg: 'error_auth'}));

            }
        }
})
