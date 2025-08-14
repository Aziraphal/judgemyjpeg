import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta name="description" content="Analyse et critique de photos par IA" />
        <link rel="icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3crect width='16' height='16' fill='%23FF006E'/%3e%3ctext x='8' y='12' font-family='Arial' font-size='10' text-anchor='middle' fill='white'%3e📸%3c/text%3e%3c/svg%3e" />
        <link rel="icon" sizes="16x16" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3crect width='16' height='16' fill='%23FF006E'/%3e%3ctext x='8' y='12' font-family='Arial' font-size='10' text-anchor='middle' fill='white'%3e📸%3c/text%3e%3c/svg%3e" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3e%3crect width='192' height='192' fill='%23FF006E'/%3e%3ctext x='96' y='120' font-family='Arial' font-size='80' text-anchor='middle' fill='white'%3e📸%3c/text%3e%3c/svg%3e" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}