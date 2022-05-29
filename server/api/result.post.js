import { getFirestore as getFire, FieldValue /*, Timestamp, FieldValue*/ } from 'firebase-admin/firestore';
import {useCookie} from "h3";
import admin from 'firebase-admin';
import {
    query,
    collection,
    where,
    documentId,
    getDocs,
    getFirestore
} from "firebase/firestore";

const db = getFirestore();
const dbase = getFire();

export default defineEventHandler(async (event) => {

        try {

            const token = useCookie(event.req, 'token') || useQuery(event).token;

            const userInfo = await admin.auth().verifyIdToken(token);

            const userRes = await useBody(event);

            if(userInfo.uid !== userRes.userId){
                await Promise.reject(Error('no_access'));
            }

            const {displayName} = await admin.auth().getUser(userInfo.uid);

            const userRef = await dbase.collection('users').doc(userInfo.uid);

            const userDoc = await userRef.get();

            const userLevel = userDoc.data().level;

            const userLevelName = (await dbase.collection('levels')
                .where("id", "==", userLevel).get()).docs[0].data().title;

            const maxRef = await dbase.collection('levels').select('id').orderBy('id', 'desc')
                .limit(1).get();

            const dataRef = maxRef.docs ? maxRef.docs[0] : null;

            const maxLevel = dataRef.data().id;

            /*

            !!!!!!!!!!!!!!!!!!Only if array of ids <= 10 !!!!!!!!!!!

            const q = query(
               collection(db, "tasks"),
               where(documentId(), "in",
                   userRes.uniqueKeys
               ),
           );
           const tasksDocsSnap = await getDocs(q);

           const answeredTasks = tasksDocsSnap.docs.map((doc) => {
                return {id:doc.id, answers:doc.data().answers};
            });
            !!!!!!!!!!!!!!!!!!Only if array of ids <= 10 !!!!!!!!!!!

           */
            const answersToDb = {};
            let inputtedAnswers = [];

            if(Object.keys(userRes.inputs).length > 0){
                for (const [key, value] of Object.entries(userRes.inputs)) {
                    answersToDb[key] = value;
                    const answer = (await dbase.collection('tasks').doc(key).get()).data().answer;
                    inputtedAnswers.push(answer.trim().toLowerCase() === value.trim().toLowerCase())
                }
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

                answersToDb[taskKey] = res[taskKey];

                let taskAnswers = answeredTasks.filter((answeredTask)=> answeredTask.id === taskKey);


                let correctAnswers = taskAnswers[0].answers.filter( answer => answer.correct === true).map( answ => answ.id);

                if(userAnswers.length !== correctAnswers.length){
                    return false;
                }
                return userAnswers.every( ua => correctAnswers.includes(ua) );
               // userAnswers.some(r => correctAnswers.indexOf(r) >= 0);
            })

            finalResults.push(...inputtedAnswers);

            const countedIncorrectRes = finalResults.filter((r) => !r).length

            const countedCorrectRes = finalResults.filter((r) => r).length

            const final = ((countedCorrectRes / 50) * 100).toFixed();

            let value;
            let ects;
            let natValue;

            if (final >= 90 && final <= 100) {
                value = 'Відмінно';
                ects = 'A';
                natValue = 5;

                if(+userLevel < +maxLevel){
                    await userRef.update({
                        level: FieldValue.increment(1)
                    });
                }

            } else if (final >= 82 && final <= 89) {

                value = 'Добре';
                ects = 'B';
                natValue = 4;

            } else if (final >= 75 && final <= 81) {
                value = 'Добре';
                ects = 'C';
                natValue = 4;

            } else if (final >= 67 && final <= 74) {
                value = 'Задовільно';
                ects = 'D';
                natValue = 3;

            } else if (final >= 60 && final <= 66) {
                value = 'Задовільно';
                ects = 'E';
                natValue = 3;

            } else if (final >= 35 && final <= 59) {
                value = 'Незадовільно';
                ects = 'FX';
                natValue = 1;

                if(+userLevel > 1){
                    await userRef.update({
                        level: FieldValue.increment(-1)
                    });
                }

            } else if (final >= 0 && final <= 34) {
                value = 'Незадовільно';
                ects = 'F';
                natValue = 0;

                if(+userLevel > 1){
                    await userRef.update({
                        level: FieldValue.increment(-1)
                    });
                }
            }

            const editedUserLevel = (await dbase.collection('users').doc(userInfo.uid).get()).data().level;

            const level = (await dbase.collection('levels')
                .where("id", "==", editedUserLevel).get()).docs[0].data().title;

           const resToDb = {
                levelId: +userLevel,
                topicId: +userRes.topicId,
                groupId: userRes.groupId,
                startedAt: userRes.startedAt,
                duration: userRes.duration,
                answers: answersToDb,//userRes.finalRes,
                userId: userInfo.uid,
                correct: countedCorrectRes,
                incorrect: countedIncorrectRes,
                result: {
                    final: +final,
                    value: value,
                    ects: ects,
                    natValue: natValue
            }
            }


            const resultsRef = await dbase.collection("results")
                .where('userId', '==', userInfo.uid)
                .where('levelId', '==', +userLevel)
                .where('groupId', '==', userRes.groupId)
                .where('topicId', '==', +userRes.topicId)
                .get();

           let addedID;

            if(resultsRef.empty){

                const newResultsRef = await dbase.collection('results').doc();

                await newResultsRef.set(resToDb);

                addedID = newResultsRef.id

            }else{

                await resultsRef.docs[0].ref.set(resToDb)

                addedID = resultsRef.docs[0].id;

            }


            let topic = 'Study guide';

            if(resToDb.topicId !== 0 ){
                const topicSnap = await dbase.collection('topics')
                    .where("id", "==", resToDb.topicId).get();
                topic = topicSnap.docs[0].data().name;
            }

            return {

                    finalResults: {result : +final, value, ects, natValue},
                    level,
                    addedID,
                    socketRes: {
                        startedAt: resToDb.startedAt,
                        levelId: userLevel,
                        level: userLevelName,
                        result: resToDb.result,
                        userId: resToDb.userId,
                        topicId: resToDb.topicId,
                        user: displayName,
                        topic,
                        groupId: resToDb.groupId
                    }

                };

            } catch (e) {

            console.log(e);

            if(e.message === 'no_access'){
                     event.res.statusCode = 403;
                     event.res.end(JSON.stringify({msg: 'No access'}));
                 }else{
                     event.res.statusCode = 401;
                     event.res.end(JSON.stringify({msg: 'no or expired token'}));
                 }
            }
})
