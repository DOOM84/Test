import * as url from "url";

export default async (req, res) => {

    try {

        const {userId} = url.parse(req.url, true).query;

        const {results} = await $fetch('/api/stats', {params: {userId: userId}});

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            results,
        }));

    } catch (e) {

        //console.log(e);
        res.statusCode = 404;
        res.end('Error occurred. Try again later...');
        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));*/
    }

}




