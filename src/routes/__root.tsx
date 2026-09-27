import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { App as AntApp, ConfigProvider } from 'antd'

import { COMPANY_NAME, LOGO_PATH } from '../lib/invoice'
import appCss from '../styles.css?url'
import 'antd/dist/reset.css'

const PAGE_DESCRIPTION = `Create and download invoices for ${COMPANY_NAME}.`

const CTA_COLOR = '#B6DFE3'
const CTA_HOVER_COLOR = '#9fd0d5'
const CTA_ACTIVE_COLOR = '#8ec4ca'
const CTA_TEXT_COLOR = '#12383c'
const LINK_COLOR = '#0f6f76'
const FOCUS_SHADOW = '0 0 0 3px rgba(182, 223, 227, 0.55)'
const FONT_FAMILY =
  '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const controlTokens = {
  activeBorderColor: LINK_COLOR,
  hoverBorderColor: CTA_HOVER_COLOR,
  activeShadow: FOCUS_SHADOW,
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: COMPANY_NAME,
      },
      {
        name: 'description',
        content: PAGE_DESCRIPTION,
      },
      {
        name: 'application-name',
        content: COMPANY_NAME,
      },
      {
        property: 'og:title',
        content: COMPANY_NAME,
      },
      {
        property: 'og:description',
        content: PAGE_DESCRIPTION,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:image',
        content: LOGO_PATH,
      },
    ],
    links: [
      {
        rel: 'icon',
        href: LOGO_PATH,
        type: 'image/svg+xml',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: CTA_COLOR,
              colorPrimaryHover: CTA_HOVER_COLOR,
              colorPrimaryActive: CTA_ACTIVE_COLOR,
              colorTextLightSolid: CTA_TEXT_COLOR,
              colorLink: LINK_COLOR,
              colorLinkHover: CTA_TEXT_COLOR,
              colorBorder: '#d5e3e5',
              colorText: CTA_TEXT_COLOR,
              borderRadius: 10,
              fontFamily: FONT_FAMILY,
              controlOutline: 'rgba(182, 223, 227, 0.55)',
            },
            components: {
              Button: {
                primaryShadow: 'none',
                defaultShadow: 'none',
                fontWeight: 600,
              },
              Input: controlTokens,
              InputNumber: controlTokens,
              DatePicker: controlTokens,
              Select: controlTokens,
            },
          }}
        >
          <AntApp>{children}</AntApp>
        </ConfigProvider>
        <Scripts />
      </body>
    </html>
  )
}
