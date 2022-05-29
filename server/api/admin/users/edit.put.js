import admin from "firebase-admin";
import {
    getFirestore
} from "firebase-admin/firestore";

const db = getFirestore();
import * as yup from 'yup';

const schema = yup.object({
    updated: yup.object({
        displayName: yup.string('errors.username_incorrect').trim('errors.username_incorrect')
            .min(3, 'errors.username_incorrect')
            .max(100, 'errors.username_incorrect')
            .matches(/^[0-9A-Za-zа-яёА-ЯЁ ]*$/, 'errors.username_incorrect')
            .required('errors.username_required'),
        email: yup.string('errors.email_incorrect').trim('errors.email_incorrect')
            .email('errors.email_incorrect').required('errors.email_incorrect'),
        level: yup.string('errors.level_required').trim('errors.level_required').required('errors.level_required'),
        password: yup.string('error_pass_length')
            .trim('error_pass_length')
            .min(6, 'error_pass_length'),
        passwordConfirmation: yup.string('error_pass_length')
            .when('password', (password) => {
                if (password) return yup.string().required("error_confirm_pass")
                    .trim('error_pass_length')
                    .oneOf([yup.ref('password'), null], 'error_pass_match')
            }),
        attempts: yup.number()
            .typeError('error_attempts_type')
            //.positive('error_attempts_type')
            .required('error_attempts_type')
    }),
});

export default defineEventHandler(async (event) => {

        try {

            const updated = await useBody(event);

            await schema.validate({
                updated
            });

            const userRecord = await admin.auth().updateUser(updated.uid,
                {
                    ...updated,
                })

            await admin.auth()
                .setCustomUserClaims(userRecord.uid, {admin: updated.customClaims.admin});

            const userRef = db.collection('users').doc(userRecord.uid);

            updated.attempts = updated.attempts ? +updated.attempts: 3

            const updRes = await userRef.update({
                attempts: updated.attempts,
                groups: updated.groups,
                level: +updated.level,
            });

            return {
                result: updated
            };

        } catch (e) {

           // console.log(e);
            if (e.path) {
                event.res.statusCode = 422;
                event.res.end(JSON.stringify({
                    msg: e.errors[0]
                }));

            } else {

                event.res.setHeader('Content-Type', 'application/json');
                event.res.statusCode = 401;
                event.res.end(JSON.stringify({msg: 'error_auth'}));

            }
        }
})
