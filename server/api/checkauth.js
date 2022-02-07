import admin from 'firebase-admin';
import {
    useCookie
} from 'h3'

export default async (req, res) => {

    try {

        const token = useCookie(req, 'token')

        await admin.auth().verifyIdToken(token);

        res.end();

    } catch (e) {
        res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        res.end(JSON.stringify({msg: 'no or expired token'}));
    }

}
