import {
    getFirestore
} from "firebase-admin/firestore";
import * as yup from 'yup';

const db = getFirestore();

const schema = yup.object({

    updated: yup.object({

        title: yup.string('errors.title_string')
            .trim('errors.title_required').required('errors.title_required'),
        description: yup.string('errors.description_string')
            .trim('errors.description_required').required('errors.description_required'),
    })
})

export default defineEventHandler(async (event) => {

        try {

            const updated = await useBody(event);

            await schema.validate({
                updated
            });

            if (updated) {

                const levelRef = db.collection('levels').doc(updated.dbId);

                const { dbId, ...updatedRest } = updated;

                const updRes = await levelRef.update(updatedRest);
            }

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
