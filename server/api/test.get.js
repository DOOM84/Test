import {FieldValue, getFirestore/*, Timestamp, FieldValue*/} from 'firebase-admin/firestore';
import {useCookie} from "h3";
import admin from 'firebase-admin';
const db = getFirestore();



export default defineEventHandler(async (event) => {

    try {

        const token = useCookie(event.req, 'token') || useQuery(event).token;

        const {topicId} = useQuery(event);

        const userInfo = await admin.auth().verifyIdToken(token);

        const userId = userInfo.uid;

        const user = await admin.auth().getUser(userId);

        const userRef = await db.collection('users').doc(userId);

        const userDoc = await userRef.get();

        const userLevel = userDoc.data().level;

        const userAttempts= userDoc.data().attempts;


        if(userAttempts < 1 || user.disabled){
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

        return {
            tasks: selected,
            userId
        };

    } catch (e) {

        if(e.message === 'no_access'){
            event.res.statusCode = 403;
            event.res.end(JSON.stringify({msg: 'No access'}));
        }else{
            event.res.writeHead(401, {
                "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
            });
            event.res.end(JSON.stringify({msg: 'no or expired token'}));
        }
    }

})
