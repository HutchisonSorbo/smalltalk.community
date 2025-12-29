/* This file handles all Admin Panel routes (e.g. /cms, /cms/collections/users) */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
    params: Promise<{
        segments: string[]
    }>
    searchParams: Promise<{
        [key: string]: string | string[]
    }>
}

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> =>
    generatePageMetadata({ config, params, searchParams })

const Page = async ({ params, searchParams }: Args) =>
    RootPage({ config, params, searchParams, importMap })

export default Page

// CodeRabbit Audit Trigger
