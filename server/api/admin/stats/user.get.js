export default defineEventHandler(async (event) => {

    try {

        const {userId} = useQuery(event);

        const {results} = await $fetch('/api/stats', {params: {userId: userId}});

        return {
            results,
        };

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
    }

})




