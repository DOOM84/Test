import getCookie from "~/helpers/getCookie";

export default defineNuxtPlugin(async ({ssrContext, $logOut}) => {
    const router = useRouter();

    let token = null;
    const user = useState("user");

    if (process.server && ssrContext) {

        const {res, url} = ssrContext;
        const {path} = router.resolve(url);

        token = getCookie(ssrContext.req.headers.cookie, 'token');

        const toName = path.split("/");

        try {

            if (toName[1] === 'admin') {

                //try {
                if (!token) {
                    await Promise.reject(Error());
                }

                const data = await $fetch('/api/user',
                    {params: {token: token}})

                if (data) {
                    user.value = {
                        name: data.login,
                        level: data.level,
                    };
                }

                const {access} = await $fetch('/api/check',
                    {params: {token: token}})

                if (!access) {
                    await Promise.reject(Error());
                }
            } else {


                if (!token) {
                    await Promise.reject(Error());
                }

                const data = await $fetch('/api/user',
                    {params: {token: token}})

                if (data) {
                    user.value = {
                        name: data.login,
                        level: data.level,
                    };
                } else {
                    $logOut();
                    if (path !== "/") {
                        res.writeHead(302, {Location: "/"});
                        res.end();
                    }
                }
            }
        } catch (e) {
            $logOut();
            if (toName[1] === 'admin') {
                res.writeHead(302, {Location: "/404"});
                res.end();
            } else if (path !== "/" && path !== "/404") {
                res.writeHead(302, {Location: "/"});
                res.end();
            }
        }
    } else if (process.client) {
        router.beforeEach(async (to, from, next) => {

            const toName = to.path.split("/");

            if (to.path !== "/" && toName[1] !== 'admin' && toName[1] !== '404') {

                try {
                    await $fetch('/api/checkauth')
                    return next();
                } catch (e) {

                    const showModal = useSign();
                    const nextPlace = useNextplace();
                    $logOut();
                    nextPlace.value = to.path;
                    showModal.value = true;

                    next(false)
                }

            } else if (toName[1] === 'admin') {

                try {

                    const {access} = await $fetch('/api/check')

                    if (!access) {
                        $logOut();
                        return next('/404');
                    } else {
                        return next();
                    }

                } catch (e) {
                    $logOut();
                    return next('/404');
                }

            } else {
                return next();
            }

        });
    }
});
