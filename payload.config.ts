// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { CmsUsers } from './collections/CmsUsers'
import { Pages } from './collections/Pages'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
    routes: {
        admin: '/cms',
    },
    admin: {
        user: 'cms-users',
        routes: {
            login: '/cms/login',
            logout: '/cms/logout',
            account: '/cms/account',
            createFirstUser: '/cms/create-first-user',
            forgot: '/cms/forgot',
            reset: '/cms/reset',
            inactivity: '/cms/inactivity',
            unauthorized: '/cms/unauthorized',
        },
        importMap: {
            baseDir: path.resolve(dirname),
        },
    },
    collections: [CmsUsers, Pages, Media],
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL || '',
        },
    }),
    sharp,
    plugins: [
        // storage-adapter-placeholder
    ],
})
