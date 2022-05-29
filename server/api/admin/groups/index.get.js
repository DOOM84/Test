import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const groupsSnap = await db.collection('groups').get();

        const groups = groupsSnap.docs.map((doc) => {
            return {...doc.data(), dbId: doc.id}
        });

        return {
            groups
        };



    } catch (e) {
        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
    }

})
