import {FieldValue, getFirestore/*, Timestamp, FieldValue*/} from 'firebase-admin/firestore';
import * as url from "url";
import {useCookie} from "h3";
import admin from 'firebase-admin';
const db = getFirestore();



export default async (req, res) => {

    try {

        let {topicId, token} = url.parse(req.url, true).query;

        if(!topicId){return {}}

        if (!token) {
            token = useCookie(req, 'token')
        }

        const userInfo = await admin.auth().verifyIdToken(token);

        const userId = userInfo.uid;


        const userRef = await db.collection('users').doc(userId);

        const userDoc = await userRef.get();

        const userLevel = userDoc.data().level;

        const userAttempts= userDoc.data().attempts;


        if(userAttempts < 1){
            await Promise.reject(Error('no_access'));
        }


        if(userAttempts > 0){
            await userRef.update({
                attempts: FieldValue.increment(-1)
            });
        }

        const tasksRef = db.collection('tasks');

        const topicTasks = (+topicId === 0) ? await tasksRef.where("level", "==", userLevel).get() :
            await tasksRef.where("level", "==", userLevel)
                .where('topics', 'array-contains-any',
                    [+topicId]).get();

        const result = topicTasks.docs.map((doc)=>{
            let task = {
                level: doc.data().level,
                answers: doc.data().answers,
                text: doc.data().text,
                type: doc.data().type ? doc.data().type : null,
                id: doc.id
            }
            if(task.answers){
                task.answers = task.answers.map((answer)=>({body: answer.body, id: answer.id}))
                task.answers.sort(() => Math.random() - 0.5)
            }

            return task
        })

        result.sort(() => Math.random() - 0.5);

        let selected = result.slice(0, 50);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            tasks: selected,
            userId
        }));

    } catch (e) {

        if(e.message === 'no_access'){
            res.statusCode = 403;
            res.end(JSON.stringify({msg: 'No access'}));
        }else{
            res.writeHead(401, {
                "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
            });
            res.end(JSON.stringify({msg: 'no or expired token'}));
        }

        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });*/
        //res.statusCode = 401;
        //res.end(JSON.stringify({msg: 'no or expired token'}));

        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));*/
    }

}
