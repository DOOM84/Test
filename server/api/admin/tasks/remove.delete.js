import {
    FieldValue,
    getFirestore
} from "firebase-admin/firestore";

const db = getFirestore();

export default defineEventHandler(async (event) => {

        try {

            const {id} = await useBody(event);

            if (id) {
                await db.collection('tasks').doc(id).delete();
            }

            await db.collection('totals').doc('tasks').update({
                count: FieldValue.increment(-1)
            });

            return {
                id
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
