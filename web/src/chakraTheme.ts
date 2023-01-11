import { tagAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers, defineStyleConfig, extendTheme } from "@chakra-ui/react";
const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tagAnatomy.keys);

export const Tag = defineMultiStyleConfig({
  sizes: {
    sm: definePartsStyle({
      container: {
        px: "1",
        py: "1",
        fontSize: "10",
      },
    }),
  },
  variants: {
    private: definePartsStyle({
      container: {
        borderColor: "blue.500",
        borderWidth: 1,
        color: "blue.700",
      },
    }),
    readonly: definePartsStyle({
      container: {
        borderColor: "purper.500",
        borderWidth: 1,
        color: "purper.700",
      },
    }),
    readwrite: definePartsStyle({
      container: {
        borderColor: "brown.500",
        borderWidth: 1,
        color: "brown.700",
      },
    }),
  },
});

const Button = defineStyleConfig({
  // The styles all button have in common
  baseStyle: {
    fontWeight: "bold",
    textTransform: "uppercase",
    // <-- border radius is same for all variants and sizes
  },
  // Two sizes: sm and md
  sizes: {
    sm: {
      fontSize: "sm",
      px: 2,
      py: 0,
      height: "24px",
    },
    md: {
      fontSize: "md",
      borderRadius: "100px",
      px: 6,
      py: 4,
      height: "32px",
    },
  },

  variants: {
    plain: {
      bg: "gray.200",
      color: "gray.500",
      _hover: {
        bg: "gray.300",
      },
    },

    solid: {
      bg: "primary.500",
      color: "white",
      _hover: {
        bg: "primary.700",
      },
    },

    ghost: {
      color: "primary.500",
      borderRadius: 2,
      _hover: {
        bg: "primary.500",
        color: "white",
        borderRadius: 2,
      },
    },

    grayGhost: {
      color: "#000",
    },
  },
  // The default size and variant values
  defaultProps: {
    size: "md",
    variant: "solid",
  },
});

const Modal = {
  defaultProps: {},
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
      500: "#00A99D",
      700: "#04756D",
    },
    blue: {
      500: "#0C74AE80",
      700: "#0C74AE",
    },
    purper: {
      500: "#A55AC980",
      700: "#A55AC9",
    },
    brown: {
      500: "#BE704580",
      700: "#BE7045",
    },
  },
  components: {
    Button,
    Modal,
    Tag,
  },
});
export default theme;
