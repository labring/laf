import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const cursorStyleLoading = (editor: monaco.editor.IStandaloneCodeEditor)=> {
  editor.updateOptions({ cursorStyle: 'underline' });
}

const cursorStyleNormal = (editor: monaco.editor.IStandaloneCodeEditor)=> {
  editor.updateOptions({ cursorStyle: 'line' });
}

/**
editorCodex函数将通过使用OpenAI API来为给定的编辑器提供代码自动生成功能, 快捷键cmd + b/ctrl + b触发
@param editor - 要提供代码完成功能的编辑器
@param openaiKey - 用于访问OpenAI API的API密钥
@param openaiUrl - 可选的OpenAI API URL，默认为'https://api.openai.com'
@returns onKeyDownHandler - 用于取消事件监听的函数
*/

export const editorCodex = (
  editor: monaco.editor.IStandaloneCodeEditor,
  openaiKey: string,
  openaiUrl = 'https://api.openai.com'
) => {
  if (!editor || !openaiKey) {
    return;
  }

  let controller: AbortController | null = null;

  const onKeyDownHandler = editor.onKeyDown(async (e) => {
    if (controller) {
      controller.abort();
    }

    if ((e.metaKey || e.ctrlKey) && (e.keyCode === 66 || e.code === "KeyB")) {
      e.preventDefault();

      controller = new AbortController();

      const editorValue = editor.getValue();
      const currentPosition = editor.getPosition();
      if(!currentPosition) {
        return
      }
      const prompt = editorValue.substring(0, editor.getModel()?.getOffsetAt(currentPosition));

      cursorStyleLoading(editor);

      try {
        const res = await fetch(`${openaiUrl}/v1/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "code-davinci-002",
            prompt: prompt,
            max_tokens: 32,
            temperature: 0,
          }),
          signal: controller.signal
        })
        cursorStyleNormal(editor)

        const response = await res.json()

        const text = response?.choices?.[0]?.text;

        if (!text) {
          return;
        }

        const position = editor.getPosition();
        if (!position) {
          return;
        }
        const offset = editor.getModel()?.getOffsetAt(position);
        if (!offset) {
          return;
        }

        const edits = [{
          range: {
            startLineNumber: position.lineNumber,
            startColumn: offset + 1,
            endLineNumber: position.lineNumber,
            endColumn: offset + 1
          },
          text: text
        }];

        editor.executeEdits("", edits);
      } catch (error:any) {
        cursorStyleNormal(editor)
        if (error?.name !== 'AbortError') {
          console.error(error);
        }
      }
    } else {
      cursorStyleNormal(editor)
    }
  });

  return onKeyDownHandler
};
