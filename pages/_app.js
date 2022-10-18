import '../styles/styles.css'
import Script from 'next/script'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script strategy='beforeInteractive' src="https://cdn.socket.io/4.5.0/socket.io.min.js" integrity="sha384-7EyYLQZgWBi67fBtVxw60/OWl1kjsfrPFcaU0pp0nAh+i8FD068QogUvg85Ewy1k" crossOrigin="anonymous"/>
      <Script strategy='beforeInteractive' src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossOrigin="anonymous" />

      <Component {...pageProps} />
    </>
  )
}

export default MyApp
