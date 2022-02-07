import {useCookie} from "h3";
import admin from 'firebase-admin';
import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import getMsg from "~/helpers/getMsg";

import {
    query,
    collection,
    where,
    documentId,
    getDocs,
    getFirestore
} from "firebase/firestore";

const db = getFirestore();

export default async (req, res) => {

    if (req.originalUrl === '/api/message' && req.method.toLowerCase() === 'post') {
        try {

            const token = useCookie(req, 'token');

            const userInfo = await admin.auth().verifyIdToken(token);

            const form = formidable();

            const {data} = await new Promise((resolve, reject) => {
                form.parse(req, (err, fields, files) => {
                    resolve(firstValues(form, fields))
                });
            })

            const userRes = JSON.parse(data);

            if(userInfo.uid !== userRes.userId){
                await Promise.reject(Error('no_access'));
            }

            let queries = [];

            for(let i = 0; i < userRes.uniqueKeys.length; i += 10) {
                queries.push(query(
                    collection(db, "tasks"),
                    where(documentId(), "in", userRes.uniqueKeys.slice(i, i + 10)),
                ));
            }

            let tasksDocsSnap = [];

            for(let i = 0; i < queries.length; i++) {
                tasksDocsSnap.push(getDocs(queries[i]));
            }

            tasksDocsSnap = await Promise.all(tasksDocsSnap);

            let taskDocs = [...new Set([].concat(...tasksDocsSnap.map((o) => o.docs)))];

            const answeredTasks = taskDocs.map((doc) => {
                return {id:doc.id, answers:doc.data().answers};
            });

            const finalResults = userRes.finalRes.map((res) => {

                let taskKey = Object.keys(res)[0];

                let userAnswers = res[taskKey];

                let taskAnswers = answeredTasks.filter((answeredTask)=> answeredTask.id === taskKey);


                let correctAnswers = taskAnswers[0].answers.filter( answer => answer.correct === true).map( answ => answ.id);

                if(userAnswers.length !== correctAnswers.length){
                    return false;
                }
                return userAnswers.every( ua => correctAnswers.includes(ua) );
            })

            const countedRes = finalResults.filter((r) => r).length

            const final = ((countedRes / userRes.uniqueKeys.length) * 100).toFixed();

            const phrase = getMsg(final, userRes.uniqueKeys.length);

            res.setHeader('Content-Type', 'application/json');

                res.end(JSON.stringify({
                    phrase
                }));

            } catch (e) {

                 if(e.message === 'no_access'){
                     res.statusCode = 403;
                     res.end(JSON.stringify({msg: 'No access'}));
                 }else{
                     res.statusCode = 401;
                     res.end(JSON.stringify({msg: 'no or expired token'}));
                 }
            }

        }

}
