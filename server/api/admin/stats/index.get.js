import { getFirestore} from 'firebase-admin/firestore';
import admin from "firebase-admin";

const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const levelsSnap = await db.collection('levels').get();

        const levels = levelsSnap.docs.map((doc) => {
            return {...doc.data()}
        });
        const resUsers = [];

        const {users} = await admin.auth().listUsers(1000, '1');

        const groupsSnap = await db.collection('groups').get();

        const groups = groupsSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });

        users.forEach((user) => {

            resUsers.push({
                displayName: user.displayName,
                uid: user.uid
            })
        })

        const usersSnap = await db.collection('users').get();

        const usrs = usersSnap.docs.map((doc) => {
            return {
                ...doc.data(),
                ...resUsers.filter(user => doc.id === user.uid)[0],
                levelName: levels.filter(lev => lev.id === doc.data().level)[0].title,
                fullGroups: doc.data().groups.length ? groups.filter(group => doc.data().groups.includes(group.id)) : []
            }
        });

        return {
            users: usrs,
            groups

        };

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));*/
    }

})
