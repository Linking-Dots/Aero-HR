import { r as reactExports, c as jsxRuntimeExports, W, j as jsxs, a as jsx, Y, b as ae } from "./app-BxPs6nv_.js";
import { d as default_1$1, a as default_1$2 } from "./VisibilityOff-BfL7cQew.js";
import { L as createTheme, N as styled, _ as _extends, O as handleBreakpoints, P as resolveBreakpointValues, Q as createUnarySpacing, R as deepmerge, U as mergeBreakpointsInOrder, V as extendSxProp, f as _objectWithoutPropertiesLoose, g as clsx, W as useThemeProps, X as getValue, h as composeClasses, k as generateUtilityClass, s as styled$1, u as useDefaultProps, m as generateUtilityClasses, p as capitalize, o as useFormControl, T as Typography, r as requireCreateSvgIcon, n as interopRequireDefaultExports, y as useTheme, G as Grid, l as logo, c as Grow, H as GlassCard, a as CardContent, B as Box, I as IconButton, b as Container, A as App } from "./App-DT6Mg_2K.js";
import { f as formControlState, F as FormControl } from "./Select-DJLxoTFW.js";
import { T as TextField } from "./TextField-4YnViUBt.js";
import { I as InputAdornment } from "./InputAdornment-Ki57Td_k.js";
import { C as Checkbox } from "./Checkbox-BMxxN4q5.js";
import { L as LoadingButton } from "./LoadingButton-ZNPQ7tkS.js";
import "./CircularProgress-CmXKJJKz.js";
const _excluded$1 = ["component", "direction", "spacing", "divider", "children", "className", "useFlexGap"];
const defaultTheme = createTheme();
const defaultCreateStyledComponent = styled("div", {
  name: "MuiStack",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
});
function useThemePropsDefault(props) {
  return useThemeProps({
    props,
    name: "MuiStack",
    defaultTheme
  });
}
function joinChildren(children, separator) {
  const childrenArray = reactExports.Children.toArray(children).filter(Boolean);
  return childrenArray.reduce((output, child, index) => {
    output.push(child);
    if (index < childrenArray.length - 1) {
      output.push(/* @__PURE__ */ reactExports.cloneElement(separator, {
        key: `separator-${index}`
      }));
    }
    return output;
  }, []);
}
const getSideFromDirection = (direction) => {
  return {
    row: "Left",
    "row-reverse": "Right",
    column: "Top",
    "column-reverse": "Bottom"
  }[direction];
};
const style = ({
  ownerState,
  theme
}) => {
  let styles = _extends({
    display: "flex",
    flexDirection: "column"
  }, handleBreakpoints({
    theme
  }, resolveBreakpointValues({
    values: ownerState.direction,
    breakpoints: theme.breakpoints.values
  }), (propValue) => ({
    flexDirection: propValue
  })));
  if (ownerState.spacing) {
    const transformer = createUnarySpacing(theme);
    const base = Object.keys(theme.breakpoints.values).reduce((acc, breakpoint) => {
      if (typeof ownerState.spacing === "object" && ownerState.spacing[breakpoint] != null || typeof ownerState.direction === "object" && ownerState.direction[breakpoint] != null) {
        acc[breakpoint] = true;
      }
      return acc;
    }, {});
    const directionValues = resolveBreakpointValues({
      values: ownerState.direction,
      base
    });
    const spacingValues = resolveBreakpointValues({
      values: ownerState.spacing,
      base
    });
    if (typeof directionValues === "object") {
      Object.keys(directionValues).forEach((breakpoint, index, breakpoints) => {
        const directionValue = directionValues[breakpoint];
        if (!directionValue) {
          const previousDirectionValue = index > 0 ? directionValues[breakpoints[index - 1]] : "column";
          directionValues[breakpoint] = previousDirectionValue;
        }
      });
    }
    const styleFromPropValue = (propValue, breakpoint) => {
      if (ownerState.useFlexGap) {
        return {
          gap: getValue(transformer, propValue)
        };
      }
      return {
        // The useFlexGap={false} implement relies on each child to give up control of the margin.
        // We need to reset the margin to avoid double spacing.
        "& > :not(style):not(style)": {
          margin: 0
        },
        "& > :not(style) ~ :not(style)": {
          [`margin${getSideFromDirection(breakpoint ? directionValues[breakpoint] : ownerState.direction)}`]: getValue(transformer, propValue)
        }
      };
    };
    styles = deepmerge(styles, handleBreakpoints({
      theme
    }, spacingValues, styleFromPropValue));
  }
  styles = mergeBreakpointsInOrder(theme.breakpoints, styles);
  return styles;
};
function createStack(options = {}) {
  const {
    // This will allow adding custom styled fn (for example for custom sx style function)
    createStyledComponent = defaultCreateStyledComponent,
    useThemeProps: useThemeProps2 = useThemePropsDefault,
    componentName = "MuiStack"
  } = options;
  const useUtilityClasses2 = () => {
    const slots = {
      root: ["root"]
    };
    return composeClasses(slots, (slot) => generateUtilityClass(componentName, slot), {});
  };
  const StackRoot = createStyledComponent(style);
  const Stack2 = /* @__PURE__ */ reactExports.forwardRef(function Grid2(inProps, ref) {
    const themeProps = useThemeProps2(inProps);
    const props = extendSxProp(themeProps);
    const {
      component = "div",
      direction = "column",
      spacing = 0,
      divider,
      children,
      className,
      useFlexGap = false
    } = props, other = _objectWithoutPropertiesLoose(props, _excluded$1);
    const ownerState = {
      direction,
      spacing,
      useFlexGap
    };
    const classes = useUtilityClasses2();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StackRoot, _extends({
      as: component,
      ownerState,
      ref,
      className: clsx(classes.root, className)
    }, other, {
      children: divider ? joinChildren(children, divider) : children
    }));
  });
  return Stack2;
}
const Stack = createStack({
  createStyledComponent: styled$1("div", {
    name: "MuiStack",
    slot: "Root",
    overridesResolver: (props, styles) => styles.root
  }),
  useThemeProps: (inProps) => useDefaultProps({
    props: inProps,
    name: "MuiStack"
  })
});
function getFormControlLabelUtilityClasses(slot) {
  return generateUtilityClass("MuiFormControlLabel", slot);
}
const formControlLabelClasses = generateUtilityClasses("MuiFormControlLabel", ["root", "labelPlacementStart", "labelPlacementTop", "labelPlacementBottom", "disabled", "label", "error", "required", "asterisk"]);
const _excluded = ["checked", "className", "componentsProps", "control", "disabled", "disableTypography", "inputRef", "label", "labelPlacement", "name", "onChange", "required", "slotProps", "value"];
const useUtilityClasses = (ownerState) => {
  const {
    classes,
    disabled,
    labelPlacement,
    error,
    required
  } = ownerState;
  const slots = {
    root: ["root", disabled && "disabled", `labelPlacement${capitalize(labelPlacement)}`, error && "error", required && "required"],
    label: ["label", disabled && "disabled"],
    asterisk: ["asterisk", error && "error"]
  };
  return composeClasses(slots, getFormControlLabelUtilityClasses, classes);
};
const FormControlLabelRoot = styled$1("label", {
  name: "MuiFormControlLabel",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [{
      [`& .${formControlLabelClasses.label}`]: styles.label
    }, styles.root, styles[`labelPlacement${capitalize(ownerState.labelPlacement)}`]];
  }
})(({
  theme,
  ownerState
}) => _extends({
  display: "inline-flex",
  alignItems: "center",
  cursor: "pointer",
  // For correct alignment with the text.
  verticalAlign: "middle",
  WebkitTapHighlightColor: "transparent",
  marginLeft: -11,
  marginRight: 16,
  // used for row presentation of radio/checkbox
  [`&.${formControlLabelClasses.disabled}`]: {
    cursor: "default"
  }
}, ownerState.labelPlacement === "start" && {
  flexDirection: "row-reverse",
  marginLeft: 16,
  // used for row presentation of radio/checkbox
  marginRight: -11
}, ownerState.labelPlacement === "top" && {
  flexDirection: "column-reverse",
  marginLeft: 16
}, ownerState.labelPlacement === "bottom" && {
  flexDirection: "column",
  marginLeft: 16
}, {
  [`& .${formControlLabelClasses.label}`]: {
    [`&.${formControlLabelClasses.disabled}`]: {
      color: (theme.vars || theme).palette.text.disabled
    }
  }
}));
const AsteriskComponent = styled$1("span", {
  name: "MuiFormControlLabel",
  slot: "Asterisk",
  overridesResolver: (props, styles) => styles.asterisk
})(({
  theme
}) => ({
  [`&.${formControlLabelClasses.error}`]: {
    color: (theme.vars || theme).palette.error.main
  }
}));
const FormControlLabel = /* @__PURE__ */ reactExports.forwardRef(function FormControlLabel2(inProps, ref) {
  var _ref, _slotProps$typography;
  const props = useDefaultProps({
    props: inProps,
    name: "MuiFormControlLabel"
  });
  const {
    className,
    componentsProps = {},
    control,
    disabled: disabledProp,
    disableTypography,
    label: labelProp,
    labelPlacement = "end",
    required: requiredProp,
    slotProps = {}
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const muiFormControl = useFormControl();
  const disabled = (_ref = disabledProp != null ? disabledProp : control.props.disabled) != null ? _ref : muiFormControl == null ? void 0 : muiFormControl.disabled;
  const required = requiredProp != null ? requiredProp : control.props.required;
  const controlProps = {
    disabled,
    required
  };
  ["checked", "name", "onChange", "value", "inputRef"].forEach((key) => {
    if (typeof control.props[key] === "undefined" && typeof props[key] !== "undefined") {
      controlProps[key] = props[key];
    }
  });
  const fcs = formControlState({
    props,
    muiFormControl,
    states: ["error"]
  });
  const ownerState = _extends({}, props, {
    disabled,
    labelPlacement,
    required,
    error: fcs.error
  });
  const classes = useUtilityClasses(ownerState);
  const typographySlotProps = (_slotProps$typography = slotProps.typography) != null ? _slotProps$typography : componentsProps.typography;
  let label = labelProp;
  if (label != null && label.type !== Typography && !disableTypography) {
    label = /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, _extends({
      component: "span"
    }, typographySlotProps, {
      className: clsx(classes.label, typographySlotProps == null ? void 0 : typographySlotProps.className),
      children: label
    }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControlLabelRoot, _extends({
    className: clsx(classes.root, className),
    ownerState,
    ref
  }, other, {
    children: [/* @__PURE__ */ reactExports.cloneElement(control, controlProps), required ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, {
      display: "block",
      children: [label, /* @__PURE__ */ jsxRuntimeExports.jsxs(AsteriskComponent, {
        ownerState,
        "aria-hidden": true,
        className: classes.asterisk,
        children: [" ", "*"]
      })]
    }) : label]
  }));
});
var FavoriteBorder = {};
var _interopRequireDefault = interopRequireDefaultExports;
Object.defineProperty(FavoriteBorder, "__esModule", {
  value: true
});
var default_1 = FavoriteBorder.default = void 0;
var _createSvgIcon = _interopRequireDefault(requireCreateSvgIcon());
var _jsxRuntime = jsxRuntimeExports;
default_1 = FavoriteBorder.default = (0, _createSvgIcon.default)(/* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3m-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05"
}), "FavoriteBorder");
const Login = () => {
  useTheme();
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const {
    data,
    setData,
    post,
    processing,
    errors
  } = W({
    email: "",
    password: "",
    remember: false
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    post("/login", {});
  };
  return /* @__PURE__ */ jsxs(App, { children: [
    /* @__PURE__ */ jsx(Y, { title: "Login" }),
    /* @__PURE__ */ jsx(Box, { sx: {
      display: "flex",
      justifyContent: "center",
      p: 2
    }, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, justifyContent: "center", children: [
      /* @__PURE__ */ jsxs(Grid, { item: true, xs: 12, textAlign: "center", children: [
        /* @__PURE__ */ jsx(ae, { style: {
          alignItems: "center",
          display: "inline-flex"
        }, href: route("dashboard"), className: "mt-3 d-inline-block auth-logo", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "Logo", height: "100" }) }),
        /* @__PURE__ */ jsx(Typography, { variant: "h6", className: "mt-3", color: "text.secondary", children: "Daily Task Management" })
      ] }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 8, lg: 6, xl: 5, children: /* @__PURE__ */ jsx(Grow, { in: true, children: /* @__PURE__ */ jsx(GlassCard, { children: /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxs(Box, { textAlign: "center", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "h5", color: "primary", children: "Welcome Back!" }),
          /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "text.secondary", children: "Sign in to continue" })
        ] }),
        /* @__PURE__ */ jsx(Box, { mt: 4, children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsx(Box, { mb: 3, children: /* @__PURE__ */ jsx(FormControl, { fullWidth: true, children: /* @__PURE__ */ jsx(TextField, { label: "Email", variant: "outlined", type: "email", id: "email", name: "email", value: data.email, onChange: (e) => setData("email", e.target.value), required: true, autoFocus: true, fullWidth: true, error: !!errors.email, helperText: errors.email }) }) }),
          /* @__PURE__ */ jsxs(Box, { mb: 3, children: [
            /* @__PURE__ */ jsx(TextField, { fullWidth: true, id: "password", label: "Password", type: showPassword ? "text" : "password", value: data.password, onChange: (e) => setData("password", e.target.value), required: true, error: !!errors.password, helperText: errors.password, InputProps: {
              endAdornment: /* @__PURE__ */ jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsx(IconButton, { "aria-label": "toggle password visibility", onClick: () => setShowPassword(!showPassword), onMouseDown: (e) => e.preventDefault(), edge: "end", children: showPassword ? /* @__PURE__ */ jsx(default_1$1, {}) : /* @__PURE__ */ jsx(default_1$2, {}) }) })
            } }),
            /* @__PURE__ */ jsx(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: /* @__PURE__ */ jsx(ae, { href: route("password.request"), variant: "body2", color: "text.secondary", children: "Forgot your password?" }) })
          ] }),
          /* @__PURE__ */ jsx(FormControlLabel, { control: /* @__PURE__ */ jsx(Checkbox, { name: "remember", checked: data.remember, onChange: (e) => setData("remember", e.target.checked), color: "primary" }), label: "Remember me" }),
          /* @__PURE__ */ jsx(Box, { mt: 4, children: /* @__PURE__ */ jsx(LoadingButton, { fullWidth: true, variant: "outlined", color: "primary", type: "submit", loading: processing, children: "Log in" }) })
        ] }) })
      ] }) }) }) })
    ] }) }),
    /* @__PURE__ */ jsx(Box, { sx: {
      left: 0,
      right: 0,
      bottom: 10,
      position: "fixed"
    }, children: /* @__PURE__ */ jsx(Container, { children: /* @__PURE__ */ jsx(Grid, { container: true, justifyContent: "center", children: /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, textAlign: "center", children: /* @__PURE__ */ jsxs(Typography, { sx: {
      bottom: 0,
      display: "flex",
      justifyContent: "center"
    }, color: "text.secondary", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Emam Hosen. Crafted with",
      /* @__PURE__ */ jsx(default_1, {})
    ] }) }) }) }) })
  ] });
};
export {
  Login as default
};
