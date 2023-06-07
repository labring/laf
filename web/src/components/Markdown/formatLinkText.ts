export const formatLinkText = (text: string) => {
  const httpReg =
    /(http|https|ftp):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/gi;
  return text.replace(httpReg, ` $& `);
};
