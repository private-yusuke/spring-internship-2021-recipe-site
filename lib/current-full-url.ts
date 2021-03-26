/**
 * 与えられた相対パスに対応する現在のサイトのプロトコルやドメインを含めた絶対パスを返します。
 * @param relativePath 相対パス
 */
export default function getCurrentFullUrl(relativePath: string) {
  let baseURL: string;
  if (process.env.NODE_ENV === 'development') baseURL = 'http://localhost:3000';
  else baseURL = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return baseURL + relativePath;
}
