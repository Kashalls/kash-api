import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import Fastify from 'fastify'
import autoload from '@fastify/autoload'
import fastifyPrintRoutes from 'fastify-print-routes' 

const fastify = Fastify({
    logger: true,
    trustProxy: true
})

fastify.register(fastifyPrintRoutes)

fastify.register(autoload, {
    dir: join(__dirname, 'plugins')
})

fastify.register(autoload, {
    dir: join(__dirname, 'routes'),
    forceESM: true,
    routeParams: true
})

fastify.get('/eternal/public', async (request, reply) => {
    const users = fastify.mongo.db.collection('users')
    const publicUsers = await users.find({ "meta.public": true }).toArray()

    const data = []
    for (const user of publicUsers) {
        data.push(user._id)
    }
    return data
})

const start = async () => {
    try {
        await fastify.listen({ port: 3001 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()