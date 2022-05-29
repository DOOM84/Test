import admin from 'firebase-admin';

import {
    useCookie
} from 'h3'

import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const token = useCookie(event.req, 'token') || useQuery(event).token;

        const userInfo = await admin.auth().verifyIdToken(token);

        const userId = userInfo.uid;

        const userSnap = await db.collection('users').doc(userId).get();

        const userGroups = userSnap.data().groups;

        const groupsRef = db.collection('groups');

        const groups = (await Promise.all(userGroups.map(async (group) => {
            return {...(await groupsRef.doc(group).get()).data(), id: group}
        }))).filter((gr)=> gr.can_pass)

        const topicsSnap = await db.collection('topics')
            .where('status', '==', true).select('name', 'id').get();

        const topics = topicsSnap.docs.map((doc) => {
            return {...doc.data()};
        });

        return {
            groups: groups.map((group)=>({id: group.id, name: group.name})),
            topics
        };

    } catch (e) {
        //console.log(e);
        event.res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        event.res.end(JSON.stringify({msg: 'Not authenticated'}));
    }

})
