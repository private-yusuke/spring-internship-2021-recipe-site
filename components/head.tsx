import { useRouter } from "next/dist/client/router";
import { default as NHead } from "next/head";
import { FC } from "react";
import {
  WEBSITE_HEAD_DEFAULT_DESCRIPTION,
  WEBSITE_HEAD_DEFAULT_IMAGE_URL,
} from "../lib/constants";
import getCurrentFullUrl from "../lib/current-full-url";

type Props = {
  /** ページのタイトル */
  title: string;

  /** ページの説明 */
  description?: string;

  /** ページに対応した画像へのリンク */
  image?: string;

  /**
   * ページに対応する URL。指定しない場合は現在のページのリンクが自動的に指定される
   */
  url?: string;
};

/**
 * それぞれのページで OGP や favicon の設定をするための head タグを模したコンポーネント
 */
const Head: FC<Props> = (props) => {
  const router = useRouter();

  // ページの説明や対応する画像が指定されなかったときにデフォルトのものに設定する
  let { title, description, image, url } = props;
  if (!image) image = WEBSITE_HEAD_DEFAULT_IMAGE_URL;
  if (!description) description = WEBSITE_HEAD_DEFAULT_DESCRIPTION;
  if (!url) url = getCurrentFullUrl(router.asPath);

  return (
    <NHead>
      <title>{props.title}</title>

      {/* OGP 対応箇所 */}
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={title} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={url} />

      {/* https://realfavicongenerator.net/ */}
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="msapplication-TileColor" content="#00aba9" />
      <meta name="theme-color" content="#ffffff" />
    </NHead>
  );
};

export default Head;
