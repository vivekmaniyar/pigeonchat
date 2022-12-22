import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.profileimage}
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
            >
              {m.message.includes("http") ? (
                <a href={m.message} target="_blank" rel="noreferrer">
                  {m.message.includes("jpg") ||
                  m.message.includes("png") ||
                  m.message.includes("gif") ||
                  m.message.includes("jpeg") ? (
                    <a href={m.message} target="_blank" rel="noreferrer">
                      <img
                        src={m.message}
                        alt="message"
                        style={{ maxWidth: "100%" }}
                        width="400px"
                        height="400px"
                      />
                    </a>
                  ) : (
                    m.message
                  )}
                </a>
              ) : (                
                m.message.includes(".") &&
                !m.message.includes(" ") &&
                m.message.includes("http") === false ? (
                  <a href={`https://${m.message}`} target="_blank" rel="noreferrer">
                    {m.message}
                  </a>
                ) : (
                  m.message

              ))

              }
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
