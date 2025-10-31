import { useRef, useEffect, memo } from "react";

type ChatProps = {
  messages: { pseudo: string; message: string }[];
  postMessage: (message: string) => void;
};

export const Chat = memo(({ messages, postMessage }: ChatProps) => {
  const chatRef = useRef<HTMLUListElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const element = form.firstChild as HTMLInputElement;
    if (element.value) {
      postMessage(element.value);
      element.value = "";
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  });
  return (
    <div>
      <ul
        className="bg-[#113b5c] overflow-auto h-[100px] w-80 sm:w-40 md:w-60 lg:w-60 xl:w-80"
        ref={chatRef}
      >
        {messages.map((message) => {
          return (
            <li key={message.message}>
              <div className="box-border flex w-full bg-[#113b5c] px-2.5 py-0 text-[#7696ae]">
                {message.pseudo}: {message.message}
              </div>
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          className="box-border flex w-full bg-[#113b5c] px-2.5 py-0 text-[#7696ae] w-80 sm:w-40 md:w-60 lg:w-60 xl:w-80"
          type="text"
          placeholder="Your message"
        />
        <input
          type="submit"
          value="Send"
          className="bg-[#113b5c] text-white px-5 py-3 m-[3px] border-0 rounded cursor-pointer"
        />
      </form>
    </div>
  );
});

Chat.displayName = "Chat";
