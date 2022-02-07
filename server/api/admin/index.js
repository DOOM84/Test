import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default async (req, res) => {

    try {

        const totalsSnap = await db.collection('totals').get();

        const counts = {}

        totalsSnap.docs.forEach((doc) => {

            counts[doc.id] = doc.data()
        })

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            counts
        }));



    } catch (e) {

        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));*/
    }

}
