import { NextPage } from "next";
import { useEffect, useState } from "react";
import CurrentPageStateMessage from "../../components/current-page-state-message";
import Head from "../../components/head";
import Header from "../../components/header";
import { clearBookmark, initializeBookmark } from "../../lib/client/bookmark";

type ResetPageState = "Loaded" | "Done" | "Error";

const ResetPage: NextPage = (_) => {
  const [pageState, setPageState] = useState<ResetPageState>("Loaded");

  const onResetButtonClicked = async (_) => {
    try {
      await initializeBookmark();
      await clearBookmark();
    } catch (e) {
      setPageState("Error");
      return;
    }
    setPageState("Done");
  };
  return (
    <div>
      <Head title="ブックマークリセット ─ 料理板" />
      <Header />
      <CurrentPageStateMessage
        message={
          pageState === "Loaded"
            ? "本当にブックマークを全て削除しますか？"
            : pageState === "Done"
            ? "正常に全て削除されました。"
            : pageState === "Error"
            ? "削除処理中にエラーが発生しました。"
            : "Unexpected behaviour"
        }
      />
      <button
        className="block mx-auto text-lg p-2 mx-5 my-2 mb-4 bg-yellow-200 hover:bg-yellow-300 font-bold rounded"
        onClick={onResetButtonClicked}
        disabled={pageState !== "Loaded"}
        style={pageState !== "Loaded" ? { backgroundColor: "gray" } : {}}
      >
        ブックマークを全て削除する
      </button>
    </div>
  );
};

export default ResetPage;
