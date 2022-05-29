import {
    getFirestore
} from "firebase-admin/firestore";

const db = getFirestore();

export default defineEventHandler(async (event) => {

        try {

            const {id} = await useBody(event);

            if (id) {
                await db.collection('levels').doc(id).delete();
            }

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
