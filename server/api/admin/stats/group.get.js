import { getFirestore} from 'firebase-admin/firestore';
import admin from "firebase-admin";

const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const {groupId} = useQuery(event);

        const usersSnap = await db.collection('users').where('groups', 'array-contains',
            groupId).get();

        const users = await Promise.all(usersSnap.docs.map(async (doc) => {
            const user = await admin.auth().getUser(doc.id);

            const resultsSnap = await db.collection('results')
                .where('userId', '==', doc.id)
                .where('groupId', '==', groupId)
                .orderBy('levelId')
                .orderBy('startedAt').get();

            const results = await Promise.all(resultsSnap.docs.map(async (doc) => {

                const levelSnap = await db.collection('levels')
                    .where("id", "==", doc.data().levelId).get();

                const level = levelSnap.docs[0].data().title

                let topic;

                if(doc.data().topicId === 0){

                    topic = 'Study guide'

                }else{

                    const topicSnap = await db.collection('topics')
                        .where("id", "==", doc.data().topicId).get();

                    topic = topicSnap.docs[0].data().name;
                }

                return {
                    level,
                    topic,
                    startedAt: doc.data().startedAt,
                    result: doc.data().result,
                }

            }))

            return {...doc.data(), uid:doc.id, name: user.displayName, results}
        }))

        return {
            users,
        };

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
    }

})




