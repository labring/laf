import { tagAnatomy } from "@chakra-ui/anatomy";
import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
  defineStyle,
  defineStyleConfig,
  extendTheme,
} from "@chakra-ui/react";

import { COLOR_MODE } from "./constants";
const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tagAnatomy.keys);

const Tag = defineMultiStyleConfig({
  sizes: {
    sm: definePartsStyle({
      container: {
        width: "60px",
        height: "18px",
        px: "1",
        py: "1",
        zoom: "0.8",
        fontWeight: "600",
        borderRadius: "4px",
      },
    }),
  },
  variants: {
    private: definePartsStyle({
      container: {
        borderColor: "blue.400",
        borderWidth: 1,
        color: "blue.700",
      },
    }),
    readonly: definePartsStyle({
      container: {
        borderColor: "purple.300",
        borderWidth: 1,
        color: "purple.600",
      },
    }),
    readwrite: definePartsStyle({
      container: {
        borderColor: "warn.400",
        borderWidth: 1,
        color: "warn.700",
      },
    }),
    inputTag: definePartsStyle({
      container: {
        backgroundColor: "lafWhite.100",
        borderColor: "lafWhite.100",
        borderWidth: 1,
        color: "grayModern.900",
        height: "28px",
      },
    }),
    inputTagActive: definePartsStyle({
      container: {
        backgroundColor: "lafWhite.600",
        borderColor: "primary.500",
        borderWidth: 1,
        color: "primary.500",
        height: "28px",
      },
    }),
  },
});

const Button = defineStyleConfig({
  baseStyle: {},
  // Two sizes: sm and md
  sizes: {
    sm: {
      fontSize: "sm",
      px: 2,
      py: 0,
      height: "24px",
      fontWeight: "normal",
    },
    md: {
      fontSize: "md",
      borderRadius: "100px",
      px: 6,
      height: "32px",
    },
  },

  variants: {
    primary: {
      bg: "primary.600",
      color: "lafWhite.200",
      _hover: {
        bg: "primary.700",
      },
      _disabled: {
        _hover: {
          bg: "primary.500 !important",
        },
      },
    },

    secondary: {
      color: "primary.500",
      bg: "primary.100",
      _hover: {
        bg: "primary.200",
      },
    },

    plain: {
      bg: "grayModern.100",
      color: "grayModern.500",
      _hover: {
        bg: "grayModern.200",
      },
    },

    text: {
      color: "primary.500",
      _hover: {
        bg: "primary.100",
      },
    },

    text_disabled: {
      color: "grayModern.500",
      _hover: {
        cursor: "not-allowed",
      },
    },

    warn: {
      bg: "error.100",
      color: "error.500",
      _hover: {
        bg: "error.200",
      },
    },

    warnText: {
      color: "error.500",
      _hover: {
        bg: "error.100",
      },
    },

    thirdly: {
      color: "primary.500",
      bg: "primary.100",
      _hover: {
        bg: "primary.200",
      },
      border: "1px solid",
      rounded: "md",
    },

    thirdly_disabled: {
      bg: "grayModern.100",
      color: "grayModern.500",
      _hover: {
        bg: "grayModern.100",
        cursor: "not-allowed",
      },
      border: "1px solid",
      rounded: "md",
    },
  },
  // The default size and variant values
  defaultProps: {
    size: "md",
    variant: "primary",
  },
});

const Modal = {
  defaultProps: {},
};

const Input: ComponentStyleConfig = {
  baseStyle: {
    field: {},
  },
  sizes: {
    xs: {
      field: {
        borderRadius: "sm",
        fontSize: "xs",
        height: 6,
        paddingX: 2,
      },
    },
    sm: {
      field: {
        borderRadius: "sm",
        fontSize: "sm",
        height: 8,
        paddingX: 3,
      },
    },
    md: {
      field: {
        borderRadius: "md",
        fontSize: "md",
        height: 10,
        paddingX: 4,
      },
    },
    lg: {
      field: {
        borderRadius: "md",
        fontSize: "lg",
        height: 12,
        paddingX: 4,
      },
    },
  },
  variants: {
    outline: {
      field: {
        background: "#fff",
        border: "1px solid",
        borderColor: "transparent",
        _focus: {
          background: "transparent",
          borderColor: "#3182ce",
        },
      },
    },
    filled: {
      field: {
        background: "lafWhite.600",
        border: "1px solid",
        borderColor: "transparent",
        _hover: {
          background: "lafWhite.600",
        },
        _focus: {
          background: "transparent",
          borderColor: "primary.400",
        },
      },
      addon: {
        background: "lafWhite.600",
      },
    },

    unstyled: {
      field: {
        background: "transparent",
        borderRadius: "md",
        height: "auto",
        paddingX: 0,
      },
    },

    userInfo: {
      field: {
        background: "#F8FAFB",
        border: "1px",
        height: "32px",
        borderColor: "#D5D6E1",
      },
    },
  },
  defaultProps: {
    size: "md",
    variant: "filled",
  },
};

const Tabs = {
  variants: {
    "soft-rounded": {
      tab: {
        borderRadius: "4px",
        color: "grayModern.500",
        _selected: {
          color: "grayModern.900",
          bg: "lafWhite.600",
          borderRadius: "4px",
        },
      },
    },
  },
};

const Table = {
  baseStyle: {},
  variants: {
    simple: {
      parts: ["th", "td"],
      th: {
        border: "none",
        fontWeight: "400",
        color: "grayModern.500",
      },
      td: {
        border: "none",
      },
    },
    border: {
      parts: ["th", "td"],
      th: {
        borderWidth: 1,
        borderColor: "grayModern.100",
        background: "lafWhite.300",
      },
      td: {
        borderWidth: 1,
        borderColor: "grayModern.100",
        background: "lafWhite.300",
      },
    },
    params: {
      parts: ["th", "td"],
      th: {
        borderWidth: 1,
        borderColor: "grayModern.100",
        background: "lafWhite.400",
      },
      td: {
        borderWidth: 1,
        borderColor: "grayModern.100",
        background: "lafWhite.400",
      },
    },
  },
  defaultProps: {
    variant: "border",
  },
};

const Select = {
  variants: {
    filled: {
      field: {
        background: "lafWhite.600",
        borderWidth: 1,
        _hover: {
          background: "lafWhite.600",
        },
        _focusVisible: {
          background: "lafWhite.200",
          borderColor: "primary.400",
        },
      },
      icon: {
        color: "grayIron.600",
      },
    },
  },
};

const Badge = {
  baseStyle: defineStyle({
    borderRadius: "50px",
    textTransform: "none",
    fontWeight: "medium",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }),
};

const Menu = {
  variants: {
    default: {
      list: {
        py: "4px",
        borderRadius: "4px",
        border: "none",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      },
      item: {
        minHeight: "36px",
      },
    },
  },
  defaultProps: {
    variant: "default",
  },
};

const theme = extendTheme({
  initialColorMode: COLOR_MODE.dark, // 'dark | 'light'
  useSystemColorMode: false,
  fontSizes: {
    sm: "12px",
    base: "12px",
    md: "14px",
    lg: "16px",
    xl: "16px",
    "2xl": "18px",
    "3xl": "22px",
  },
  colors: {
    primary: {
      100: "#E6F6F5",
      200: "#CCEEEB",
      300: "#99DDD8",
      400: "#66CBC4",
      500: "#33BAB1",
      600: "#00A99D",
      700: "#00877E",
      800: "#00655E",
      900: "#00443F",
      1000: "#00221F",
    },
    lafWhite: {
      100: "#FEFEFE",
      200: "#FDFDFE",
      300: "#FBFBFC",
      400: "#F8FAFB",
      500: "#F6F8F9",
      600: "#F4F6F8",
      700: "#C3C5C6",
      800: "#929495",
      900: "#626263",
      1000: "#313132",
    },
    grayModern: {
      100: "#EFF0F1",
      200: "#DEE0E2",
      300: "#BDC1C5",
      400: "#9CA2A8",
      500: "#7B838B",
      600: "#5A646E",
      700: "#485058",
      800: "#363C42",
      900: "#24282C",
      1000: "#121416",
    },
    grayIron: {
      100: "#F3F3F3",
      200: "#E6E6E7",
      300: "#CDCDD0",
      400: "#B4B4B8",
      500: "#9B9BA1",
      600: "#828289",
      700: "#68686E",
      800: "#4E4E52",
      900: "#343437",
      1000: "#1A1A1B",
    },
    error: {
      100: "#FDECEE",
      200: "#FDD8DC",
      400: "#FF8492",
      500: "#F16979",
      600: "#ED4458",
    },
    warn: {
      100: "#FFF2EC",
      400: "#FDB08A",
      600: "#FB7C3C",
      700: "#C96330",
    },
    rose: {
      100: "#FDEAF1",
    },
    blue: {
      100: "#EBF7FD",
      400: "#86CEF5",
      500: "#5EBDF2",
      600: "#36ADEF",
      700: "#2B8ABF",
    },
    purple: {
      300: "#DBBDE9",
      400: "#C99CDF",
      600: "#A55AC9",
      700: "#7167AA",
    },
    frostyNightfall: {
      200: "#EAEBF0",
    },
  },
  components: {
    Button,
    Modal,
    Tag,
    Input,
    Tabs,
    Table,
    Select,
    Badge,
    Menu,
  },
});

export default theme;
