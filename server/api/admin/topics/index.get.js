import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const topicsSnap = await db.collection('topics').get();

        const topics = topicsSnap.docs.map((doc) => {
            return {...doc.data(), dbId: doc.id}
        });

        return {
            topics
        };



    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
    }

})
