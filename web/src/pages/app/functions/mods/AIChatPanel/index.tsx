import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegStopCircle } from "react-icons/fa";
import { Avatar, Button, HStack, Input } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { LafAILogoIcon } from "@/components/CommonIcon";
import Markdown from "@/components/Markdown";

import useSiteSettingStore from "@/pages/siteSetting";

export default function AIChatPanel() {
  const { t } = useTranslation();
  const { siteSettings } = useSiteSettingStore();

  const CancelToken = axios.CancelToken;
  let source = CancelToken.source();

  const contentDomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState("");

  const [aiChatHistory, setAiChatHistory] = useState([
    {
      _id: uuidv4(),
      text: t("AIWelcomeMessage"),
      isAi: true,
    },
  ]);

  async function handleSubmit() {
    if (generateCode.isLoading) {
      generateCode.reset();
      source.cancel();
      // If the last one of chat history is '...' delete it
      if (aiChatHistory[aiChatHistory.length - 1].text === "...") {
        setAiChatHistory((prev) => {
          const newAiChatHistory = [...prev];
          newAiChatHistory.pop();
          return newAiChatHistory;
        });
      }
      return;
    } else {
      if (!prompt) return;
      generateCode.reset();
      setAiChatHistory((prev) => {
        return [
          ...prev,
          {
            _id: uuidv4(),
            text: prompt,
            isAi: false,
          },
          {
            _id: uuidv4(),
            text: "...",
            isAi: true,
          },
        ];
      });
      setTimeout(() => {
        contentDomRef.current?.scrollTo({
          top: contentDomRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
      setPrompt("");
      await generateCode.mutateAsync({
        value: prompt,
      });
    }
  }

  const { data: generateCodeRes, ...generateCode } = useMutation((params: any) => {
    inputRef.current?.focus();
    return axios({
      url: siteSettings.ai_pilot_url?.value,
      method: "POST",
      data: params,
      cancelToken: source.token,
      responseType: "stream",
      onDownloadProgress: function (progressEvent) {
        const xhr = progressEvent.event.target;

        const { responseText } = xhr;
        // 把 aiChatHistory 最后一个的 text 替换成 responseText
        setAiChatHistory((prev) => {
          const newAiChatHistory = [...prev];
          newAiChatHistory[newAiChatHistory.length - 1].text = responseText;
          return newAiChatHistory;
        });

        setTimeout(() => {
          contentDomRef.current?.scrollTo({
            top: contentDomRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      },
    });
  });

  return (
    <div className="flex h-full flex-col overflow-hidden px-2">
      <div className="flex-1 overflow-scroll pr-2" ref={contentDomRef}>
        <ul>
          {aiChatHistory.map((item, index) => {
            return (
              <li className="mt-4 w-full overflow-hidden" key={item._id}>
                <div className="flex">
                  <div className="mr-2 w-[24px]">
                    {item.isAi ? (
                      <LafAILogoIcon className="mr-2" />
                    ) : (
                      <Avatar className="mr-2" size="xs" />
                    )}
                  </div>

                  {item.isAi ? (
                    <div className="mt-1 w-full flex-1 overflow-auto">
                      <Markdown
                        source={item.text}
                        formatLink
                        isChatting={index === aiChatHistory.length - 1 && generateCode.isLoading}
                      />
                    </div>
                  ) : (
                    <div className="mt-1 flex-1 break-all">{item.text}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <HStack className="h-[60px]">
        <Input
          h={"34px"}
          placeholder={String(t("SendMessagePlaceHolder"))}
          value={prompt}
          ref={inputRef}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
          onKeyPress={(event: any) => {
            if (event.key === "Enter") {
              handleSubmit();
            }
          }}
        />
        <Button
          rounded={"md"}
          onClick={async () => {
            handleSubmit();
          }}
        >
          {generateCode.isLoading ? <FaRegStopCircle fontSize={22} /> : t("Send")}
        </Button>
      </HStack>
    </div>
  );
}
