import admin from "firebase-admin";
import {
    FieldValue,
    getFirestore
} from "firebase-admin/firestore";

const db = getFirestore();

export default defineEventHandler(async (event) => {

        try {

            const {id} = await useBody(event);

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

            return {
                id
            };
        } catch (e) {

            event.res.setHeader('Content-Type', 'application/json');
            event.res.statusCode = 401;
            event.res.end(JSON.stringify({msg: 'error_auth'}));
        }
})
