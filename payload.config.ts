import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const payloadSecret = process.env.PAYLOAD_SECRET
if (!payloadSecret) {
    throw new Error('PAYLOAD_SECRET is required but was not found in environment variables.')
}

export default buildConfig({
    // Admin panel is disabled - we use custom UI
    admin: {
        disable: true,
    },

    // Collections
    collections: [
        // Pages Collection
        {
            slug: 'pages',
            labels: { singular: 'Page', plural: 'Pages' },
            admin: {
                useAsTitle: 'title',
            },
            versions: {
                drafts: {
                    autosave: {
                        interval: 3000,
                    },
                },
                maxPerDoc: 50,
            },
            lockDocuments: {
                duration: 300, // 5 minutes
            },
            fields: [
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'slug',
                    type: 'text',
                    required: true,
                    unique: true,
                    admin: {
                        description: 'URL-friendly identifier (e.g., "about-us")',
                    },
                },
                {
                    name: 'content',
                    type: 'richText',
                    editor: lexicalEditor({}),
                },
                {
                    name: 'status',
                    type: 'select',
                    defaultValue: 'draft',
                    options: [
                        { label: 'Draft', value: 'draft' },
                        { label: 'Published', value: 'published' },
                    ],
                },
                {
                    name: 'publishedAt',
                    type: 'date',
                    index: true,
                    admin: {
                        date: {
                            pickerAppearance: 'dayAndTime',
                        },
                    },
                },
                {
                    name: 'metaTitle',
                    type: 'text',
                    admin: {
                        description: 'SEO title (defaults to page title if empty)',
                    },
                },
                {
                    name: 'metaDescription',
                    type: 'textarea',
                    admin: {
                        description: 'SEO description for search engines',
                    },
                },
            ],
        },

        // Media Collection
        {
            slug: 'media',
            labels: { singular: 'Media', plural: 'Media' },
            upload: {
                staticDir: path.resolve(dirname, 'public/media'),
                mimeTypes: ['image/*', 'video/*', 'application/pdf'],
            },
            fields: [
                {
                    name: 'alt',
                    type: 'text',
                    required: true,
                    admin: {
                        description: 'Alternative text for accessibility',
                    },
                },
                {
                    name: 'caption',
                    type: 'text',
                },
            ],
        },

        // CMS Users (for Payload auth, separate from platform users)
        {
            slug: 'cms-admins',
            labels: { singular: 'CMS Admin', plural: 'CMS Admins' },
            auth: true,
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'role',
                    type: 'select',
                    defaultValue: 'editor',
                    options: [
                        { label: 'Admin', value: 'admin' },
                        { label: 'Editor', value: 'editor' },
                    ],
                },
            ],
        },
    ],

    // Globals (single documents)
    globals: [
        {
            slug: 'site-settings',
            label: 'Site Settings',
            fields: [
                {
                    name: 'siteName',
                    type: 'text',
                    defaultValue: 'Smalltalk Community',
                },
                {
                    name: 'siteDescription',
                    type: 'textarea',
                },
                {
                    name: 'contactEmail',
                    type: 'email',
                },
                {
                    name: 'socialLinks',
                    type: 'group',
                    fields: [
                        { name: 'facebook', type: 'text' },
                        { name: 'twitter', type: 'text' },
                        { name: 'instagram', type: 'text' },
                        { name: 'linkedin', type: 'text' },
                    ],
                },
                {
                    name: 'maintenanceMode',
                    type: 'checkbox',
                    defaultValue: false,
                },
            ],
        },
    ],

    // Database
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL,
        },
    }),

    // Editor
    editor: lexicalEditor({}),

    // Secret
    secret: payloadSecret,

    // TypeScript
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
})
