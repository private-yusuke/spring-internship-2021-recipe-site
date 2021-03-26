import Document, { Head, Html, Main, NextScript } from 'next/document';

/**
 * html タグの lang 属性を指定するためのコンポーネント
 */
class RecipeSiteDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="ja">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default RecipeSiteDocument;
