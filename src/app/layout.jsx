export const metadata = {
  title: 'Calculadora Neuronal',
  description: 'Calculadora de sumas y restas con IA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}