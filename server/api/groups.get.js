import { getFirestore/*, Timestamp, FieldValue*/ } from 'firebase-admin/firestore';
const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {


        const groupsRef = db.collection('groups');

        const groupsSnap = await groupsRef.where("status", "==", true).get();

        const groups = groupsSnap.docs.map((doc) => {
            return {...doc.data(), id:doc.id};
        });

       return {
            groups
        };



    } catch (e) {

    }

})
