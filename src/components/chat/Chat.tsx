import { useRef, useEffect } from "react";

type ChatProps = {
  messages: { pseudo: string; message: string }[];
  postMessage: (message: string) => void;
};

export const Chat = ({ messages, postMessage }: ChatProps) => {
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
        className="message-list w-80 sm:w-40 md:w-60 lg:w-60 xl:w-80"
        ref={chatRef}
      >
        {messages.map((message) => {
          return (
            <li key={message.message}>
              <div className="message-body">
                {message.pseudo}: {message.message}
              </div>
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          className="message-body w-80 sm:w-40 md:w-60 lg:w-60 xl:w-80"
          type="text"
          placeholder="Your message"
        />
        <input type="submit" value="Send" />
      </form>
    </div>
  );
};
