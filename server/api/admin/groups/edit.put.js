import {
    getFirestore
} from "firebase-admin/firestore";
import * as yup from 'yup';

const db = getFirestore();

const schema = yup.object({

    updated: yup.object({

        name: yup.string('errors.title_string')
            .trim('errors.title_required').required('errors.title_required'),
    })
})

export default defineEventHandler(async (event) => {

        try {

            const updated = await useBody(event);

            await schema.validate({
                updated
            });

            if (updated) {

                const groupRef = db.collection('groups').doc(updated.dbId);

                const { dbId, ...updatedRest } = updated;

                const updRes = await groupRef.update(updatedRest);
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
