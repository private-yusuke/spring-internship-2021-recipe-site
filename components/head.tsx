import { useRouter } from "next/dist/client/router";
import { default as NHead } from "next/head";
import { FC } from "react";
import getCurrentFullUrl from "../lib/current-full-url";

type Props = {
  title: string;
  description?: string;
  image?: string;
};

const Head: FC<Props> = (props) => {
  let { title, description, image } = props;
  if (!image) image = "https://placehold.jp/1200x630.png";
  if (!description) description = "レシピ検索No.?／料理レシピ載せるなら 料理板";
  const router = useRouter();
  const url = getCurrentFullUrl(router.asPath);

  return (
    <NHead>
      <title>{props.title}</title>

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
