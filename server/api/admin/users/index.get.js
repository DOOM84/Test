import admin from "firebase-admin";
import {
    getFirestore
} from "firebase-admin/firestore";

const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        try {

            const resUsers = [];

            const {users} = await admin.auth().listUsers(1000, '1');
            const groupsSnap = await db.collection('groups').get();
            const levelsSnap = await db.collection('levels').get();

            const groups = groupsSnap.docs.map((doc) => {
                return {...doc.data(), id: doc.id}
            });
            const levels = levelsSnap.docs.map((doc) => {
                return {...doc.data()}
            });

            users.forEach((user) => {

                resUsers.push({
                    email: user.email,
                    displayName: user.displayName,
                    disabled: user.disabled,
                    customClaims: user.customClaims ? user.customClaims : {admin: false},
                    uid: user.uid
                })
            })


            const usersSnap = await db.collection('users').get();

            const usrs = usersSnap.docs.map((doc) => {
                return {
                    ...doc.data(),
                    //id: doc.id,
                    ...resUsers.filter(user => doc.id === user.uid)[0],
                    levelName: levels.filter(lev => lev.id === doc.data().level)[0].title,
                    fullGroups: doc.data().groups.length ? groups.filter(group => doc.data().groups.includes(group.id)) : []

                }
            });

            return {
                users: usrs,
                groups,
                levels
            };

        } catch (e) {

            event.res.setHeader('Content-Type', 'application/json');
            event.res.statusCode = 401;
            event.res.end(JSON.stringify({msg: 'error_auth', users: []}));
        }

    } catch (e) {
        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
    }
})
