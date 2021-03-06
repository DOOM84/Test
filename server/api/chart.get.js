import {getFirestore, /*FieldValue*/ /*, Timestamp, FieldValue*/} from 'firebase-admin/firestore';
import {useCookie} from "h3";
import groupBy from "~/helpers/groupBy";
import admin from 'firebase-admin';

const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const token = useCookie(event.req, 'token') || useQuery(event).token;

        const {userId} = useQuery(event);

        let userInfo = {};

        if (userId) {
            userInfo.uid = userId;
        } else {
            userInfo = await admin.auth().verifyIdToken(token);
        }

        const resultsSnap = await db.collection('results')
            .where('userId', '==', userInfo.uid).orderBy('startedAt').get();

        const results = await Promise.all(resultsSnap.docs.map(async (doc) => {

            const levelSnap = await db.collection('levels')
                .where("id", "==", doc.data().levelId).get();

            const level = levelSnap.docs[0].data().title

            let topic;

            if (doc.data().topicId === 0) {

                topic = 'Study guide'

            } else {

                const topicSnap = await db.collection('topics')
                    .where("id", "==", doc.data().topicId).get();

                topic = topicSnap.docs[0].data().name;
            }

            const groupRef = await db.collection('groups').doc(doc.data().groupId).get();

            const group = groupRef.data().name;

            return {
                level,
                topic,
                group,
                startedAt: doc.data().startedAt,
                duration: doc.data().duration,
                result: doc.data().result,
                correct: doc.data().correct,
                incorrect: doc.data().incorrect,
                id: doc.id
            }

        }));

        const groupedByGroup = groupBy(results, 'group');

        const groupKeys = Object.keys(groupedByGroup);

        groupKeys.forEach((groupKey) => {
            groupedByGroup[groupKey] = groupBy(groupedByGroup[groupKey], 'level');

            const levelKeys = Object.keys(groupedByGroup[groupKey]);

            levelKeys.forEach((level) => {
                groupedByGroup[groupKey][level] = groupedByGroup[groupKey][level].map((item) => ({
                    result: item.result.final,
                    startedAt: item.startedAt, topic: item.topic
                }))
            })
        })

        return {
            results: groupedByGroup
        };

    } catch (e) {

        if (e.message === 'no_access') {
            event.res.statusCode = 403;
            event.res.end(JSON.stringify({msg: 'No access'}));
        } else {
            event.res.statusCode = 401;
            event.res.end(JSON.stringify({msg: 'no or expired token'}));
        }
    }
})

