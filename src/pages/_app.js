//import '@/styles/globals.css'
import "../styles/main.css";
import 'react-tooltip/dist/react-tooltip.css';
import Nav from "@/components/Nav";

export default function App({ Component, pageProps }) {
  return <><Nav/><Component {...pageProps} /></>
}
