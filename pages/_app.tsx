import { AppProps } from "next/app";
import "../styles/globals.css";

function RecipeSiteApp({ Component, pageProps }: AppProps) {
  return (
    <html lang="ja">
      <Component {...pageProps} />;
    </html>
  );
}

export default RecipeSiteApp;
