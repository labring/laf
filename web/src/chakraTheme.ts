import { tagAnatomy } from "@chakra-ui/anatomy";
import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
  defineStyleConfig,
  extendTheme,
} from "@chakra-ui/react";
const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tagAnatomy.keys);

const Tag = defineMultiStyleConfig({
  sizes: {
    sm: definePartsStyle({
      container: {
        width: "60px",
        height: "22px",
        px: "1",
        py: "1",
        fontSize: "10px",
        fontWeight: "400",
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
    },

    unstyled: {
      field: {
        background: "transparent",
        borderRadius: "md",
        height: "auto",
        paddingX: 0,
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
      },
      td: {
        border: "none",
      },
    },
    border: {
      parts: ["th", "td"],
      th: {
        border: "1px solid #dddddd",
      },
      td: {
        border: "1px solid #dddddd",
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

const theme = extendTheme({
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
      500: "#F16979",
    },
    warn: {
      400: "#FDB08A",
      700: "#C96330",
    },
    rose: {
      100: "#FDEAF1",
    },
    blue: {
      400: "#86CEF5",
      500: "#5EBDF2",
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
  },
});
export default theme;
