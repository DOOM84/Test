module.exports = {
    apps: [
        {
            name: 'Test',
            exec_mode: 'cluster',
            instances: 'max',
            script: './.output/server/index.mjs',
        }
    ]
}