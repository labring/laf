interface StreamFetchProps {
  url: string;
  onMessage: (text: string) => void;
  firstResponse?: (text: string) => void;
  abortSignal: AbortController;
}

export const streamFetch = ({ url, onMessage, firstResponse, abortSignal }: StreamFetchProps) =>
  new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        signal: abortSignal.signal,
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let responseText = "";

      const read = async () => {
        const { done, value } = await reader?.read();
        if (done) {
          if (res.status === 200) {
            resolve(responseText);
          } else {
            try {
              const parseError = JSON.parse(responseText);
              reject(parseError?.message || "请求异常");
            } catch (err) {
              reject("请求异常");
            }
          }
          return;
        }
        const text = decoder.decode(value).replace(/<br\/>/g, "\n");
        if (res.status === 200) {
          responseText === "" && firstResponse && firstResponse(text);
          onMessage(text);
          responseText += text;
        }
        await read();
      };
      await read();
    } catch (err: any) {
      reject(typeof err === "string" ? err : err?.message || "请求异常");
    }
  });
