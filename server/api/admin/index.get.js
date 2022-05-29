import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const totalsSnap = await db.collection('totals').get();

        const counts = {}

        totalsSnap.docs.forEach((doc) => {

            counts[doc.id] = doc.data()
        })

        return {
            counts
        };

    } catch (e) {

    }

})
