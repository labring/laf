import { defineConfig, DefaultTheme } from "vitepress";

/**
 * @type {DefaultTheme.NavItem[]}
 */
const NavConfig_en = [
  { text: "Home", link: "https://laf.dev" },
  {
    text: "Development of guidelines",
    activeMatch: "^/en/guide/",
    items: [
      {
        text: "Quick start",
        items: [
          {
            text: "Laf Cloud development is introduced",
            link: "/en/guide/",
          },
          {
            text: "Web IDE",
            link: "/en/guide/web-ide/",
          },
        ],
      },
      {
        text: "Function",
        items: [
          {
            text: "Cloud Function",
            link: "/en/guide/function/",
          },
          {
            text: "Cloud Database",
            link: "/en/guide/db/",
          },
          {
            text: "Cloud Storage",
            link: "/en/guide/oss/",
          },
        ],
      },
      {
        text: "More",
        items: [
          {
            text: "Website hosting",
            link: "/en/guide/website-hosting/",
          },
          {
            text: "Client SDK",
            link: "/en/guide/client-sdk/",
          },
          {
            text: "Cli tool",
            link: "/en/guide/cli/",
          },
          {
            text: "VSCode Local development",
            link: "/en/guide/laf-assistant/",
          },
        ],
      },
    ],
  },
  {
    text: "3 minutes lab",
    link: "/en/3min/",
  },
  {
    text: "Immediate use",
    // target: "_self",
    link: "https://laf.run/",
  },
];

/**
 * @type {DefaultTheme.MultiSideBarConfig}
 */
const guideSiderbarConfig_en = [
  {
    text: "introduce",
    items: [
      {
        text: "Overview",
        link: "/en/guide/",
      },
      {
        text: "Web IDE Online development",
        link: "/en/guide//web-ide/",
      },
    ],
  },
  {
    text: "Quick start",
    items: [
      {
        text: "Three minute implementation [Todo List]",
        link: "/en/guide/quick-start/Todo",
      },
      {
        text: "Three minute implementation [user login/registration]",
        link: "/en/guide/quick-start/login",
      },
    ],
  },
  {
    text: "Cloud Function",
    collapsed: false,
    items: [
      {
        text: "Introduction to Cloud Function",
        link: "/en/guide/function/",
      },
      {
        text: "Cloud Function Usage",
        link: "/en/guide/function/use-function",
      },
      {
        text: "Cloud Function SDK",
        collapsed: false,
        items: [
          {
            text: "Introduction of the SDK",
            link: "/en/guide/function/function-sdk#frontmatter-title",
          },
          {
            text: "Import the SDK",
            link: "/en/guide/function/function-sdk#importing-the-sdk",
          },
          {
            text: "Send the requests",
            link: "/en/guide/function/function-sdk#sending-network-requests",
          },
          {
            text: "Database operation",
            link: "/en/guide/function/function-sdk#working-with-databases",
          },
          {
            text: "Call other Cloud Function",
            link: "/en/guide/function/function-sdk#invoking-other-cloud-functions",
          },
          {
            text: "Generating and Decrypting JWT Token",
            link: "/en/guide/function/function-sdk#generating-and-decrypting-jwt-tokens",
          },
          {
            text: "Cloud Function global shared",
            link: "/en/guide/function/function-sdk#cloud-function-global-cache",
          },
          {
            text: "Native MongoDriver instance",
            link: "/en/guide/function/function-sdk#native-mongodriverobject-instance-in-cloud-functions",
          },
        ],
      },
      {
        text: "Cloud Function called",
        items: [
          {
            text: "In the client calls",
            link: "/en/guide/function/call-function-in-client",
          },
          {
            text: "In cloud function calls",
            link: "/en/guide/function/call-function",
          },
          {
            text: "HTTP invocation",
            link: "/en/guide/function/call-function-in-http",
          },
        ],
      },
      {
        text: "Cloud Function log",
        link: "/en/guide/function/logs",
      },
      {
        text: "Dependency management",
        link: "/en/guide/function/depend",
      },
      {
        text: "Trigger",
        link: "/en/guide/function/trigger",
      },
      {
        text: "Environment variable",
        link: "/en/guide/function/env",
      },
      {
        text: "WebSocket connection",
        link: "/en/guide/function/websocket",
      },
      {
        text: "Interceptor",
        link: "/en/guide/function/interceptor",
      },
      {
        text: "Application of the initialization",
        link: "/en/guide/function/init",
      },
      {
        text: "Cloud Function FAQ",
        link: "/en/guide/function/faq",
      },
    ],
  },
  {
    text: "Cloud Database",
    collapsed: false,
    items: [
      { text: "Introduction of the database", link: "/en/guide/db/" },
      { text: "Introduction to the database", link: "/en/guide/db/quickstart" },
      { text: "Add new data", link: "/en/guide/db/add" },
      { text: "Query data", link: "/en/guide/db/find" },
      { text: "Update data", link: "/en/guide/db/update" },
      { text: "Delete data", link: "/en/guide/db/del" },
      { text: "Database command", link: "/en/guide/db/command" },
      // { text: "数据库聚合操作", link: "/en/guide/db/aggregate" },
      // { text: "数据库运算", link: "/en/guide/db/operator" },
      // {
      //   text: "操作地理信息",
      //   link: "/guide/db/geo",
      // },
    ],
  },
  {
    text: "Cloud Storage",
    collapsed: false,
    items: [
      { text: "Introduction of cloud storage", link: "/en/guide/oss/" },
      {
        text: "Cloud storage cloud function call",
        link: "/en/guide/oss/oss-by-function",
      },
      {
        text: "The front end through the cloud function to upload files",
        link: "/en/guide/oss/upload-by-function",
      },
      {
        text: "Temporary token generated cloud storage (STS)",
        link: "/en/guide/oss/get-sts",
      },
      {
        text: "Front end using STS tokens to upload files",
        link: "/en/guide/oss/use-sts-in-client",
      },
    ],
  },
  {
    text: "Static Website Hosting",
    items: [{ text: "Rapid hosting", link: "/en/guide/website-hosting/" }],
  },
  {
    text: "laf-cli The command line tool",
    items: [{ text: "laf-cli Directions for use", link: "/en/guide/cli/" }],
  },
  {
    text: "Client SDK",
    items: [
      {
        text: "laf-client-sdk Directions for use",
        link: "/en/guide/client-sdk/",
      },
      { text: "Database access strategy", link: "/en/guide/db/policy" },
    ],
  },
  {
    text: "VSCode Local development",
    items: [{ text: "laf assistant", link: "/en/guide/laf-assistant/" }],
  },
];

/**
 * @type {DefaultTheme.MultiSideBarConfig}
 */
const examplesSideBarConfig_en = [
  {
    text: "3 minutes Lab",
    items: [
      {
        text: "Introduce",
        link: "/en/3min/",
      },
    ],
  },
  {
    text: "Access to WeChat",
    items: [
      {
        text: "Official WeChat account",
        items: [
          {
            text: "Server docking and text messages",
            link: "/en/3min/wechat/MediaPlatform/ServerDocking.md",
          },
          {
            text: "Customize Menu",
            link: "/en/3min/wechat/MediaPlatform/Menu.md",
          },
          {
            text: "H5 develop",
            link: "/en/3min/wechat/MediaPlatform/H5.md",
          },
        ],
      },
      {
        text: "WeChat mini program",
        link: "/en/3min/wechat/MiniProgram/",
      },
      {
        text: "WeCom",
        link: "/en/3min/wechat/CorporateWeChat/",
      },
    ],
  },
  {
    text: "Accessing AI",
    items: [
      {
        text: "Accessing ChatGPT",
        link: "/en/3min/chatgpt/",
      },
      {
        text: "Accessing Claude",
        link: "/en/3min/claude/",
      },
      {
        text: "Accessing Midjourney",
        link: "/en/3min/midjourney/",
      },
    ],
  },
];

export { guideSiderbarConfig_en, examplesSideBarConfig_en, NavConfig_en };
