import * as url from "url";
import admin from 'firebase-admin';
import * as serviceAccount from "../../helpers/tests-18555-firebase-adminsdk-b0dzf-7f9fd0ba9d.json";
import {
    useCookie
} from 'h3'

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default async (req, res) => {

    try {
        let {token} = url.parse(req.url, true).query;

        if (!token) {
            token = useCookie(req, 'token')
        }

        const userInfo = await admin.auth().verifyIdToken(token);

        const user = await admin.auth().getUser(userInfo.uid);

        const userSnap = await db.collection('users').doc(userInfo.uid).get();

        const userLevel = userSnap.data().level;

        const levelSnap = await db.collection('levels')
            .where("id", "==", userLevel).get();

        const level = levelSnap.docs[0].data().title


        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            login: user.displayName,
            level: level,
        }));

    } catch (e) {
        res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));
    }

}
