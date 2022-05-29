import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const levelsSnap = await db.collection('levels').get();

        const levels = levelsSnap.docs.map((doc) => {
            return {...doc.data(), dbId: doc.id}
        });

        return {
            levels
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
