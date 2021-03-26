import { FC } from 'react';

type Props = {
  /** 表示するメッセージ */
  message: string;
};

/** 現在のページの状態をメッセージとして表示するためのコンポーネント */
const CurrentPageStateMessage: FC<Props> = (props) => {
  const { message } = props;
  return (
    <div>
      <h2 className="text-center m-2">{message}</h2>
    </div>
  );
};

export default CurrentPageStateMessage;
