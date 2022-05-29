import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const levelsSnap = await db.collection('levels').get();
        const topicsSnap = await db.collection('topics').get();
        const sourcesSnap = await db.collection('sources').get();
        const tasksSnap = await db.collection('tasks').get();

        const levels = levelsSnap.docs.map((doc) => {
            return {...doc.data()}
        });
        const sources = sourcesSnap.docs.map((doc) => {
            return {...doc.data()}
        });
        const topics = topicsSnap.docs.map((doc) => {
            return {...doc.data()}
        });

        const tasks = tasksSnap.docs.map((taskDoc) => {

            const task = {...taskDoc.data(), dbId: taskDoc.id};

            task.levelName = levels.filter(lev => lev.id === task.level)[0].title;
            task.topics = task.topics.length ? topics.filter(topic => task.topics.includes(topic.id)) : [];
            task.sources = task.sources.length ? sources.filter(source => task.sources.includes(source.id)) : [];

            return task

        })

       return  {
            levels,
            tasks,
            topics,
            sources

        };



    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');

    }

})
