import { defineStyleConfig, extendTheme } from "@chakra-ui/react";

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
    },
  },
  // Two variants: outline and solid
  variants: {
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
    md: "14px",
    base: "14px",
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
  },
  components: {
    Button,
    Modal,
  },
});
export default theme;
