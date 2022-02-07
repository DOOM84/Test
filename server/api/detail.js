import { getFirestore} from 'firebase-admin/firestore';
import * as url from "url";
import {useCookie} from "h3";
import admin from 'firebase-admin';

const db = getFirestore();

export default async (req, res) => {

        try {

            let {resId, token} = url.parse(req.url, true).query;

            if(!resId){return {}}

            if (!token) {
                token = useCookie(req, 'token')
            }

            if (!token) {
                return {}
            }

            const userInfo = await admin.auth().verifyIdToken(token);

            const resSnap = await db.collection('results').doc(resId).get();

            const result = resSnap.data();


            const levelSnap = await db.collection('levels')
                .where("id", "==", result.levelId).get();

            const level = levelSnap.docs[0].data().title;


            let topic;

            if(result.topicId === 0){

                topic = 'Study guide'

            }else{

                const topicSnap = await db.collection('topics')
                    .where("id", "==", result.topicId).get();

                topic = topicSnap.docs[0].data().name
            }

            const taskIds = Object.keys(result.answers);

            const tasks = await Promise.all(taskIds.map(async (taskId) => {

                const taskRef = await db.collection('tasks').doc(taskId).get();

                const fullTask = taskRef.data();

                if(fullTask.topics.length > 10){fullTask.topics = fullTask.topics.slice(0, 10)}

                if(fullTask.sources.length > 10){fullTask.sources = fullTask.sources.slice(0, 10)}


                if(fullTask.topics && fullTask.topics.length){
                    const topicsSnap = await db.collection('topics')
                        .where('id', 'in', fullTask.topics).select('name', 'id').get();

                    fullTask.topics = topicsSnap.docs.map((doc) => {
                        return {...doc.data()}
                    });
                }else{
                    fullTask.topics = []
                }

                if(fullTask.sources && fullTask.sources.length){
                    const sourcesSnap = await db.collection('sources')
                        .where('id', 'in', fullTask.sources).select('url').get();

                    fullTask.sources = sourcesSnap.docs.map((doc) => {
                        return {...doc.data()}
                    });
                }else{
                    fullTask.sources = []
                }

                fullTask.userAnswers = result.answers[taskId]

                return fullTask
            }))

            res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    tasks, level, topic

                }));

            } catch (e) {

                 //console.log(e);

                     res.statusCode = 401;
                     res.end(JSON.stringify({msg: 'no or expired token'}));

                /*res.writeHead(401, {
                    "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
                });*/


                /*res.writeHead(401, {
                    "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
                });
                //res.statusCode = 401;
                res.end(JSON.stringify({msg: 'no or expired token'}));*/
            }
}
