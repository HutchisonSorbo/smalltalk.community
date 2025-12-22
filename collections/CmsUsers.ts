import type { CollectionConfig } from 'payload'

export const CmsUsers: CollectionConfig = {
    slug: 'cms-users',
    admin: {
        useAsTitle: 'email',
    },
    auth: true,
    fields: [
        // Email and Password are added by default with auth: true
    ],
}
