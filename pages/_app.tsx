import { AppProps } from "next/app";
import "../styles/globals.css";

/**
 * globals.css 内の CSS を全ページで読み込ませるためのコンポーネント
 */
function RecipeSiteApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default RecipeSiteApp;
