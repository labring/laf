import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Box, Flex } from "@chakra-ui/react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import CopyText from "../CopyText";

import { codeLight } from "./codeLight";
import { formatLinkText } from "./formatLinkText";

import "katex/dist/katex.min.css";
import styles from "./index.module.scss";

import CreateModal from "@/pages/app/functions/mods/FunctionPanel/CreateModal";

const Markdown = ({
  source,
  isChatting = false,
  formatLink,
}: {
  source: string;
  formatLink?: boolean;
  isChatting?: boolean;
}) => {
  // const { copyData } = useCopyData();

  const { t } = useTranslation();

  const formatSource = useMemo(() => {
    return formatLink ? formatLinkText(source) : source;
  }, [source, formatLink]);

  return (
    <ReactMarkdown
      className={`markdown ${styles.markdown} ${
        isChatting ? (source === "" ? styles.waitingAnimation : styles.animation) : ""
      }`}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[remarkGfm]}
      components={{
        pre: "div",
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const code = String(children);

          return !inline || match ? (
            <Box my={3} borderRadius={"md"} overflow={"overlay"} backgroundColor={"#222"}>
              <Flex
                className="code-header"
                py={2}
                px={5}
                backgroundColor={"#323641"}
                color={"#fff"}
                fontSize={"sm"}
                userSelect={"none"}
              >
                <Box flex={1}>{match?.[1]}</Box>
                <Flex cursor={"pointer"} onClick={() => {}} alignItems={"center"}>
                  <CreateModal aiCode={code}>
                    <span className="pr-2">{t("Apply")}</span>
                  </CreateModal>
                  <CopyText hideToolTip text={code}>
                    <span>{t("Copy")}</span>
                  </CopyText>
                </Flex>
              </Flex>
              <SyntaxHighlighter
                style={codeLight as any}
                language={match?.[1]}
                PreTag="pre"
                {...props}
              >
                {code}
              </SyntaxHighlighter>
            </Box>
          ) : (
            <code className={className} {...props}>
              {code}
            </code>
          );
        },
      }}
      linkTarget="_blank"
    >
      {formatSource}
    </ReactMarkdown>
  );
};

export default memo(Markdown);
