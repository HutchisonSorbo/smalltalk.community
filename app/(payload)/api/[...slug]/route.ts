/* This file handles REST API requests to Payload */
import configPromise from '@payload-config'
import { REST_GET, REST_POST, REST_DELETE, REST_PATCH, REST_PUT, REST_OPTIONS } from '@payloadcms/next/routes'

export const GET = REST_GET(configPromise)
export const POST = REST_POST(configPromise)
export const DELETE = REST_DELETE(configPromise)
export const PATCH = REST_PATCH(configPromise)
export const PUT = REST_PUT(configPromise)
export const OPTIONS = REST_OPTIONS(configPromise)
