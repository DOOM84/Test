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

        const user = await admin.auth().getUser(userInfo.uid);

        const userSnap = await db.collection('users').doc(userInfo.uid).get();

        const userLevel = userSnap.data().level;

        const levelSnap = await db.collection('levels')
            .where("id", "==", userLevel).get();

        const level = levelSnap.docs[0].data().title


        return {
            login: user.displayName,
            level: level,
        };

    } catch (e) {
        event.res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        event.res.end(JSON.stringify({msg: 'no or expired token'}));
    }

})
