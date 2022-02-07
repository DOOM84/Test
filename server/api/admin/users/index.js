import admin from "firebase-admin";
import {
    getFirestore
} from "firebase-admin/firestore";

const db = getFirestore();

export default async (req, res) => {

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
                    //photoURL: user.photoURL ? user.photoURL.substring(user.photoURL.lastIndexOf('/') + 1) : null,
                    disabled: user.disabled,
                    customClaims: user.customClaims ? user.customClaims : {admin: false},
                    uid: user.uid
                })
            })


            const usersSnap = await db.collection('users').get();

            //const userRef = db.collection('users').doc(updated.dbId);

            const usrs = usersSnap.docs.map((doc) => {
                return {
                    ...doc.data(),
                    //id: doc.id,
                    ...resUsers.filter(user => doc.id === user.uid)[0],
                    levelName: levels.filter(lev => lev.id === doc.data().level)[0].title,
                    fullGroups: doc.data().groups.length ? groups.filter(group => doc.data().groups.includes(group.id)) : []

                }
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                users: usrs,
                groups,
                levels
            }));

        } catch (e) {

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 401;
            res.end(JSON.stringify({msg: 'error_auth', users: []}));
        }

    } catch (e) {
        //console.log(e);
        res.statusCode = 404;
        res.end('Error occurred. Try again later...');
    }
}
