import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegStopCircle } from "react-icons/fa";
import { Avatar, Box, Button, Textarea, VStack } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { debounce } from "lodash";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState("");

  const [aiChatHistory, setAiChatHistory] = useState([
    {
      _id: uuidv4(),
      text: t("AIWelcomeMessage"),
      isAi: true,
    },
  ]);

  const [contentHeight, setContentHeight] = useState("calc(100% - 120px)");
  const [isComposing, setIsComposing] = useState(false);

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
      resetHeight();
      await generateCode.mutateAsync({
        value: prompt,
      });
    }
  }

  const { data: generateCodeRes, ...generateCode } = useMutation((params: any) => {
    textareaRef.current?.focus();
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

  const adjustTextareaHeight = useCallback(
    debounce(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;
        const newHeight = scrollHeight <= 120 ? 120 : Math.min(scrollHeight, 280);
        textarea.style.height = `${newHeight}px`;
        setContentHeight(`calc(100% - ${newHeight}px)`);
      }
    }, 100),
    [],
  );

  useEffect(() => {
    return () => {
      adjustTextareaHeight.cancel();
    };
  }, [adjustTextareaHeight]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const resetHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "120px";
      setContentHeight("calc(100% - 120px)");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustTextareaHeight();
    setPrompt(e.target.value);
  };

  return (
    <VStack height="100%">
      <Box
        ref={contentDomRef}
        flex={1}
        width="100%"
        overflow="auto"
        height={contentHeight}
        transition="height 0.3s ease-in-out"
        padding={[1, 1, 1, 2]}
      >
        <ul>
          {aiChatHistory.map((item, index) => (
            <li key={item._id} className="mt-4 w-full overflow-hidden">
              <div className="flex">
                <div className="mr-2 w-[24px]">
                  {item.isAi ? (
                    <LafAILogoIcon className="mr-2" />
                  ) : (
                    <Avatar className="mr-2" size="xs" />
                  )}
                </div>
                <div className="mt-1 flex-1 overflow-auto">
                  {item.isAi ? (
                    <Markdown
                      source={item.text}
                      formatLink
                      isChatting={index === aiChatHistory.length - 1 && generateCode.isLoading}
                    />
                  ) : (
                    <div className="break-all">{item.text}</div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Box>
      <Box width="100%" position="relative" minHeight="120px" maxHeight="280px">
        <Textarea
          value={prompt}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          minHeight="120px"
          maxHeight="280px"
          overflow="auto"
          ref={textareaRef}
          resize="none"
          transition="height 0.3s ease-in-out"
          sx={{
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "gray.300",
              borderRadius: "4px",
            },
          }}
        />
        <Button
          rounded="md"
          onClick={handleSubmit}
          position="absolute"
          bottom="4"
          right="4"
          zIndex={1}
        >
          {generateCode.isLoading ? <FaRegStopCircle fontSize={22} /> : t("Send")}
        </Button>
      </Box>
    </VStack>
  );
}
