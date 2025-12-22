/* This file handles the layout for the Payload Admin panel */
import configPromise from '@payload-config'
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { importMap } from './cms/importMap'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout
      config={configPromise}
      importMap={importMap}
      serverFunction={async (args) => {
        'use server'
        return handleServerFunctions({
          ...args,
          config: configPromise,
          importMap,
        })
      }}
    >
      {children}
    </RootLayout>
  )
}
