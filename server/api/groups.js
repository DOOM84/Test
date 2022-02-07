import { getFirestore/*, Timestamp, FieldValue*/ } from 'firebase-admin/firestore';
const db = getFirestore();

export default async (req, res) => {

    try {


        const groupsRef = db.collection('groups');

        const groupsSnap = await groupsRef.where("status", "==", true).get();

        const groups = groupsSnap.docs.map((doc) => {
            return {...doc.data(), id:doc.id};
        });

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            groups
        }));



    } catch (e) {

        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));*/
    }

}
