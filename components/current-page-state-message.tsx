import { FC } from "react";

type Props = {
  message: string;
};

const CurrentPageStateMessage: FC<Props> = (props) => {
  let { message } = props;
  return (
    <div>
      <h2 className="text-center m-2">{message}</h2>
    </div>
  );
};

export default CurrentPageStateMessage;
