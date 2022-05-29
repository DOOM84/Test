import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import * as yup from 'yup';
import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

const schema = yup.object({
    credentials: yup.object({
        email: yup.string('error_email').trim('error_email').email('error_email').required('error_email'),
        password: yup.string('error_pass_length')
            .trim('error_pass_length')
            .min(6, 'error_pass_length')
            .required('error_pass_length'),
    }),
});

export default defineEventHandler(async (event) => {

        const credentials = await useBody(event);

        const auth = getAuth();

        try {

            await schema.validate({
                credentials,
            });

            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)

            const userSnap = await db.collection('users').doc(userCredential.user.uid).get();

            const userLevel = userSnap.data().level;

            const levelSnap = await db.collection('levels')
                .where("id", "==", userLevel).get();

            const level = levelSnap.docs[0].data().title

            return  {
                login: userCredential.user.displayName,
                level: level,
                token: userCredential.user.accessToken,
                //id: userCredential.user.uid
            }

        } catch (e) {
            if (e.path) {
                event.res.statusCode = 422;
                event.res.end(JSON.stringify({
                    msg: e.errors[0]
                }));
            } else {
                event.res.statusCode = 403;
                event.res.end(e.code);
            }

        }

})