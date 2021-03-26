import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { FC } from "react";
import { WEBSITE_NAME } from "../lib/constants";

type Props = {
  /** 検索バーに表示する文字列 */
  searchQuery?: string;
};

/** サイト最上部のタイトルと検索バーのためのコンポーネント */
const Header: FC<Props> = (props) => {
  /** 検索バーの input タグに付与される ID */
  const SEARCH_BAR_INPUT_ID = "search-bar-input";
  const router = useRouter();

  const onSearchSubmitted = (e) => {
    // エンターが押下されたとき検索を開始
    if (e.which == 13) startSearch();
  };

  /**
   * 検索バーに入力されている文字列で検索を開始します。
   * @returns 検索を開始したら true、検索を開始しなかった場合は false
   */
  const startSearch = () => {
    const elem = document.getElementById(
      SEARCH_BAR_INPUT_ID
    ) as HTMLInputElement;
    const keyword = elem.value;

    // 検索窓に何かが入力されていた場合、検索を開始
    if (keyword) {
      router.push(`/search?keyword=${keyword}`);
      return true;
    }
    return false;
  };

  return (
    <header>
      <Link href="/">
        <div className="p-4 bg-gray-300">
          <p className="text-lg text-center">{WEBSITE_NAME}</p>
        </div>
      </Link>

      <div className="px-2 py-4 bg-gray-100 w-full flex justify-content">
        <Link href="/bookmark">
          <span className="px-2 mr-2 text-3xl">🔖</span>
        </Link>
        <input
          type="search"
          name="search"
          defaultValue={props.searchQuery}
          placeholder="検索"
          className="border-2 border-gray-300 bg-white h-10 pl-5 w-full object-center rounded-lg text-sm focus:outline-none"
          id={SEARCH_BAR_INPUT_ID}
          onKeyPress={onSearchSubmitted}
        />
        <button className="px-2 text-3xl" onClick={startSearch}>
          🔎
        </button>
      </div>
    </header>
  );
};

export default Header;
