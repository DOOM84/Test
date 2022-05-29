import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const sourcesSnap = await db.collection('sources').get();

        const sources = sourcesSnap.docs.map((doc) => {
            return {...doc.data(), dbId: doc.id}
        });

        return {
            sources
        };

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
    }

})
