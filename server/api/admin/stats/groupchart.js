import * as url from "url";
import { getFirestore} from 'firebase-admin/firestore';
import admin from "firebase-admin";
const db = getFirestore();

export default async (req, res) => {

    try {

        const {groupId} = url.parse(req.url, true).query;

        const resultsSnap = await db.collection('results')
            .select('levelId', 'topicId', 'userId', 'startedAt', 'result').orderBy('startedAt')
            .where('groupId', '==', groupId).get();

        const results = await Promise.all(resultsSnap.docs.map(async (doc) => {

            const levelSnap = await db.collection('levels')
                .where("id", "==", doc.data().levelId).get();

            const level = levelSnap.docs[0].data().title;

            let topic = 'Study guide';

            if(doc.data().topicId !== 0 ){
                const topicSnap = await db.collection('topics')
                    .where("id", "==", doc.data().topicId).get();
                    topic = topicSnap.docs[0].data().name;
            }

            const {displayName} = await admin.auth().getUser(doc.data().userId);

            return {...doc.data(),/* id: doc.id,*/ user: displayName, level, topic}
        }))


        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            results,
        }));

    } catch (e) {

        res.statusCode = 404;
        res.end('Error occurred. Try again later...');
        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));*/
    }

}




