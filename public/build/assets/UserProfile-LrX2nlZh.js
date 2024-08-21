import { r as reactExports, c as jsxRuntimeExports, j as jsxs, a as jsx, F as Fragment, b as ae, q, R as React, Y } from "./app-BxPs6nv_.js";
import { D as DialogTitle, d as default_1, a as DialogContent, b as DialogActions, G as GlassDialog, C as Clear, c as default_1$1 } from "./GlassDialog-DFRCqlIp.js";
import { m as generateUtilityClasses, k as generateUtilityClass, s as styled, _ as _extends, ag as avatarClasses, u as useDefaultProps, f as _objectWithoutPropertiesLoose, g as clsx, z as Avatar, h as composeClasses, w as keyframes, p as capitalize, x as css, ah as useRtl, Y as lighten_1, Z as darken_1, ai as ButtonBase, j as createSvgIcon, a6 as useEnhancedEffect, a5 as ownerWindow, a7 as debounce, aj as useSlotProps, y as useTheme, ak as useEventCallback, ae as ownerDocument, T as Typography, I as IconButton, G as Grid, B as Box, M as MenuItem, E as B, H as GlassCard, a as CardContent, d as Button, J as CardHeader, al as Tooltip, c as Grow, am as List, an as ListItem, ao as ListItemText, A as App } from "./App-DT6Mg_2K.js";
import { T as TextField, F as FormHelperText } from "./TextField-4YnViUBt.js";
import { F as FormControl, I as InputLabel, S as Select } from "./Select-DJLxoTFW.js";
import { L as LoadingButton } from "./LoadingButton-ZNPQ7tkS.js";
import { C as CircularProgress } from "./CircularProgress-CmXKJJKz.js";
import { A as Add } from "./Add-C8EyB9di.js";
import { I as InputAdornment } from "./InputAdornment-Ki57Td_k.js";
import { D as Divider } from "./Divider-DF9BsWD3.js";
let cachedType;
function detectScrollType() {
  if (cachedType) {
    return cachedType;
  }
  const dummy = document.createElement("div");
  const container = document.createElement("div");
  container.style.width = "10px";
  container.style.height = "1px";
  dummy.appendChild(container);
  dummy.dir = "rtl";
  dummy.style.fontSize = "14px";
  dummy.style.width = "4px";
  dummy.style.height = "1px";
  dummy.style.position = "absolute";
  dummy.style.top = "-1000px";
  dummy.style.overflow = "scroll";
  document.body.appendChild(dummy);
  cachedType = "reverse";
  if (dummy.scrollLeft > 0) {
    cachedType = "default";
  } else {
    dummy.scrollLeft = 1;
    if (dummy.scrollLeft === 0) {
      cachedType = "negative";
    }
  }
  document.body.removeChild(dummy);
  return cachedType;
}
function getNormalizedScrollLeft(element, direction) {
  const scrollLeft = element.scrollLeft;
  if (direction !== "rtl") {
    return scrollLeft;
  }
  const type = detectScrollType();
  switch (type) {
    case "negative":
      return element.scrollWidth - element.clientWidth + scrollLeft;
    case "reverse":
      return element.scrollWidth - element.clientWidth - scrollLeft;
    default:
      return scrollLeft;
  }
}
function getAvatarGroupUtilityClass(slot) {
  return generateUtilityClass("MuiAvatarGroup", slot);
}
const avatarGroupClasses = generateUtilityClasses("MuiAvatarGroup", ["root", "avatar"]);
const _excluded$6 = ["children", "className", "component", "componentsProps", "max", "renderSurplus", "slotProps", "spacing", "total", "variant"];
const SPACINGS = {
  small: -16,
  medium: null
};
const useUtilityClasses$5 = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"],
    avatar: ["avatar"]
  };
  return composeClasses(slots, getAvatarGroupUtilityClass, classes);
};
const AvatarGroupRoot = styled("div", {
  name: "MuiAvatarGroup",
  slot: "Root",
  overridesResolver: (props, styles2) => _extends({
    [`& .${avatarGroupClasses.avatar}`]: styles2.avatar
  }, styles2.root)
})(({
  theme,
  ownerState
}) => {
  const marginValue = ownerState.spacing && SPACINGS[ownerState.spacing] !== void 0 ? SPACINGS[ownerState.spacing] : -ownerState.spacing;
  return {
    [`& .${avatarClasses.root}`]: {
      border: `2px solid ${(theme.vars || theme).palette.background.default}`,
      boxSizing: "content-box",
      marginLeft: marginValue != null ? marginValue : -8,
      "&:last-child": {
        marginLeft: 0
      }
    },
    display: "flex",
    flexDirection: "row-reverse"
  };
});
const AvatarGroup = /* @__PURE__ */ reactExports.forwardRef(function AvatarGroup2(inProps, ref) {
  var _slotProps$additional;
  const props = useDefaultProps({
    props: inProps,
    name: "MuiAvatarGroup"
  });
  const {
    children: childrenProp,
    className,
    component = "div",
    componentsProps = {},
    max = 5,
    renderSurplus,
    slotProps = {},
    spacing = "medium",
    total,
    variant = "circular"
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$6);
  let clampedMax = max < 2 ? 2 : max;
  const ownerState = _extends({}, props, {
    max,
    spacing,
    component,
    variant
  });
  const classes = useUtilityClasses$5(ownerState);
  const children = reactExports.Children.toArray(childrenProp).filter((child) => {
    return /* @__PURE__ */ reactExports.isValidElement(child);
  });
  const totalAvatars = total || children.length;
  if (totalAvatars === clampedMax) {
    clampedMax += 1;
  }
  clampedMax = Math.min(totalAvatars + 1, clampedMax);
  const maxAvatars = Math.min(children.length, clampedMax - 1);
  const extraAvatars = Math.max(totalAvatars - clampedMax, totalAvatars - maxAvatars, 0);
  const extraAvatarsElement = renderSurplus ? renderSurplus(extraAvatars) : `+${extraAvatars}`;
  const additionalAvatarSlotProps = (_slotProps$additional = slotProps.additionalAvatar) != null ? _slotProps$additional : componentsProps.additionalAvatar;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AvatarGroupRoot, _extends({
    as: component,
    ownerState,
    className: clsx(classes.root, className),
    ref
  }, other, {
    children: [extraAvatars ? /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, _extends({
      variant
    }, additionalAvatarSlotProps, {
      className: clsx(classes.avatar, additionalAvatarSlotProps == null ? void 0 : additionalAvatarSlotProps.className),
      children: extraAvatarsElement
    })) : null, children.slice(0, maxAvatars).reverse().map((child) => {
      return /* @__PURE__ */ reactExports.cloneElement(child, {
        className: clsx(child.props.className, classes.avatar),
        variant: child.props.variant || variant
      });
    })]
  }));
});
function getCardActionsUtilityClass(slot) {
  return generateUtilityClass("MuiCardActions", slot);
}
generateUtilityClasses("MuiCardActions", ["root", "spacing"]);
const _excluded$5 = ["disableSpacing", "className"];
const useUtilityClasses$4 = (ownerState) => {
  const {
    classes,
    disableSpacing
  } = ownerState;
  const slots = {
    root: ["root", !disableSpacing && "spacing"]
  };
  return composeClasses(slots, getCardActionsUtilityClass, classes);
};
const CardActionsRoot = styled("div", {
  name: "MuiCardActions",
  slot: "Root",
  overridesResolver: (props, styles2) => {
    const {
      ownerState
    } = props;
    return [styles2.root, !ownerState.disableSpacing && styles2.spacing];
  }
})(({
  ownerState
}) => _extends({
  display: "flex",
  alignItems: "center",
  padding: 8
}, !ownerState.disableSpacing && {
  "& > :not(style) ~ :not(style)": {
    marginLeft: 8
  }
}));
const CardActions = /* @__PURE__ */ reactExports.forwardRef(function CardActions2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiCardActions"
  });
  const {
    disableSpacing = false,
    className
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$5);
  const ownerState = _extends({}, props, {
    disableSpacing
  });
  const classes = useUtilityClasses$4(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CardActionsRoot, _extends({
    className: clsx(classes.root, className),
    ownerState,
    ref
  }, other));
});
function getLinearProgressUtilityClass(slot) {
  return generateUtilityClass("MuiLinearProgress", slot);
}
generateUtilityClasses("MuiLinearProgress", ["root", "colorPrimary", "colorSecondary", "determinate", "indeterminate", "buffer", "query", "dashed", "dashedColorPrimary", "dashedColorSecondary", "bar", "barColorPrimary", "barColorSecondary", "bar1Indeterminate", "bar1Determinate", "bar1Buffer", "bar2Indeterminate", "bar2Buffer"]);
const _excluded$4 = ["className", "color", "value", "valueBuffer", "variant"];
let _ = (t) => t, _t, _t2, _t3, _t4, _t5, _t6;
const TRANSITION_DURATION = 4;
const indeterminate1Keyframe = keyframes(_t || (_t = _`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`));
const indeterminate2Keyframe = keyframes(_t2 || (_t2 = _`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`));
const bufferKeyframe = keyframes(_t3 || (_t3 = _`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`));
const useUtilityClasses$3 = (ownerState) => {
  const {
    classes,
    variant,
    color
  } = ownerState;
  const slots = {
    root: ["root", `color${capitalize(color)}`, variant],
    dashed: ["dashed", `dashedColor${capitalize(color)}`],
    bar1: ["bar", `barColor${capitalize(color)}`, (variant === "indeterminate" || variant === "query") && "bar1Indeterminate", variant === "determinate" && "bar1Determinate", variant === "buffer" && "bar1Buffer"],
    bar2: ["bar", variant !== "buffer" && `barColor${capitalize(color)}`, variant === "buffer" && `color${capitalize(color)}`, (variant === "indeterminate" || variant === "query") && "bar2Indeterminate", variant === "buffer" && "bar2Buffer"]
  };
  return composeClasses(slots, getLinearProgressUtilityClass, classes);
};
const getColorShade = (theme, color) => {
  if (color === "inherit") {
    return "currentColor";
  }
  if (theme.vars) {
    return theme.vars.palette.LinearProgress[`${color}Bg`];
  }
  return theme.palette.mode === "light" ? lighten_1(theme.palette[color].main, 0.62) : darken_1(theme.palette[color].main, 0.5);
};
const LinearProgressRoot = styled("span", {
  name: "MuiLinearProgress",
  slot: "Root",
  overridesResolver: (props, styles2) => {
    const {
      ownerState
    } = props;
    return [styles2.root, styles2[`color${capitalize(ownerState.color)}`], styles2[ownerState.variant]];
  }
})(({
  ownerState,
  theme
}) => _extends({
  position: "relative",
  overflow: "hidden",
  display: "block",
  height: 4,
  zIndex: 0,
  // Fix Safari's bug during composition of different paint.
  "@media print": {
    colorAdjust: "exact"
  },
  backgroundColor: getColorShade(theme, ownerState.color)
}, ownerState.color === "inherit" && ownerState.variant !== "buffer" && {
  backgroundColor: "none",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "currentColor",
    opacity: 0.3
  }
}, ownerState.variant === "buffer" && {
  backgroundColor: "transparent"
}, ownerState.variant === "query" && {
  transform: "rotate(180deg)"
}));
const LinearProgressDashed = styled("span", {
  name: "MuiLinearProgress",
  slot: "Dashed",
  overridesResolver: (props, styles2) => {
    const {
      ownerState
    } = props;
    return [styles2.dashed, styles2[`dashedColor${capitalize(ownerState.color)}`]];
  }
})(({
  ownerState,
  theme
}) => {
  const backgroundColor = getColorShade(theme, ownerState.color);
  return _extends({
    position: "absolute",
    marginTop: 0,
    height: "100%",
    width: "100%"
  }, ownerState.color === "inherit" && {
    opacity: 0.3
  }, {
    backgroundImage: `radial-gradient(${backgroundColor} 0%, ${backgroundColor} 16%, transparent 42%)`,
    backgroundSize: "10px 10px",
    backgroundPosition: "0 -23px"
  });
}, css(_t4 || (_t4 = _`
    animation: ${0} 3s infinite linear;
  `), bufferKeyframe));
const LinearProgressBar1 = styled("span", {
  name: "MuiLinearProgress",
  slot: "Bar1",
  overridesResolver: (props, styles2) => {
    const {
      ownerState
    } = props;
    return [styles2.bar, styles2[`barColor${capitalize(ownerState.color)}`], (ownerState.variant === "indeterminate" || ownerState.variant === "query") && styles2.bar1Indeterminate, ownerState.variant === "determinate" && styles2.bar1Determinate, ownerState.variant === "buffer" && styles2.bar1Buffer];
  }
})(({
  ownerState,
  theme
}) => _extends({
  width: "100%",
  position: "absolute",
  left: 0,
  bottom: 0,
  top: 0,
  transition: "transform 0.2s linear",
  transformOrigin: "left",
  backgroundColor: ownerState.color === "inherit" ? "currentColor" : (theme.vars || theme).palette[ownerState.color].main
}, ownerState.variant === "determinate" && {
  transition: `transform .${TRANSITION_DURATION}s linear`
}, ownerState.variant === "buffer" && {
  zIndex: 1,
  transition: `transform .${TRANSITION_DURATION}s linear`
}), ({
  ownerState
}) => (ownerState.variant === "indeterminate" || ownerState.variant === "query") && css(_t5 || (_t5 = _`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    `), indeterminate1Keyframe));
const LinearProgressBar2 = styled("span", {
  name: "MuiLinearProgress",
  slot: "Bar2",
  overridesResolver: (props, styles2) => {
    const {
      ownerState
    } = props;
    return [styles2.bar, styles2[`barColor${capitalize(ownerState.color)}`], (ownerState.variant === "indeterminate" || ownerState.variant === "query") && styles2.bar2Indeterminate, ownerState.variant === "buffer" && styles2.bar2Buffer];
  }
})(({
  ownerState,
  theme
}) => _extends({
  width: "100%",
  position: "absolute",
  left: 0,
  bottom: 0,
  top: 0,
  transition: "transform 0.2s linear",
  transformOrigin: "left"
}, ownerState.variant !== "buffer" && {
  backgroundColor: ownerState.color === "inherit" ? "currentColor" : (theme.vars || theme).palette[ownerState.color].main
}, ownerState.color === "inherit" && {
  opacity: 0.3
}, ownerState.variant === "buffer" && {
  backgroundColor: getColorShade(theme, ownerState.color),
  transition: `transform .${TRANSITION_DURATION}s linear`
}), ({
  ownerState
}) => (ownerState.variant === "indeterminate" || ownerState.variant === "query") && css(_t6 || (_t6 = _`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
    `), indeterminate2Keyframe));
const LinearProgress = /* @__PURE__ */ reactExports.forwardRef(function LinearProgress2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiLinearProgress"
  });
  const {
    className,
    color = "primary",
    value,
    valueBuffer,
    variant = "indeterminate"
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$4);
  const ownerState = _extends({}, props, {
    color,
    variant
  });
  const classes = useUtilityClasses$3(ownerState);
  const isRtl = useRtl();
  const rootProps = {};
  const inlineStyles = {
    bar1: {},
    bar2: {}
  };
  if (variant === "determinate" || variant === "buffer") {
    if (value !== void 0) {
      rootProps["aria-valuenow"] = Math.round(value);
      rootProps["aria-valuemin"] = 0;
      rootProps["aria-valuemax"] = 100;
      let transform = value - 100;
      if (isRtl) {
        transform = -transform;
      }
      inlineStyles.bar1.transform = `translateX(${transform}%)`;
    }
  }
  if (variant === "buffer") {
    if (valueBuffer !== void 0) {
      let transform = (valueBuffer || 0) - 100;
      if (isRtl) {
        transform = -transform;
      }
      inlineStyles.bar2.transform = `translateX(${transform}%)`;
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(LinearProgressRoot, _extends({
    className: clsx(classes.root, className),
    ownerState,
    role: "progressbar"
  }, rootProps, {
    ref
  }, other, {
    children: [variant === "buffer" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgressDashed, {
      className: classes.dashed,
      ownerState
    }) : null, /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgressBar1, {
      className: classes.bar1,
      ownerState,
      style: inlineStyles.bar1
    }), variant === "determinate" ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgressBar2, {
      className: classes.bar2,
      ownerState,
      style: inlineStyles.bar2
    })]
  }));
});
function getTabUtilityClass(slot) {
  return generateUtilityClass("MuiTab", slot);
}
const tabClasses = generateUtilityClasses("MuiTab", ["root", "labelIcon", "textColorInherit", "textColorPrimary", "textColorSecondary", "selected", "disabled", "fullWidth", "wrapped", "iconWrapper"]);
const _excluded$3 = ["className", "disabled", "disableFocusRipple", "fullWidth", "icon", "iconPosition", "indicator", "label", "onChange", "onClick", "onFocus", "selected", "selectionFollowsFocus", "textColor", "value", "wrapped"];
const useUtilityClasses$2 = (ownerState) => {
  const {
    classes,
    textColor,
    fullWidth,
    wrapped,
    icon,
    label,
    selected,
    disabled
  } = ownerState;
  const slots = {
    root: ["root", icon && label && "labelIcon", `textColor${capitalize(textColor)}`, fullWidth && "fullWidth", wrapped && "wrapped", selected && "selected", disabled && "disabled"],
    iconWrapper: ["iconWrapper"]
  };
  return composeClasses(slots, getTabUtilityClass, classes);
};
const TabRoot = styled(ButtonBase, {
  name: "MuiTab",
  slot: "Root",
  overridesResolver: (props, styles2) => {
    const {
      ownerState
    } = props;
    return [styles2.root, ownerState.label && ownerState.icon && styles2.labelIcon, styles2[`textColor${capitalize(ownerState.textColor)}`], ownerState.fullWidth && styles2.fullWidth, ownerState.wrapped && styles2.wrapped, {
      [`& .${tabClasses.iconWrapper}`]: styles2.iconWrapper
    }];
  }
})(({
  theme,
  ownerState
}) => _extends({}, theme.typography.button, {
  maxWidth: 360,
  minWidth: 90,
  position: "relative",
  minHeight: 48,
  flexShrink: 0,
  padding: "12px 16px",
  overflow: "hidden",
  whiteSpace: "normal",
  textAlign: "center"
}, ownerState.label && {
  flexDirection: ownerState.iconPosition === "top" || ownerState.iconPosition === "bottom" ? "column" : "row"
}, {
  lineHeight: 1.25
}, ownerState.icon && ownerState.label && {
  minHeight: 72,
  paddingTop: 9,
  paddingBottom: 9,
  [`& > .${tabClasses.iconWrapper}`]: _extends({}, ownerState.iconPosition === "top" && {
    marginBottom: 6
  }, ownerState.iconPosition === "bottom" && {
    marginTop: 6
  }, ownerState.iconPosition === "start" && {
    marginRight: theme.spacing(1)
  }, ownerState.iconPosition === "end" && {
    marginLeft: theme.spacing(1)
  })
}, ownerState.textColor === "inherit" && {
  color: "inherit",
  opacity: 0.6,
  // same opacity as theme.palette.text.secondary
  [`&.${tabClasses.selected}`]: {
    opacity: 1
  },
  [`&.${tabClasses.disabled}`]: {
    opacity: (theme.vars || theme).palette.action.disabledOpacity
  }
}, ownerState.textColor === "primary" && {
  color: (theme.vars || theme).palette.text.secondary,
  [`&.${tabClasses.selected}`]: {
    color: (theme.vars || theme).palette.primary.main
  },
  [`&.${tabClasses.disabled}`]: {
    color: (theme.vars || theme).palette.text.disabled
  }
}, ownerState.textColor === "secondary" && {
  color: (theme.vars || theme).palette.text.secondary,
  [`&.${tabClasses.selected}`]: {
    color: (theme.vars || theme).palette.secondary.main
  },
  [`&.${tabClasses.disabled}`]: {
    color: (theme.vars || theme).palette.text.disabled
  }
}, ownerState.fullWidth && {
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: 0,
  maxWidth: "none"
}, ownerState.wrapped && {
  fontSize: theme.typography.pxToRem(12)
}));
const Tab = /* @__PURE__ */ reactExports.forwardRef(function Tab2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiTab"
  });
  const {
    className,
    disabled = false,
    disableFocusRipple = false,
    // eslint-disable-next-line react/prop-types
    fullWidth,
    icon: iconProp,
    iconPosition = "top",
    // eslint-disable-next-line react/prop-types
    indicator,
    label,
    onChange,
    onClick,
    onFocus,
    // eslint-disable-next-line react/prop-types
    selected,
    // eslint-disable-next-line react/prop-types
    selectionFollowsFocus,
    // eslint-disable-next-line react/prop-types
    textColor = "inherit",
    value,
    wrapped = false
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$3);
  const ownerState = _extends({}, props, {
    disabled,
    disableFocusRipple,
    selected,
    icon: !!iconProp,
    iconPosition,
    label: !!label,
    fullWidth,
    textColor,
    wrapped
  });
  const classes = useUtilityClasses$2(ownerState);
  const icon = iconProp && label && /* @__PURE__ */ reactExports.isValidElement(iconProp) ? /* @__PURE__ */ reactExports.cloneElement(iconProp, {
    className: clsx(classes.iconWrapper, iconProp.props.className)
  }) : iconProp;
  const handleClick = (event) => {
    if (!selected && onChange) {
      onChange(event, value);
    }
    if (onClick) {
      onClick(event);
    }
  };
  const handleFocus = (event) => {
    if (selectionFollowsFocus && !selected && onChange) {
      onChange(event, value);
    }
    if (onFocus) {
      onFocus(event);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TabRoot, _extends({
    focusRipple: !disableFocusRipple,
    className: clsx(classes.root, className),
    ref,
    role: "tab",
    "aria-selected": selected,
    disabled,
    onClick: handleClick,
    onFocus: handleFocus,
    ownerState,
    tabIndex: selected ? 0 : -1
  }, other, {
    children: [iconPosition === "top" || iconPosition === "start" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, {
      children: [icon, label]
    }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, {
      children: [label, icon]
    }), indicator]
  }));
});
const KeyboardArrowLeft = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"
}), "KeyboardArrowLeft");
const KeyboardArrowRight = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"
}), "KeyboardArrowRight");
function easeInOutSin(time) {
  return (1 + Math.sin(Math.PI * time - Math.PI / 2)) / 2;
}
function animate(property, element, to, options = {}, cb = () => {
}) {
  const {
    ease = easeInOutSin,
    duration = 300
    // standard
  } = options;
  let start = null;
  const from = element[property];
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  const step = (timestamp) => {
    if (cancelled) {
      cb(new Error("Animation cancelled"));
      return;
    }
    if (start === null) {
      start = timestamp;
    }
    const time = Math.min(1, (timestamp - start) / duration);
    element[property] = ease(time) * (to - from) + from;
    if (time >= 1) {
      requestAnimationFrame(() => {
        cb(null);
      });
      return;
    }
    requestAnimationFrame(step);
  };
  if (from === to) {
    cb(new Error("Element already at target position"));
    return cancel;
  }
  requestAnimationFrame(step);
  return cancel;
}
const _excluded$2 = ["onChange"];
const styles = {
  width: 99,
  height: 99,
  position: "absolute",
  top: -9999,
  overflow: "scroll"
};
function ScrollbarSize(props) {
  const {
    onChange
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$2);
  const scrollbarHeight = reactExports.useRef();
  const nodeRef = reactExports.useRef(null);
  const setMeasurements = () => {
    scrollbarHeight.current = nodeRef.current.offsetHeight - nodeRef.current.clientHeight;
  };
  useEnhancedEffect(() => {
    const handleResize = debounce(() => {
      const prevHeight = scrollbarHeight.current;
      setMeasurements();
      if (prevHeight !== scrollbarHeight.current) {
        onChange(scrollbarHeight.current);
      }
    });
    const containerWindow = ownerWindow(nodeRef.current);
    containerWindow.addEventListener("resize", handleResize);
    return () => {
      handleResize.clear();
      containerWindow.removeEventListener("resize", handleResize);
    };
  }, [onChange]);
  reactExports.useEffect(() => {
    setMeasurements();
    onChange(scrollbarHeight.current);
  }, [onChange]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", _extends({
    style: styles,
    ref: nodeRef
  }, other));
}
function getTabScrollButtonUtilityClass(slot) {
  return generateUtilityClass("MuiTabScrollButton", slot);
}
const tabScrollButtonClasses = generateUtilityClasses("MuiTabScrollButton", ["root", "vertical", "horizontal", "disabled"]);
const _excluded$1 = ["className", "slots", "slotProps", "direction", "orientation", "disabled"];
const useUtilityClasses$1 = (ownerState) => {
  const {
    classes,
    orientation,
    disabled
  } = ownerState;
  const slots = {
    root: ["root", orientation, disabled && "disabled"]
  };
  return composeClasses(slots, getTabScrollButtonUtilityClass, classes);
};
const TabScrollButtonRoot = styled(ButtonBase, {
  name: "MuiTabScrollButton",
  slot: "Root",
  overridesResolver: (props, styles2) => {
    const {
      ownerState
    } = props;
    return [styles2.root, ownerState.orientation && styles2[ownerState.orientation]];
  }
})(({
  ownerState
}) => _extends({
  width: 40,
  flexShrink: 0,
  opacity: 0.8,
  [`&.${tabScrollButtonClasses.disabled}`]: {
    opacity: 0
  }
}, ownerState.orientation === "vertical" && {
  width: "100%",
  height: 40,
  "& svg": {
    transform: `rotate(${ownerState.isRtl ? -90 : 90}deg)`
  }
}));
const TabScrollButton = /* @__PURE__ */ reactExports.forwardRef(function TabScrollButton2(inProps, ref) {
  var _slots$StartScrollBut, _slots$EndScrollButto;
  const props = useDefaultProps({
    props: inProps,
    name: "MuiTabScrollButton"
  });
  const {
    className,
    slots = {},
    slotProps = {},
    direction
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$1);
  const isRtl = useRtl();
  const ownerState = _extends({
    isRtl
  }, props);
  const classes = useUtilityClasses$1(ownerState);
  const StartButtonIcon = (_slots$StartScrollBut = slots.StartScrollButtonIcon) != null ? _slots$StartScrollBut : KeyboardArrowLeft;
  const EndButtonIcon = (_slots$EndScrollButto = slots.EndScrollButtonIcon) != null ? _slots$EndScrollButto : KeyboardArrowRight;
  const startButtonIconProps = useSlotProps({
    elementType: StartButtonIcon,
    externalSlotProps: slotProps.startScrollButtonIcon,
    additionalProps: {
      fontSize: "small"
    },
    ownerState
  });
  const endButtonIconProps = useSlotProps({
    elementType: EndButtonIcon,
    externalSlotProps: slotProps.endScrollButtonIcon,
    additionalProps: {
      fontSize: "small"
    },
    ownerState
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TabScrollButtonRoot, _extends({
    component: "div",
    className: clsx(classes.root, className),
    ref,
    role: null,
    ownerState,
    tabIndex: null
  }, other, {
    children: direction === "left" ? /* @__PURE__ */ jsxRuntimeExports.jsx(StartButtonIcon, _extends({}, startButtonIconProps)) : /* @__PURE__ */ jsxRuntimeExports.jsx(EndButtonIcon, _extends({}, endButtonIconProps))
  }));
});
function getTabsUtilityClass(slot) {
  return generateUtilityClass("MuiTabs", slot);
}
const tabsClasses = generateUtilityClasses("MuiTabs", ["root", "vertical", "flexContainer", "flexContainerVertical", "centered", "scroller", "fixed", "scrollableX", "scrollableY", "hideScrollbar", "scrollButtons", "scrollButtonsHideMobile", "indicator"]);
const _excluded = ["aria-label", "aria-labelledby", "action", "centered", "children", "className", "component", "allowScrollButtonsMobile", "indicatorColor", "onChange", "orientation", "ScrollButtonComponent", "scrollButtons", "selectionFollowsFocus", "slots", "slotProps", "TabIndicatorProps", "TabScrollButtonProps", "textColor", "value", "variant", "visibleScrollbar"];
const nextItem = (list, item) => {
  if (list === item) {
    return list.firstChild;
  }
  if (item && item.nextElementSibling) {
    return item.nextElementSibling;
  }
  return list.firstChild;
};
const previousItem = (list, item) => {
  if (list === item) {
    return list.lastChild;
  }
  if (item && item.previousElementSibling) {
    return item.previousElementSibling;
  }
  return list.lastChild;
};
const moveFocus = (list, currentFocus, traversalFunction) => {
  let wrappedOnce = false;
  let nextFocus = traversalFunction(list, currentFocus);
  while (nextFocus) {
    if (nextFocus === list.firstChild) {
      if (wrappedOnce) {
        return;
      }
      wrappedOnce = true;
    }
    const nextFocusDisabled = nextFocus.disabled || nextFocus.getAttribute("aria-disabled") === "true";
    if (!nextFocus.hasAttribute("tabindex") || nextFocusDisabled) {
      nextFocus = traversalFunction(list, nextFocus);
    } else {
      nextFocus.focus();
      return;
    }
  }
};
const useUtilityClasses = (ownerState) => {
  const {
    vertical,
    fixed,
    hideScrollbar,
    scrollableX,
    scrollableY,
    centered,
    scrollButtonsHideMobile,
    classes
  } = ownerState;
  const slots = {
    root: ["root", vertical && "vertical"],
    scroller: ["scroller", fixed && "fixed", hideScrollbar && "hideScrollbar", scrollableX && "scrollableX", scrollableY && "scrollableY"],
    flexContainer: ["flexContainer", vertical && "flexContainerVertical", centered && "centered"],
    indicator: ["indicator"],
    scrollButtons: ["scrollButtons", scrollButtonsHideMobile && "scrollButtonsHideMobile"],
    scrollableX: [scrollableX && "scrollableX"],
    hideScrollbar: [hideScrollbar && "hideScrollbar"]
  };
  return composeClasses(slots, getTabsUtilityClass, classes);
};
const TabsRoot = styled("div", {
  name: "MuiTabs",
  slot: "Root",
  overridesResolver: (props, styles2) => {
    const {
      ownerState
    } = props;
    return [{
      [`& .${tabsClasses.scrollButtons}`]: styles2.scrollButtons
    }, {
      [`& .${tabsClasses.scrollButtons}`]: ownerState.scrollButtonsHideMobile && styles2.scrollButtonsHideMobile
    }, styles2.root, ownerState.vertical && styles2.vertical];
  }
})(({
  ownerState,
  theme
}) => _extends({
  overflow: "hidden",
  minHeight: 48,
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: "touch",
  display: "flex"
}, ownerState.vertical && {
  flexDirection: "column"
}, ownerState.scrollButtonsHideMobile && {
  [`& .${tabsClasses.scrollButtons}`]: {
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  }
}));
const TabsScroller = styled("div", {
  name: "MuiTabs",
  slot: "Scroller",
  overridesResolver: (props, styles2) => {
    const {
      ownerState
    } = props;
    return [styles2.scroller, ownerState.fixed && styles2.fixed, ownerState.hideScrollbar && styles2.hideScrollbar, ownerState.scrollableX && styles2.scrollableX, ownerState.scrollableY && styles2.scrollableY];
  }
})(({
  ownerState
}) => _extends({
  position: "relative",
  display: "inline-block",
  flex: "1 1 auto",
  whiteSpace: "nowrap"
}, ownerState.fixed && {
  overflowX: "hidden",
  width: "100%"
}, ownerState.hideScrollbar && {
  // Hide dimensionless scrollbar on macOS
  scrollbarWidth: "none",
  // Firefox
  "&::-webkit-scrollbar": {
    display: "none"
    // Safari + Chrome
  }
}, ownerState.scrollableX && {
  overflowX: "auto",
  overflowY: "hidden"
}, ownerState.scrollableY && {
  overflowY: "auto",
  overflowX: "hidden"
}));
const FlexContainer = styled("div", {
  name: "MuiTabs",
  slot: "FlexContainer",
  overridesResolver: (props, styles2) => {
    const {
      ownerState
    } = props;
    return [styles2.flexContainer, ownerState.vertical && styles2.flexContainerVertical, ownerState.centered && styles2.centered];
  }
})(({
  ownerState
}) => _extends({
  display: "flex"
}, ownerState.vertical && {
  flexDirection: "column"
}, ownerState.centered && {
  justifyContent: "center"
}));
const TabsIndicator = styled("span", {
  name: "MuiTabs",
  slot: "Indicator",
  overridesResolver: (props, styles2) => styles2.indicator
})(({
  ownerState,
  theme
}) => _extends({
  position: "absolute",
  height: 2,
  bottom: 0,
  width: "100%",
  transition: theme.transitions.create()
}, ownerState.indicatorColor === "primary" && {
  backgroundColor: (theme.vars || theme).palette.primary.main
}, ownerState.indicatorColor === "secondary" && {
  backgroundColor: (theme.vars || theme).palette.secondary.main
}, ownerState.vertical && {
  height: "100%",
  width: 2,
  right: 0
}));
const TabsScrollbarSize = styled(ScrollbarSize)({
  overflowX: "auto",
  overflowY: "hidden",
  // Hide dimensionless scrollbar on macOS
  scrollbarWidth: "none",
  // Firefox
  "&::-webkit-scrollbar": {
    display: "none"
    // Safari + Chrome
  }
});
const defaultIndicatorStyle = {};
const Tabs = /* @__PURE__ */ reactExports.forwardRef(function Tabs2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiTabs"
  });
  const theme = useTheme();
  const isRtl = useRtl();
  const {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    action,
    centered = false,
    children: childrenProp,
    className,
    component = "div",
    allowScrollButtonsMobile = false,
    indicatorColor = "primary",
    onChange,
    orientation = "horizontal",
    ScrollButtonComponent = TabScrollButton,
    scrollButtons = "auto",
    selectionFollowsFocus,
    slots = {},
    slotProps = {},
    TabIndicatorProps = {},
    TabScrollButtonProps = {},
    textColor = "primary",
    value,
    variant = "standard",
    visibleScrollbar = false
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const scrollable = variant === "scrollable";
  const vertical = orientation === "vertical";
  const scrollStart = vertical ? "scrollTop" : "scrollLeft";
  const start = vertical ? "top" : "left";
  const end = vertical ? "bottom" : "right";
  const clientSize = vertical ? "clientHeight" : "clientWidth";
  const size = vertical ? "height" : "width";
  const ownerState = _extends({}, props, {
    component,
    allowScrollButtonsMobile,
    indicatorColor,
    orientation,
    vertical,
    scrollButtons,
    textColor,
    variant,
    visibleScrollbar,
    fixed: !scrollable,
    hideScrollbar: scrollable && !visibleScrollbar,
    scrollableX: scrollable && !vertical,
    scrollableY: scrollable && vertical,
    centered: centered && !scrollable,
    scrollButtonsHideMobile: !allowScrollButtonsMobile
  });
  const classes = useUtilityClasses(ownerState);
  const startScrollButtonIconProps = useSlotProps({
    elementType: slots.StartScrollButtonIcon,
    externalSlotProps: slotProps.startScrollButtonIcon,
    ownerState
  });
  const endScrollButtonIconProps = useSlotProps({
    elementType: slots.EndScrollButtonIcon,
    externalSlotProps: slotProps.endScrollButtonIcon,
    ownerState
  });
  const [mounted, setMounted] = reactExports.useState(false);
  const [indicatorStyle, setIndicatorStyle] = reactExports.useState(defaultIndicatorStyle);
  const [displayStartScroll, setDisplayStartScroll] = reactExports.useState(false);
  const [displayEndScroll, setDisplayEndScroll] = reactExports.useState(false);
  const [updateScrollObserver, setUpdateScrollObserver] = reactExports.useState(false);
  const [scrollerStyle, setScrollerStyle] = reactExports.useState({
    overflow: "hidden",
    scrollbarWidth: 0
  });
  const valueToIndex = /* @__PURE__ */ new Map();
  const tabsRef = reactExports.useRef(null);
  const tabListRef = reactExports.useRef(null);
  const getTabsMeta = () => {
    const tabsNode = tabsRef.current;
    let tabsMeta;
    if (tabsNode) {
      const rect = tabsNode.getBoundingClientRect();
      tabsMeta = {
        clientWidth: tabsNode.clientWidth,
        scrollLeft: tabsNode.scrollLeft,
        scrollTop: tabsNode.scrollTop,
        scrollLeftNormalized: getNormalizedScrollLeft(tabsNode, isRtl ? "rtl" : "ltr"),
        scrollWidth: tabsNode.scrollWidth,
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right
      };
    }
    let tabMeta;
    if (tabsNode && value !== false) {
      const children2 = tabListRef.current.children;
      if (children2.length > 0) {
        const tab = children2[valueToIndex.get(value)];
        tabMeta = tab ? tab.getBoundingClientRect() : null;
      }
    }
    return {
      tabsMeta,
      tabMeta
    };
  };
  const updateIndicatorState = useEventCallback(() => {
    const {
      tabsMeta,
      tabMeta
    } = getTabsMeta();
    let startValue = 0;
    let startIndicator;
    if (vertical) {
      startIndicator = "top";
      if (tabMeta && tabsMeta) {
        startValue = tabMeta.top - tabsMeta.top + tabsMeta.scrollTop;
      }
    } else {
      startIndicator = isRtl ? "right" : "left";
      if (tabMeta && tabsMeta) {
        const correction = isRtl ? tabsMeta.scrollLeftNormalized + tabsMeta.clientWidth - tabsMeta.scrollWidth : tabsMeta.scrollLeft;
        startValue = (isRtl ? -1 : 1) * (tabMeta[startIndicator] - tabsMeta[startIndicator] + correction);
      }
    }
    const newIndicatorStyle = {
      [startIndicator]: startValue,
      // May be wrong until the font is loaded.
      [size]: tabMeta ? tabMeta[size] : 0
    };
    if (isNaN(indicatorStyle[startIndicator]) || isNaN(indicatorStyle[size])) {
      setIndicatorStyle(newIndicatorStyle);
    } else {
      const dStart = Math.abs(indicatorStyle[startIndicator] - newIndicatorStyle[startIndicator]);
      const dSize = Math.abs(indicatorStyle[size] - newIndicatorStyle[size]);
      if (dStart >= 1 || dSize >= 1) {
        setIndicatorStyle(newIndicatorStyle);
      }
    }
  });
  const scroll = (scrollValue, {
    animation = true
  } = {}) => {
    if (animation) {
      animate(scrollStart, tabsRef.current, scrollValue, {
        duration: theme.transitions.duration.standard
      });
    } else {
      tabsRef.current[scrollStart] = scrollValue;
    }
  };
  const moveTabsScroll = (delta) => {
    let scrollValue = tabsRef.current[scrollStart];
    if (vertical) {
      scrollValue += delta;
    } else {
      scrollValue += delta * (isRtl ? -1 : 1);
      scrollValue *= isRtl && detectScrollType() === "reverse" ? -1 : 1;
    }
    scroll(scrollValue);
  };
  const getScrollSize = () => {
    const containerSize = tabsRef.current[clientSize];
    let totalSize = 0;
    const children2 = Array.from(tabListRef.current.children);
    for (let i = 0; i < children2.length; i += 1) {
      const tab = children2[i];
      if (totalSize + tab[clientSize] > containerSize) {
        if (i === 0) {
          totalSize = containerSize;
        }
        break;
      }
      totalSize += tab[clientSize];
    }
    return totalSize;
  };
  const handleStartScrollClick = () => {
    moveTabsScroll(-1 * getScrollSize());
  };
  const handleEndScrollClick = () => {
    moveTabsScroll(getScrollSize());
  };
  const handleScrollbarSizeChange = reactExports.useCallback((scrollbarWidth) => {
    setScrollerStyle({
      overflow: null,
      scrollbarWidth
    });
  }, []);
  const getConditionalElements = () => {
    const conditionalElements2 = {};
    conditionalElements2.scrollbarSizeListener = scrollable ? /* @__PURE__ */ jsxRuntimeExports.jsx(TabsScrollbarSize, {
      onChange: handleScrollbarSizeChange,
      className: clsx(classes.scrollableX, classes.hideScrollbar)
    }) : null;
    const scrollButtonsActive = displayStartScroll || displayEndScroll;
    const showScrollButtons = scrollable && (scrollButtons === "auto" && scrollButtonsActive || scrollButtons === true);
    conditionalElements2.scrollButtonStart = showScrollButtons ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollButtonComponent, _extends({
      slots: {
        StartScrollButtonIcon: slots.StartScrollButtonIcon
      },
      slotProps: {
        startScrollButtonIcon: startScrollButtonIconProps
      },
      orientation,
      direction: isRtl ? "right" : "left",
      onClick: handleStartScrollClick,
      disabled: !displayStartScroll
    }, TabScrollButtonProps, {
      className: clsx(classes.scrollButtons, TabScrollButtonProps.className)
    })) : null;
    conditionalElements2.scrollButtonEnd = showScrollButtons ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollButtonComponent, _extends({
      slots: {
        EndScrollButtonIcon: slots.EndScrollButtonIcon
      },
      slotProps: {
        endScrollButtonIcon: endScrollButtonIconProps
      },
      orientation,
      direction: isRtl ? "left" : "right",
      onClick: handleEndScrollClick,
      disabled: !displayEndScroll
    }, TabScrollButtonProps, {
      className: clsx(classes.scrollButtons, TabScrollButtonProps.className)
    })) : null;
    return conditionalElements2;
  };
  const scrollSelectedIntoView = useEventCallback((animation) => {
    const {
      tabsMeta,
      tabMeta
    } = getTabsMeta();
    if (!tabMeta || !tabsMeta) {
      return;
    }
    if (tabMeta[start] < tabsMeta[start]) {
      const nextScrollStart = tabsMeta[scrollStart] + (tabMeta[start] - tabsMeta[start]);
      scroll(nextScrollStart, {
        animation
      });
    } else if (tabMeta[end] > tabsMeta[end]) {
      const nextScrollStart = tabsMeta[scrollStart] + (tabMeta[end] - tabsMeta[end]);
      scroll(nextScrollStart, {
        animation
      });
    }
  });
  const updateScrollButtonState = useEventCallback(() => {
    if (scrollable && scrollButtons !== false) {
      setUpdateScrollObserver(!updateScrollObserver);
    }
  });
  reactExports.useEffect(() => {
    const handleResize = debounce(() => {
      if (tabsRef.current) {
        updateIndicatorState();
      }
    });
    let resizeObserver;
    const handleMutation = (records) => {
      records.forEach((record) => {
        record.removedNodes.forEach((item) => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.unobserve(item);
        });
        record.addedNodes.forEach((item) => {
          var _resizeObserver2;
          (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.observe(item);
        });
      });
      handleResize();
      updateScrollButtonState();
    };
    const win = ownerWindow(tabsRef.current);
    win.addEventListener("resize", handleResize);
    let mutationObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      Array.from(tabListRef.current.children).forEach((child) => {
        resizeObserver.observe(child);
      });
    }
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(handleMutation);
      mutationObserver.observe(tabListRef.current, {
        childList: true
      });
    }
    return () => {
      var _mutationObserver, _resizeObserver3;
      handleResize.clear();
      win.removeEventListener("resize", handleResize);
      (_mutationObserver = mutationObserver) == null || _mutationObserver.disconnect();
      (_resizeObserver3 = resizeObserver) == null || _resizeObserver3.disconnect();
    };
  }, [updateIndicatorState, updateScrollButtonState]);
  reactExports.useEffect(() => {
    const tabListChildren = Array.from(tabListRef.current.children);
    const length = tabListChildren.length;
    if (typeof IntersectionObserver !== "undefined" && length > 0 && scrollable && scrollButtons !== false) {
      const firstTab = tabListChildren[0];
      const lastTab = tabListChildren[length - 1];
      const observerOptions = {
        root: tabsRef.current,
        threshold: 0.99
      };
      const handleScrollButtonStart = (entries) => {
        setDisplayStartScroll(!entries[0].isIntersecting);
      };
      const firstObserver = new IntersectionObserver(handleScrollButtonStart, observerOptions);
      firstObserver.observe(firstTab);
      const handleScrollButtonEnd = (entries) => {
        setDisplayEndScroll(!entries[0].isIntersecting);
      };
      const lastObserver = new IntersectionObserver(handleScrollButtonEnd, observerOptions);
      lastObserver.observe(lastTab);
      return () => {
        firstObserver.disconnect();
        lastObserver.disconnect();
      };
    }
    return void 0;
  }, [scrollable, scrollButtons, updateScrollObserver, childrenProp == null ? void 0 : childrenProp.length]);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  reactExports.useEffect(() => {
    updateIndicatorState();
  });
  reactExports.useEffect(() => {
    scrollSelectedIntoView(defaultIndicatorStyle !== indicatorStyle);
  }, [scrollSelectedIntoView, indicatorStyle]);
  reactExports.useImperativeHandle(action, () => ({
    updateIndicator: updateIndicatorState,
    updateScrollButtons: updateScrollButtonState
  }), [updateIndicatorState, updateScrollButtonState]);
  const indicator = /* @__PURE__ */ jsxRuntimeExports.jsx(TabsIndicator, _extends({}, TabIndicatorProps, {
    className: clsx(classes.indicator, TabIndicatorProps.className),
    ownerState,
    style: _extends({}, indicatorStyle, TabIndicatorProps.style)
  }));
  let childIndex = 0;
  const children = reactExports.Children.map(childrenProp, (child) => {
    if (!/* @__PURE__ */ reactExports.isValidElement(child)) {
      return null;
    }
    const childValue = child.props.value === void 0 ? childIndex : child.props.value;
    valueToIndex.set(childValue, childIndex);
    const selected = childValue === value;
    childIndex += 1;
    return /* @__PURE__ */ reactExports.cloneElement(child, _extends({
      fullWidth: variant === "fullWidth",
      indicator: selected && !mounted && indicator,
      selected,
      selectionFollowsFocus,
      onChange,
      textColor,
      value: childValue
    }, childIndex === 1 && value === false && !child.props.tabIndex ? {
      tabIndex: 0
    } : {}));
  });
  const handleKeyDown = (event) => {
    const list = tabListRef.current;
    const currentFocus = ownerDocument(list).activeElement;
    const role = currentFocus.getAttribute("role");
    if (role !== "tab") {
      return;
    }
    let previousItemKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    let nextItemKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    if (orientation === "horizontal" && isRtl) {
      previousItemKey = "ArrowRight";
      nextItemKey = "ArrowLeft";
    }
    switch (event.key) {
      case previousItemKey:
        event.preventDefault();
        moveFocus(list, currentFocus, previousItem);
        break;
      case nextItemKey:
        event.preventDefault();
        moveFocus(list, currentFocus, nextItem);
        break;
      case "Home":
        event.preventDefault();
        moveFocus(list, null, nextItem);
        break;
      case "End":
        event.preventDefault();
        moveFocus(list, null, previousItem);
        break;
    }
  };
  const conditionalElements = getConditionalElements();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsRoot, _extends({
    className: clsx(classes.root, className),
    ownerState,
    ref,
    as: component
  }, other, {
    children: [conditionalElements.scrollButtonStart, conditionalElements.scrollbarSizeListener, /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsScroller, {
      className: classes.scroller,
      ownerState,
      style: {
        overflow: scrollerStyle.overflow,
        [vertical ? `margin${isRtl ? "Left" : "Right"}` : "marginBottom"]: visibleScrollbar ? void 0 : -scrollerStyle.scrollbarWidth
      },
      ref: tabsRef,
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(FlexContainer, {
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-orientation": orientation === "vertical" ? "vertical" : null,
        className: classes.flexContainer,
        ownerState,
        onKeyDown: handleKeyDown,
        ref: tabListRef,
        role: "tablist",
        children
      }), mounted && indicator]
    }), conditionalElements.scrollButtonEnd]
  }));
});
const PhotoCamera = createSvgIcon([/* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
  cx: "12",
  cy: "12",
  r: "3.2"
}, "0"), /* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5"
}, "1")], "PhotoCamera");
const ProfileForm = ({
  user,
  allUsers,
  departments,
  designations,
  setUser,
  open,
  closeModal,
  handleImageChange,
  selectedImage
}) => {
  const [updatedUser, setUpdatedUser] = reactExports.useState({
    id: user.id
  });
  const [errors, setErrors] = reactExports.useState({});
  const [processing, setProcessing] = reactExports.useState(false);
  const [hover, setHover] = reactExports.useState(false);
  const theme = useTheme();
  const handleChange = (key, value) => {
    if (key === "department" && user.department !== value) {
      user.designation = null;
      user.report_to = null;
    }
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      [key]: value
    }));
  };
  async function handleSubmit(event) {
    event.preventDefault();
    console.log(updatedUser);
    setProcessing(true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(route("profile.update"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify({
            ruleSet: "profile",
            ...updatedUser
          })
        });
        const data = await response.json();
        if (response.ok) {
          setUser((prevUser) => ({
            ...prevUser,
            ...updatedUser
          }));
          setProcessing(false);
          closeModal();
          resolve([...data.messages]);
          console.log(data.messages);
        } else {
          setProcessing(false);
          setErrors(data.errors);
          reject(data.errors);
          console.error(data.errors);
        }
      } catch (error) {
        setProcessing(false);
        closeModal();
        console.log(error);
        reject(["An unexpected error occurred."]);
      }
    });
    B.promise(promise, {
      pending: {
        render() {
          return /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ jsx(CircularProgress, {}),
            /* @__PURE__ */ jsx("span", { style: {
              marginLeft: "8px"
            }, children: "Updating profile ..." })
          ] });
        },
        icon: false,
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      success: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data.map((message, index) => /* @__PURE__ */ jsx("div", { children: message }, index)) });
        },
        icon: "🟢",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      error: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data.map((message, index) => /* @__PURE__ */ jsx("div", { children: message }, index)) });
        },
        icon: "🔴",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      }
    });
  }
  return /* @__PURE__ */ jsxs(GlassDialog, { open, onClose: closeModal, children: [
    /* @__PURE__ */ jsxs(DialogTitle, { style: {
      cursor: "move"
    }, id: "draggable-dialog-title", children: [
      /* @__PURE__ */ jsx(Typography, { children: "Profile Information" }),
      /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: closeModal, sx: {
        position: "absolute",
        top: 8,
        right: 16
      }, children: /* @__PURE__ */ jsx(default_1, {}) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, display: "flex", alignItems: "center", justifyContent: "center", children: /* @__PURE__ */ jsxs(Box, { position: "relative", display: "inline-block", onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), children: [
          /* @__PURE__ */ jsx(Avatar, { alt: updatedUser.name || user.name, src: selectedImage || `assets/images/users/${updatedUser.user_name || user.user_name}.jpg`, sx: {
            width: 100,
            height: 100
          } }),
          hover && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Box, { sx: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }, children: /* @__PURE__ */ jsx(IconButton, { color: "primary", component: "span", children: /* @__PURE__ */ jsx(PhotoCamera, {}) }) }) }),
          /* @__PURE__ */ jsx("input", { accept: "image/*", style: {
            display: "none"
          }, id: "upload-button", type: "file", onChange: handleImageChange }),
          /* @__PURE__ */ jsx("label", { htmlFor: "upload-button", children: /* @__PURE__ */ jsx(Box, { sx: {
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            borderRadius: "50%",
            cursor: "pointer"
          } }) })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Name", fullWidth: true, value: updatedUser.name || user.name || "", onChange: (e) => handleChange("name", e.target.value), error: Boolean(errors.name), helperText: errors.name }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsx(InputLabel, { id: "gender-label", children: "Gender" }),
          /* @__PURE__ */ jsxs(Select, { labelId: "gender-label", value: updatedUser.gender || user.gender || "na", onChange: (e) => handleChange("gender", e.target.value), error: Boolean(errors.gender), label: "Gender", MenuProps: {
            PaperProps: {
              sx: {
                backdropFilter: "blur(16px) saturate(200%)",
                backgroundColor: theme.glassCard.backgroundColor,
                border: theme.glassCard.border,
                borderRadius: 2,
                boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
              }
            }
          }, children: [
            /* @__PURE__ */ jsx(MenuItem, { disabled: true, value: "na", children: "Select Gender" }),
            /* @__PURE__ */ jsx(MenuItem, { value: "Male", children: "Male" }),
            /* @__PURE__ */ jsx(MenuItem, { value: "Female", children: "Female" })
          ] }),
          /* @__PURE__ */ jsx(FormHelperText, { children: errors.gender })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Birth Date", type: "date", fullWidth: true, value: updatedUser.birthday || user.birthday || "", onChange: (e) => handleChange("birthday", e.target.value), InputLabelProps: {
          shrink: true
        }, error: Boolean(errors.birthday), helperText: errors.birthday }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Joining Date", type: "date", fullWidth: true, value: updatedUser.date_of_joining || user.date_of_joining || "", onChange: (e) => handleChange("date_of_joining", e.target.value), InputLabelProps: {
          shrink: true
        }, error: Boolean(errors.date_of_joining), helperText: errors.date_of_joining }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(TextField, { label: "Address", fullWidth: true, value: updatedUser.address || user.address, onChange: (e) => handleChange("address", e.target.value), error: Boolean(errors.address), helperText: errors.address }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Employee ID", fullWidth: true, value: updatedUser.employee_id || user.employee_id || "", onChange: (e) => handleChange("employee_id", e.target.value), error: Boolean(errors.employee_id), helperText: errors.employee_id }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Phone Number", fullWidth: true, value: updatedUser.phone || user.phone, onChange: (e) => handleChange("phone", e.target.value), error: Boolean(errors.phone), helperText: errors.phone }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Email Adress", fullWidth: true, value: updatedUser.email || user.email, onChange: (e) => handleChange("email", e.target.value), error: Boolean(errors.email), helperText: errors.email }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsx(InputLabel, { id: "department", children: "Department" }),
          /* @__PURE__ */ jsxs(Select, { labelId: "department", onChange: (e) => handleChange("department", e.target.value), error: Boolean(errors.department), id: `department-select-${user.id}`, value: updatedUser.department || user.department || "na", label: "Department", MenuProps: {
            PaperProps: {
              sx: {
                backdropFilter: "blur(16px) saturate(200%)",
                backgroundColor: theme.glassCard.backgroundColor,
                border: theme.glassCard.border,
                borderRadius: 2,
                boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
              }
            }
          }, children: [
            /* @__PURE__ */ jsx(MenuItem, { value: "na", disabled: true, children: "Select Department" }),
            departments.map((dept) => /* @__PURE__ */ jsx(MenuItem, { value: dept.id, children: dept.name }, dept.id))
          ] }),
          /* @__PURE__ */ jsx(FormHelperText, { children: errors.department })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsx(InputLabel, { id: "designation", children: "Designation" }),
          /* @__PURE__ */ jsxs(Select, { labelId: "designation", onChange: (e) => handleChange("designation", e.target.value), label: "Designation", error: Boolean(errors.designation), id: `designation-select-${user.id}`, value: updatedUser.designation || user.designation || "na", disabled: !user.department, MenuProps: {
            PaperProps: {
              sx: {
                backdropFilter: "blur(16px) saturate(200%)",
                backgroundColor: theme.glassCard.backgroundColor,
                border: theme.glassCard.border,
                borderRadius: 2,
                boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
              }
            }
          }, children: [
            /* @__PURE__ */ jsx(MenuItem, { value: "na", disabled: true, children: "Select Designation" }),
            designations.filter((designation) => designation.department_id === updatedUser.department || user.department).map((desig) => /* @__PURE__ */ jsx(MenuItem, { value: desig.id, children: desig.title }, desig.id))
          ] }),
          /* @__PURE__ */ jsx(FormHelperText, { children: errors.designation })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsx(InputLabel, { id: "report_to", children: "Reports To" }),
          /* @__PURE__ */ jsxs(Select, { labelId: "report_to", value: updatedUser.report_to || user.report_to, onChange: (e) => handleChange("report_to", e.target.value), label: "Reports To", error: Boolean(errors.report_to), disabled: user.report_to === "na", MenuProps: {
            PaperProps: {
              sx: {
                backdropFilter: "blur(16px) saturate(200%)",
                backgroundColor: theme.glassCard.backgroundColor,
                border: theme.glassCard.border,
                borderRadius: 2,
                boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
              }
            }
          }, children: [
            /* @__PURE__ */ jsx(MenuItem, { value: "na", children: "--" }),
            allUsers.filter((person) => person.department === updatedUser.department || user.department).map((pers) => /* @__PURE__ */ jsx(MenuItem, { value: pers.id, children: pers.name }, pers.id))
          ] }),
          /* @__PURE__ */ jsx(FormHelperText, { children: errors.report_to })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx(DialogActions, { sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }, children: /* @__PURE__ */ jsx(LoadingButton, { sx: {
        borderRadius: "50px",
        padding: "6px 16px"
      }, variant: "outlined", color: "primary", type: "submit", loading: processing, children: "Submit" }) })
    ] })
  ] });
};
const PersonalInformationForm = ({
  user,
  setUser,
  open,
  closeModal
}) => {
  const [initialUserData, setInitialUserData] = reactExports.useState({
    id: user.id,
    passport_no: user.passport_no || "",
    passport_exp_date: user.passport_exp_date || "",
    nationality: user.nationality || "",
    religion: user.religion || "",
    marital_status: user.marital_status || "",
    employment_of_spouse: user.employment_of_spouse || "",
    number_of_children: user.number_of_children || "",
    // Assuming number_of_children should default to 0 if not provided
    nid: user.nid || ""
    // Default to empty string if nid is not provided
  });
  const [changedUserData, setChangedUserData] = reactExports.useState({
    id: user.id
  });
  const [dataChanged, setDataChanged] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const [processing, setProcessing] = reactExports.useState(false);
  const theme = useTheme();
  const handleChange = (key, value) => {
    setInitialUserData((prevUser) => {
      const updatedData = {
        ...prevUser,
        [key]: value
      };
      if (value === "") {
        delete updatedData[key];
      }
      if (key === "marital_status" && value === "Single") {
        updatedData["employment_of_spouse"] = "";
        updatedData["number_of_children"] = "";
      }
      return updatedData;
    });
    setChangedUserData((prevUser) => {
      const updatedData = {
        ...prevUser,
        [key]: value
      };
      if (value === "") {
        delete updatedData[key];
      }
      if (key === "marital_status" && value === "Single") {
        updatedData["employment_of_spouse"] = null;
        updatedData["number_of_children"] = null;
      }
      return updatedData;
    });
  };
  reactExports.useEffect(() => {
    for (const key in changedUserData) {
      if (key !== "id" && changedUserData[key] === user[key]) {
        delete changedUserData[key];
      }
    }
    const hasChanges = Object.keys(changedUserData).filter((key) => key !== "id").length > 0;
    setDataChanged(hasChanges);
  }, [initialUserData, changedUserData, user]);
  async function handleSubmit(event) {
    event.preventDefault();
    setProcessing(true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(route("profile.update"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify({
            ruleSet: "personal",
            ...initialUserData
          })
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          setProcessing(false);
          closeModal();
          resolve([...data.messages]);
        } else {
          setProcessing(false);
          setErrors(data.errors);
          reject(data.error || "Failed to update personal information.");
          console.error(data.errors);
        }
      } catch (error) {
        setProcessing(false);
        console.log(error);
        reject(error.message || "An unexpected error occurred.");
      }
    });
    B.promise(promise, {
      pending: {
        render() {
          return /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ jsx(CircularProgress, {}),
            /* @__PURE__ */ jsx("span", { style: {
              marginLeft: "8px"
            }, children: "Updating personal information ..." })
          ] });
        },
        icon: false,
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      success: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data.map((message, index) => /* @__PURE__ */ jsx("div", { children: message }, index)) });
        },
        icon: "🟢",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      error: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data });
        },
        icon: "🔴",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      }
    });
  }
  return /* @__PURE__ */ jsxs(GlassDialog, { open, onClose: closeModal, children: [
    /* @__PURE__ */ jsxs(DialogTitle, { style: {
      cursor: "move"
    }, id: "draggable-dialog-title", children: [
      /* @__PURE__ */ jsx(Typography, { children: "Personal Information" }),
      /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: closeModal, sx: {
        position: "absolute",
        top: 8,
        right: 16
      }, children: /* @__PURE__ */ jsx(default_1, {}) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Passport No", fullWidth: true, value: changedUserData.passport_no || initialUserData.passport_no || "", onChange: (e) => handleChange("passport_no", e.target.value), error: Boolean(errors.passport_no), helperText: errors.passport_no }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Passport Expiry Date", fullWidth: true, type: "date", value: changedUserData.passport_exp_date || initialUserData.passport_exp_date || "", onChange: (e) => handleChange("passport_exp_date", e.target.value), InputLabelProps: {
          shrink: true
        }, error: Boolean(errors.passport_exp_date), helperText: errors.passport_exp_date }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "NID No", fullWidth: true, value: changedUserData.nid || initialUserData.nid || "", onChange: (e) => handleChange("nid", e.target.value), error: Boolean(errors.nid), helperText: errors.nid }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Nationality", fullWidth: true, value: changedUserData.nationality || initialUserData.nationality || "", onChange: (e) => handleChange("nationality", e.target.value), error: Boolean(errors.nationality), helperText: errors.nationality }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Religion", fullWidth: true, value: changedUserData.religion || initialUserData.religion || "", onChange: (e) => handleChange("religion", e.target.value), error: Boolean(errors.religion), helperText: errors.religion }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsx(InputLabel, { id: "marital-status-label", children: "Marital status" }),
          /* @__PURE__ */ jsxs(Select, { labelId: "marital-status-label", value: changedUserData.marital_status || initialUserData.marital_status || "na", onChange: (e) => handleChange("marital_status", e.target.value), label: "Marital status", error: Boolean(errors.marital_status), MenuProps: {
            PaperProps: {
              sx: {
                backdropFilter: "blur(16px) saturate(200%)",
                backgroundColor: theme.glassCard.backgroundColor,
                border: theme.glassCard.border,
                borderRadius: 2,
                boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
              }
            }
          }, children: [
            /* @__PURE__ */ jsx(MenuItem, { value: "na", children: "-" }),
            /* @__PURE__ */ jsx(MenuItem, { value: "Single", children: "Single" }),
            /* @__PURE__ */ jsx(MenuItem, { value: "Married", children: "Married" })
          ] }),
          /* @__PURE__ */ jsx(FormHelperText, { children: errors.marital_status })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Employment of spouse", fullWidth: true, value: changedUserData.marital_status === "Single" ? "" : changedUserData.employment_of_spouse || initialUserData.employment_of_spouse, onChange: (e) => handleChange("employment_of_spouse", e.target.value), error: Boolean(errors.employment_of_spouse), helperText: errors.employment_of_spouse, disabled: changedUserData.marital_status === "Single" || initialUserData.marital_status === "Single" }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "No. of children", fullWidth: true, type: "number", value: changedUserData.marital_status === "Single" ? "" : changedUserData.number_of_children || initialUserData.number_of_children, onChange: (e) => handleChange("number_of_children", e.target.value), error: Boolean(errors.number_of_children), helperText: errors.number_of_children, disabled: changedUserData.marital_status === "Single" || initialUserData.marital_status === "Single" }) })
      ] }) }),
      /* @__PURE__ */ jsx(DialogActions, { sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }, children: /* @__PURE__ */ jsx(LoadingButton, { disabled: !dataChanged, sx: {
        borderRadius: "50px",
        padding: "6px 16px"
      }, variant: "outlined", color: "primary", type: "submit", loading: processing, children: "Submit" }) })
    ] })
  ] });
};
const EmergencyContactForm = ({
  user,
  setUser,
  open,
  closeModal
}) => {
  const [initialUserData, setInitialUserData] = reactExports.useState({
    id: user.id,
    emergency_contact_primary_name: user.emergency_contact_primary_name || "",
    emergency_contact_primary_relationship: user.emergency_contact_primary_relationship || "",
    emergency_contact_primary_phone: user.emergency_contact_primary_phone || "",
    emergency_contact_secondary_name: user.emergency_contact_secondary_name || "",
    emergency_contact_secondary_relationship: user.emergency_contact_secondary_relationship || "",
    emergency_contact_secondary_phone: user.emergency_contact_secondary_phone || ""
  });
  const [changedUserData, setChangedUserData] = reactExports.useState({
    id: user.id
  });
  const [dataChanged, setDataChanged] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const [processing, setProcessing] = reactExports.useState(false);
  const theme = useTheme();
  const handleChange = (key, value) => {
    setInitialUserData((prevUser) => {
      const updatedData = {
        ...prevUser,
        [key]: value
      };
      if (value === "") {
        delete updatedData[key];
      }
      return updatedData;
    });
    setChangedUserData((prevUser) => {
      const updatedData = {
        ...prevUser,
        [key]: value
      };
      if (value === "") {
        delete updatedData[key];
      }
      return updatedData;
    });
  };
  reactExports.useEffect(() => {
    for (const key in changedUserData) {
      if (key !== "id" && changedUserData[key] === user[key]) {
        delete changedUserData[key];
      }
    }
    const hasChanges = Object.keys(changedUserData).filter((key) => key !== "id").length > 0;
    setDataChanged(hasChanges);
  }, [initialUserData, changedUserData, user]);
  async function handleSubmit(event) {
    event.preventDefault();
    setProcessing(true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(route("profile.update"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify({
            ruleSet: "emergency",
            ...initialUserData
          })
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          setProcessing(false);
          closeModal();
          resolve([...data.messages]);
        } else {
          setProcessing(false);
          setErrors(data.errors);
          reject(data.error || "Failed to update emergency contact.");
          console.error(data.errors);
        }
      } catch (error) {
        setProcessing(false);
        closeModal();
        console.log(error);
        reject(["An unexpected error occurred."]);
      }
    });
    B.promise(promise, {
      pending: {
        render() {
          return /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ jsx(CircularProgress, {}),
            /* @__PURE__ */ jsx("span", { style: {
              marginLeft: "8px"
            }, children: "Updating personal information ..." })
          ] });
        },
        icon: false,
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      success: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data.map((message, index) => /* @__PURE__ */ jsx("div", { children: message }, index)) });
        },
        icon: "🟢",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      error: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data });
        },
        icon: "🔴",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      }
    });
  }
  return /* @__PURE__ */ jsxs(GlassDialog, { open, onClose: closeModal, children: [
    /* @__PURE__ */ jsxs(DialogTitle, { style: {
      cursor: "move"
    }, id: "draggable-dialog-title", children: [
      /* @__PURE__ */ jsx(Typography, { children: "Personal Information" }),
      /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: closeModal, sx: {
        position: "absolute",
        top: 8,
        right: 16
      }, children: /* @__PURE__ */ jsx(default_1, {}) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(GlassCard, { children: /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Primary Contact" }),
          /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Name", required: true, fullWidth: true, value: changedUserData.emergency_contact_primary_name || initialUserData.emergency_contact_primary_name || "", onChange: (e) => handleChange("emergency_contact_primary_name", e.target.value), error: Boolean(errors.bank_name), helperText: errors.bank_name }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Relationship", required: true, fullWidth: true, value: changedUserData.emergency_contact_primary_relationship || initialUserData.emergency_contact_primary_relationship || "", onChange: (e) => handleChange("emergency_contact_primary_relationship", e.target.value), error: Boolean(errors.bank_name), helperText: errors.bank_name }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Phone", required: true, fullWidth: true, value: changedUserData.emergency_contact_primary_phone || initialUserData.emergency_contact_primary_phone || "", onChange: (e) => handleChange("emergency_contact_primary_phone", e.target.value), error: Boolean(errors.bank_name), helperText: errors.bank_name }) })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(GlassCard, { children: /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Secondary Contact" }),
          /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Name", fullWidth: true, value: changedUserData.emergency_contact_secondary_name || initialUserData.emergency_contact_secondary_name || "", onChange: (e) => handleChange("emergency_contact_secondary_name", e.target.value), error: Boolean(errors.bank_name), helperText: errors.bank_name }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Relationship", fullWidth: true, value: changedUserData.emergency_contact_secondary_relationship || initialUserData.emergency_contact_secondary_relationship || "", onChange: (e) => handleChange("emergency_contact_secondary_relationship", e.target.value), error: Boolean(errors.bank_name), helperText: errors.bank_name }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Phone", fullWidth: true, value: changedUserData.emergency_contact_secondary_phone || initialUserData.emergency_contact_secondary_phone || "", onChange: (e) => handleChange("emergency_contact_secondary_phone", e.target.value), error: Boolean(errors.bank_name), helperText: errors.bank_name }) })
          ] })
        ] }) }) })
      ] }) }),
      /* @__PURE__ */ jsx(DialogActions, { sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }, children: /* @__PURE__ */ jsx(LoadingButton, { disabled: !dataChanged, sx: {
        borderRadius: "50px",
        padding: "6px 16px"
      }, variant: "outlined", color: "primary", type: "submit", loading: processing, children: "Submit" }) })
    ] })
  ] });
};
const BankInformationForm$1 = ({
  user,
  setUser,
  open,
  closeModal
}) => {
  const [initialUserData, setInitialUserData] = reactExports.useState({
    id: user.id,
    bank_name: user.bank_name || "",
    // Default to empty string if not provided
    bank_account_no: user.bank_account_no || "",
    // Default to empty string if not provided
    ifsc_code: user.ifsc_code || "",
    // Default to empty string if not provided
    pan_no: user.pan_no || ""
    // Default to empty string if not provided
  });
  const [changedUserData, setChangedUserData] = reactExports.useState({
    id: user.id
  });
  const [dataChanged, setDataChanged] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const [processing, setProcessing] = reactExports.useState(false);
  const theme = useTheme();
  const handleChange = (key, value) => {
    setInitialUserData((prevUser) => {
      const updatedData = {
        ...prevUser,
        [key]: value
      };
      if (value === "") {
        delete updatedData[key];
      }
      return updatedData;
    });
    setChangedUserData((prevUser) => {
      const updatedData = {
        ...prevUser,
        [key]: value
      };
      if (value === "") {
        delete updatedData[key];
      }
      return updatedData;
    });
  };
  reactExports.useEffect(() => {
    for (const key in changedUserData) {
      if (key !== "id" && changedUserData[key] === user[key]) {
        delete changedUserData[key];
      }
    }
    const hasChanges = Object.keys(changedUserData).filter((key) => key !== "id").length > 0;
    setDataChanged(hasChanges);
  }, [initialUserData, changedUserData, user]);
  async function handleSubmit(event) {
    event.preventDefault();
    setProcessing(true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(route("profile.update"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify({
            ruleSet: "bank",
            ...initialUserData
          })
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          setProcessing(false);
          closeModal();
          resolve([...data.messages]);
        } else {
          setProcessing(false);
          setErrors(data.errors);
          reject(data.error || "Failed to update bank information.");
          console.error(data.errors);
        }
      } catch (error) {
        setProcessing(false);
        console.log(error);
        reject(error.message || "An unexpected error occurred.");
      }
    });
    B.promise(promise, {
      pending: {
        render() {
          return /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ jsx(CircularProgress, {}),
            /* @__PURE__ */ jsx("span", { style: {
              marginLeft: "8px"
            }, children: "Updating bank information ..." })
          ] });
        },
        icon: false,
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      success: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data.map((message, index) => /* @__PURE__ */ jsx("div", { children: message }, index)) });
        },
        icon: "🟢",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      error: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data });
        },
        icon: "🔴",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      }
    });
  }
  return /* @__PURE__ */ jsxs(GlassDialog, { open, onClose: closeModal, children: [
    /* @__PURE__ */ jsxs(DialogTitle, { style: {
      cursor: "move"
    }, id: "draggable-dialog-title", children: [
      /* @__PURE__ */ jsx(Typography, { children: "Bank Information" }),
      /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: closeModal, sx: {
        position: "absolute",
        top: 8,
        right: 16
      }, children: /* @__PURE__ */ jsx(default_1, {}) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(TextField, { label: "Bank Name", fullWidth: true, value: changedUserData.bank_name || initialUserData.bank_name || "", onChange: (e) => handleChange("bank_name", e.target.value), error: Boolean(errors.bank_name), helperText: errors.bank_name }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(TextField, { size: "small", label: "Bank Account No.", fullWidth: true, value: changedUserData.bank_account_no || initialUserData.bank_account_no || "", onChange: (e) => handleChange("bank_account_no", e.target.value), error: Boolean(errors.bank_account_no), helperText: errors.bank_account_no }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(TextField, { label: "IFSC Code", fullWidth: true, value: changedUserData.ifsc_code || initialUserData.ifsc_code || "", onChange: (e) => handleChange("ifsc_code", e.target.value), error: Boolean(errors.ifsc_code), helperText: errors.ifsc_code }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(TextField, { label: "PAN No.", fullWidth: true, value: changedUserData.pan_no || initialUserData.pan_no || "", onChange: (e) => handleChange("pan_no", e.target.value), error: Boolean(errors.pan_no), helperText: errors.pan_no }) })
      ] }) }),
      /* @__PURE__ */ jsx(DialogActions, { sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }, children: /* @__PURE__ */ jsx(LoadingButton, { disabled: !dataChanged, sx: {
        borderRadius: "50px",
        padding: "6px 16px"
      }, variant: "outlined", color: "primary", type: "submit", loading: processing, children: "Submit" }) })
    ] })
  ] });
};
const FamilyMemberForm = ({
  user,
  open,
  closeModal,
  handleDelete,
  setUser
}) => {
  const [initialUserData, setInitialUserData] = reactExports.useState({
    id: user.id,
    family_member_name: user.family_member_name || "",
    family_member_relationship: user.family_member_relationship || "",
    family_member_dob: user.family_member_dob || "",
    // Assuming date format is in string format
    family_member_phone: user.family_member_phone || ""
  });
  const [changedUserData, setChangedUserData] = reactExports.useState({
    id: user.id
  });
  const [dataChanged, setDataChanged] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const [processing, setProcessing] = reactExports.useState(false);
  const theme = useTheme();
  const handleChange = (key, value) => {
    setInitialUserData((prevUser) => {
      const updatedData = {
        ...prevUser,
        [key]: value
      };
      if (value === "") {
        delete updatedData[key];
      }
      return updatedData;
    });
    setChangedUserData((prevUser) => {
      const updatedData = {
        ...prevUser,
        [key]: value
      };
      if (value === "") {
        delete updatedData[key];
      }
      return updatedData;
    });
  };
  reactExports.useEffect(() => {
    for (const key in changedUserData) {
      if (key !== "id" && changedUserData[key] === user[key]) {
        delete changedUserData[key];
      }
    }
    const hasChanges = Object.keys(changedUserData).filter((key) => key !== "id").length > 0;
    setDataChanged(hasChanges);
  }, [initialUserData, changedUserData, user]);
  async function handleSubmit(event) {
    event.preventDefault();
    setProcessing(true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(route("profile.update"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify({
            ruleSet: "family",
            ...initialUserData
          })
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          setProcessing(false);
          closeModal();
          resolve([...data.messages]);
        } else {
          setProcessing(false);
          setErrors(data.errors);
          reject(data.error || "Failed to update family information.");
          console.error(data.errors);
        }
      } catch (error) {
        setProcessing(false);
        console.log(error);
        reject(error.message || "An unexpected error occurred.");
      }
    });
    B.promise(promise, {
      pending: {
        render() {
          return /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ jsx(CircularProgress, {}),
            /* @__PURE__ */ jsx("span", { style: {
              marginLeft: "8px"
            }, children: "Updating family member information ..." })
          ] });
        },
        icon: false,
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      success: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data.map((message, index) => /* @__PURE__ */ jsx("div", { children: message }, index)) });
        },
        icon: "🟢",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      error: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data });
        },
        icon: "🔴",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      }
    });
  }
  return /* @__PURE__ */ jsxs(GlassDialog, { open, onClose: closeModal, children: [
    /* @__PURE__ */ jsxs(DialogTitle, { style: {
      cursor: "move"
    }, id: "draggable-dialog-title", children: [
      /* @__PURE__ */ jsx(Typography, { children: "Family Member" }),
      /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: closeModal, sx: {
        position: "absolute",
        top: 8,
        right: 16
      }, children: /* @__PURE__ */ jsx(default_1, {}) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Name", fullWidth: true, value: changedUserData.family_member_name || initialUserData.family_member_name || "", onChange: (e) => handleChange("family_member_name", e.target.value), error: Boolean(errors.family_member_name), helperText: errors.family_member_name }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Relationship", fullWidth: true, value: changedUserData.family_member_relationship || initialUserData.family_member_relationship || "", onChange: (e) => handleChange("family_member_relationship", e.target.value), error: Boolean(errors.family_member_relationship), helperText: errors.family_member_relationship }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Date of Birth", fullWidth: true, type: "date", value: changedUserData.family_member_dob || initialUserData.family_member_dob || "", onChange: (e) => handleChange("family_member_dob", e.target.value), InputLabelProps: {
          shrink: true
        }, error: Boolean(errors.family_member_dob), helperText: errors.family_member_dob }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Phone", fullWidth: true, value: changedUserData.family_member_phone || initialUserData.family_member_phone || "", onChange: (e) => handleChange("family_member_phone", e.target.value), error: Boolean(errors.family_member_phone), helperText: errors.family_member_phone }) })
      ] }) }),
      /* @__PURE__ */ jsx(DialogActions, { sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }, children: /* @__PURE__ */ jsx(LoadingButton, { disabled: !dataChanged, sx: {
        borderRadius: "50px",
        padding: "6px 16px"
      }, variant: "outlined", color: "primary", type: "submit", loading: processing, children: "Submit" }) })
    ] })
  ] });
};
const EducationInformationDialog = ({
  user,
  open,
  closeModal,
  setUser
}) => {
  const [updatedUser, setUpdatedUser] = reactExports.useState({
    id: user.id
  });
  const [dataChanged, setDataChanged] = reactExports.useState(false);
  const [educationList, setEducationList] = reactExports.useState(user.educations && user.educations.length > 0 ? user.educations : [{
    institution: "",
    subject: "",
    degree: "",
    starting_date: "",
    complete_date: "",
    grade: ""
  }]);
  const [errors, setErrors] = reactExports.useState({});
  const [processing, setProcessing] = reactExports.useState(false);
  const theme = useTheme();
  const handleEducationChange = (index, field, value) => {
    console.log(value);
    const updatedList = [...educationList];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value
    };
    setEducationList(updatedList);
    const changedEducations = updatedList.filter((entry, i) => {
      const originalEntry = user.educations[i] || {};
      const hasChanged = !originalEntry.id || entry.institution !== originalEntry.institution || entry.subject !== originalEntry.subject || entry.degree !== originalEntry.degree || entry.starting_date !== originalEntry.starting_date || entry.complete_date !== originalEntry.complete_date || entry.grade !== originalEntry.grade;
      const hasReverted = originalEntry.id && entry.institution === originalEntry.institution && entry.subject === originalEntry.subject && entry.degree === originalEntry.degree && entry.starting_date === originalEntry.starting_date && entry.complete_date === originalEntry.complete_date && entry.grade === originalEntry.grade;
      return hasChanged && !hasReverted;
    });
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      educations: [...changedEducations]
    }));
    const hasChanges = changedEducations.length > 0;
    setDataChanged(hasChanges);
  };
  const handleEducationRemove = async (index) => {
    const removedEducation = educationList[index];
    const updatedList = educationList.filter((_2, i) => i !== index);
    setEducationList(updatedList.length > 0 ? updatedList : [{
      institution: "",
      subject: "",
      degree: "",
      starting_date: "",
      complete_date: "",
      grade: ""
    }]);
    if (removedEducation.id) {
      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await fetch("/education/delete", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({
              id: removedEducation.id,
              user_id: user.id
            })
          });
          const data = await response.json();
          if (response.ok) {
            setUpdatedUser((prevUser) => ({
              ...prevUser,
              educations: data.educations
            }));
            setUser((prevUser) => ({
              ...prevUser,
              educations: data.educations
            }));
            resolve(data.message || "Education record deleted successfully.");
          } else {
            setErrors(data.errors);
            console.log(data.errors);
            reject(data.error || "Failed to delete education record.");
          }
        } catch (error) {
          reject(error);
        }
      });
      B.promise(promise, {
        pending: {
          render() {
            return /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              alignItems: "center"
            }, children: [
              /* @__PURE__ */ jsx(CircularProgress, {}),
              /* @__PURE__ */ jsx("span", { style: {
                marginLeft: "8px"
              }, children: "Deleting education record ..." })
            ] });
          },
          icon: false,
          style: {
            backdropFilter: "blur(16px) saturate(200%)",
            backgroundColor: theme.glassCard.backgroundColor,
            border: theme.glassCard.border,
            color: theme.palette.text.primary
          }
        },
        success: {
          render({
            data
          }) {
            return /* @__PURE__ */ jsx(Fragment, { children: data });
          },
          icon: "🟢",
          style: {
            backdropFilter: "blur(16px) saturate(200%)",
            backgroundColor: theme.glassCard.backgroundColor,
            border: theme.glassCard.border,
            color: theme.palette.text.primary
          }
        },
        error: {
          render({
            data
          }) {
            return /* @__PURE__ */ jsx(Fragment, { children: data });
          },
          icon: "🔴",
          style: {
            backdropFilter: "blur(16px) saturate(200%)",
            backgroundColor: theme.glassCard.backgroundColor,
            border: theme.glassCard.border,
            color: theme.palette.text.primary
          }
        }
      });
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch("/education/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify({
            educations: educationList.map((entry) => ({
              ...entry,
              user_id: user.id
            }))
          })
        });
        const data = await response.json();
        if (response.ok) {
          setUser((prevUser) => ({
            ...prevUser,
            educations: data.educations
          }));
          setProcessing(false);
          closeModal();
          resolve([...data.messages]);
        } else {
          setProcessing(false);
          setErrors(data.errors);
          console.log(data.errors);
          reject(data.error || "Failed to update education records.");
        }
      } catch (error) {
        setProcessing(false);
        reject(error.message || "An unexpected error occurred while updating education records.");
      }
    });
    B.promise(promise, {
      pending: {
        render() {
          return /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ jsx(CircularProgress, {}),
            /* @__PURE__ */ jsx("span", { style: {
              marginLeft: "8px"
            }, children: "Updating education records ..." })
          ] });
        },
        icon: false,
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      success: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data.map((message, index) => /* @__PURE__ */ jsx("div", { children: message }, index)) });
        },
        icon: "🟢",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      error: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data });
        },
        icon: "🔴",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      }
    });
  };
  const handleAddMore = async () => {
    setEducationList([...educationList, {
      institution: "",
      subject: "",
      degree: "",
      starting_date: "",
      complete_date: "",
      grade: ""
    }]);
  };
  return /* @__PURE__ */ jsxs(GlassDialog, { open, onClose: closeModal, maxWidth: "md", fullWidth: true, children: [
    /* @__PURE__ */ jsxs(DialogTitle, { style: {
      cursor: "move"
    }, id: "draggable-dialog-title", children: [
      /* @__PURE__ */ jsx(Typography, { children: "Education Information" }),
      /* @__PURE__ */ jsx(IconButton, { onClick: closeModal, sx: {
        position: "absolute",
        top: 8,
        right: 16
      }, children: /* @__PURE__ */ jsx(Clear, {}) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs(Box, { children: [
        /* @__PURE__ */ jsx(Grid, { container: true, spacing: 2, children: educationList.map((education, index) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(GlassCard, { children: /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs(Typography, { variant: "h6", gutterBottom: true, children: [
            "Education #" + (index + 1),
            /* @__PURE__ */ jsx(IconButton, { onClick: () => handleEducationRemove(index), sx: {
              position: "absolute",
              top: 8,
              right: 16
            }, children: /* @__PURE__ */ jsx(Clear, {}) })
          ] }),
          /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Institution", fullWidth: true, value: education.institution || "", onChange: (e) => handleEducationChange(index, "institution", e.target.value), error: Boolean(errors[`educations.${index}.institution`]), helperText: errors[`educations.${index}.institution`] ? errors[`educations.${index}.institution`][0] : "" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Degree", fullWidth: true, value: education.degree || "", onChange: (e) => handleEducationChange(index, "degree", e.target.value), error: Boolean(errors[`educations.${index}.degree`]), helperText: errors[`educations.${index}.degree`] ? errors[`educations.${index}.degree`][0] : "" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Subject", fullWidth: true, value: education.subject || "", onChange: (e) => handleEducationChange(index, "subject", e.target.value), error: Boolean(errors[`educations.${index}.subject`]), helperText: errors[`educations.${index}.subject`] ? errors[`educations.${index}.subject`][0] : "" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Started in", type: "month", fullWidth: true, InputLabelProps: {
              shrink: true
            }, value: education.starting_date || "", onChange: (e) => handleEducationChange(index, "starting_date", e.target.value), error: Boolean(errors[`educations.${index}.starting_date`]), helperText: errors[`educations.${index}.starting_date`] ? errors[`educations.${index}.starting_date`][0] : "" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Completed in", type: "month", fullWidth: true, InputLabelProps: {
              shrink: true
            }, value: education.complete_date || "", onChange: (e) => handleEducationChange(index, "complete_date", e.target.value), error: Boolean(errors[`educations.${index}.complete_date`]), helperText: errors[`educations.${index}.complete_date`] ? errors[`educations.${index}.complete_date`][0] : "" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Grade", fullWidth: true, value: education.grade || "", onChange: (e) => handleEducationChange(index, "grade", e.target.value), error: Boolean(errors[`educations.${index}.grade`]), helperText: errors[`educations.${index}.grade`] ? errors[`educations.${index}.grade`][0] : "" }) })
          ] })
        ] }) }) }, index)) }),
        /* @__PURE__ */ jsx(Box, { mt: 2, children: /* @__PURE__ */ jsxs(Button, { size: "small", color: "error", sx: {
          mt: 2
        }, onClick: handleAddMore, children: [
          /* @__PURE__ */ jsx(Add, {}),
          " Add More"
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx(DialogActions, { sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }, children: /* @__PURE__ */ jsx(LoadingButton, { disabled: !dataChanged, sx: {
        borderRadius: "50px",
        padding: "6px 16px"
      }, size: "large", variant: "outlined", color: "primary", type: "submit", loading: processing, children: "Submit" }) })
    ] })
  ] });
};
const ExperienceInformationForm = ({
  user,
  open,
  closeModal,
  setUser
}) => {
  const [updatedUser, setUpdatedUser] = reactExports.useState({
    id: user.id
  });
  const [dataChanged, setDataChanged] = reactExports.useState(false);
  const [experienceList, setExperienceList] = reactExports.useState(user.experiences.length > 0 ? user.experiences : [{
    company_name: "",
    location: "",
    job_position: "",
    period_from: "",
    period_to: "",
    description: ""
  }]);
  const [errors, setErrors] = reactExports.useState({});
  const [processing, setProcessing] = reactExports.useState(false);
  const theme = useTheme();
  const handleExperienceChange = (index, field, value) => {
    const updatedList = [...experienceList];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value
    };
    setExperienceList(updatedList);
    const changedExperiences = updatedList.filter((entry, i) => {
      const originalEntry = user.experiences[i] || {};
      const hasChanged = !originalEntry.id || entry.company_name !== originalEntry.company_name || entry.location !== originalEntry.location || entry.job_position !== originalEntry.job_position || entry.period_from !== originalEntry.period_from || entry.period_to !== originalEntry.period_to || entry.description !== originalEntry.description;
      const hasReverted = originalEntry.id && entry.company_name === originalEntry.company_name && entry.location === originalEntry.location && entry.job_position === originalEntry.job_position && entry.period_from === originalEntry.period_from && entry.period_to === originalEntry.period_to && entry.description === originalEntry.description;
      return hasChanged && !hasReverted;
    });
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      experiences: [...changedExperiences]
    }));
    const hasChanges = changedExperiences.length > 0;
    setDataChanged(hasChanges);
  };
  const handleExperienceRemove = async (index) => {
    const removedExperience = experienceList[index];
    const updatedList = experienceList.filter((_2, i) => i !== index);
    setExperienceList(updatedList.length > 0 ? updatedList : [{
      company_name: "",
      location: "",
      job_position: "",
      period_from: "",
      period_to: "",
      description: ""
    }]);
    if (removedExperience.id) {
      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await fetch("/experience/delete", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({
              id: removedExperience.id,
              user_id: user.id
            })
          });
          const data = await response.json();
          if (response.ok) {
            setUpdatedUser((prevUser) => ({
              ...prevUser,
              experiences: data.experiences
            }));
            setUser((prevUser) => ({
              ...prevUser,
              experiences: data.experiences
            }));
            resolve(data.message || "Experience record deleted successfully.");
          } else {
            setErrors([...data.errors]);
            reject(data.error || "Failed to delete experience record.");
          }
        } catch (error) {
          reject(error);
        }
      });
      B.promise(promise, {
        pending: {
          render() {
            return /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              alignItems: "center"
            }, children: [
              /* @__PURE__ */ jsx(CircularProgress, {}),
              /* @__PURE__ */ jsx("span", { style: {
                marginLeft: "8px"
              }, children: "Deleting experience record ..." })
            ] });
          },
          icon: false,
          style: {
            backdropFilter: "blur(16px) saturate(200%)",
            backgroundColor: theme.glassCard.backgroundColor,
            border: theme.glassCard.border,
            color: theme.palette.text.primary
          }
        },
        success: {
          render({
            data
          }) {
            return /* @__PURE__ */ jsx(Fragment, { children: data });
          },
          icon: "🟢",
          style: {
            backdropFilter: "blur(16px) saturate(200%)",
            backgroundColor: theme.glassCard.backgroundColor,
            border: theme.glassCard.border,
            color: theme.palette.text.primary
          }
        },
        error: {
          render({
            data
          }) {
            return /* @__PURE__ */ jsx(Fragment, { children: data });
          },
          icon: "🔴",
          style: {
            backdropFilter: "blur(16px) saturate(200%)",
            backgroundColor: theme.glassCard.backgroundColor,
            border: theme.glassCard.border,
            color: theme.palette.text.primary
          }
        }
      });
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch("/experience/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify({
            experiences: experienceList.map((entry) => ({
              ...entry,
              user_id: user.id
            }))
          })
        });
        const data = await response.json();
        if (response.ok) {
          setUser((prevUser) => ({
            ...prevUser,
            experiences: data.experiences
          }));
          setProcessing(false);
          closeModal();
          resolve([...data.messages]);
        } else {
          setProcessing(false);
          setErrors(data.errors);
          console.log(data.errors);
          reject(data.error || "Failed to update experience records.");
        }
      } catch (error) {
        setProcessing(false);
        reject(error.message || "An unexpected error occurred while updating experience records.");
      }
    });
    B.promise(promise, {
      pending: {
        render() {
          return /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ jsx(CircularProgress, {}),
            /* @__PURE__ */ jsx("span", { style: {
              marginLeft: "8px"
            }, children: "Updating experience records ..." })
          ] });
        },
        icon: false,
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      success: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data.map((message, index) => /* @__PURE__ */ jsx("div", { children: message }, index)) });
        },
        icon: "🟢",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      error: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data });
        },
        icon: "🔴",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      }
    });
  };
  const handleAddMore = async () => {
    setExperienceList([...experienceList, {
      company: "",
      role: "",
      start_date: "",
      end_date: "",
      responsibilities: ""
    }]);
  };
  return /* @__PURE__ */ jsxs(GlassDialog, { open, onClose: closeModal, maxWidth: "md", fullWidth: true, children: [
    /* @__PURE__ */ jsxs(DialogTitle, { style: {
      cursor: "move"
    }, id: "draggable-dialog-title", children: [
      /* @__PURE__ */ jsx(Typography, { children: "Experience Information" }),
      /* @__PURE__ */ jsx(IconButton, { onClick: closeModal, sx: {
        position: "absolute",
        top: 8,
        right: 16
      }, children: /* @__PURE__ */ jsx(Clear, {}) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs(Box, { children: [
        /* @__PURE__ */ jsx(Grid, { container: true, spacing: 2, children: experienceList.map((experience, index) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(GlassCard, { children: /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs(Typography, { variant: "h6", gutterBottom: true, children: [
            "Experience #" + (index + 1),
            /* @__PURE__ */ jsx(IconButton, { onClick: () => handleExperienceRemove(index), sx: {
              position: "absolute",
              top: 8,
              right: 16
            }, children: /* @__PURE__ */ jsx(Clear, {}) })
          ] }),
          /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Company", fullWidth: true, value: experience.company_name || "", onChange: (e) => handleExperienceChange(index, "company_name", e.target.value), error: Boolean(errors[`experiences.${index}.company_name`]), helperText: errors[`experiences.${index}.company_name`] ? errors[`experiences.${index}.company_name`][0] : "" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Location", fullWidth: true, value: experience.location || "", onChange: (e) => handleExperienceChange(index, "location", e.target.value), error: Boolean(errors[`experiences.${index}.location`]), helperText: errors[`experiences.${index}.location`] ? errors[`experiences.${index}.location`][0] : "" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Role", fullWidth: true, value: experience.job_position || "", onChange: (e) => handleExperienceChange(index, "job_position", e.target.value), error: Boolean(errors[`experiences.${index}.job_position`]), helperText: errors[`experiences.${index}.job_position`] ? errors[`experiences.${index}.job_position`][0] : "" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Started From", type: "date", fullWidth: true, InputLabelProps: {
              shrink: true
            }, value: experience.period_from || "", onChange: (e) => handleExperienceChange(index, "period_from", e.target.value), error: Boolean(errors[`experiences.${index}.period_from`]), helperText: errors[`experiences.${index}.period_from`] ? errors[`experiences.${index}.period_from`][0] : "" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsx(TextField, { label: "Ended On", type: "date", fullWidth: true, InputLabelProps: {
              shrink: true
            }, value: experience.period_to || "", onChange: (e) => handleExperienceChange(index, "period_to", e.target.value), error: Boolean(errors[`experiences.${index}.period_to`]), helperText: errors[`experiences.${index}.period_to`] ? errors[`experiences.${index}.period_to`][0] : "" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(TextField, { label: "Responsibilities", fullWidth: true, multiline: true, rows: 3, value: experience.description || "", onChange: (e) => handleExperienceChange(index, "description", e.target.value), error: Boolean(errors[`experiences.${index}.description`]), helperText: errors[`experiences.${index}.description`] ? errors[`experiences.${index}.description`][0] : "" }) })
          ] })
        ] }) }) }, index)) }),
        /* @__PURE__ */ jsxs(Button, { size: "small", color: "error", sx: {
          mt: 2
        }, onClick: handleAddMore, children: [
          /* @__PURE__ */ jsx(Add, {}),
          " Add More"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(DialogActions, { sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }, children: /* @__PURE__ */ jsx(LoadingButton, { disabled: !dataChanged, sx: {
        borderRadius: "50px",
        padding: "6px 16px"
      }, size: "large", variant: "outlined", color: "primary", type: "submit", loading: processing, children: "Submit" }) })
    ] })
  ] });
};
const SalaryInformationForm = ({
  user,
  setUser
}) => {
  const [initialUserData, setInitialUserData] = reactExports.useState({
    id: user.id,
    // New fields
    salary_basis: user.salary_basis || "",
    // Required string
    salary_amount: user.salary_amount || "",
    // Required numeric, default to 0
    payment_type: user.payment_type || "",
    // Required string
    pf_contribution: user.pf_contribution ?? false,
    // Nullable boolean, default to false
    pf_no: user.pf_no || "",
    // Nullable string
    employee_pf_rate: user.employee_pf_rate || 0,
    // Nullable string
    additional_pf_rate: user.additional_pf_rate || 0,
    // Nullable string
    total_pf_rate: user.total_pf_rate || 0,
    // Nullable string
    esi_contribution: user.esi_contribution ?? false,
    // Nullable boolean, default to false
    esi_no: user.esi_no || "",
    // Nullable string
    employee_esi_rate: user.employee_esi_rate || 0,
    // Nullable string
    additional_esi_rate: user.additional_esi_rate || 0,
    // Nullable string
    total_esi_rate: user.total_esi_rate || 0
    // Nullable string
  });
  const [changedUserData, setChangedUserData] = reactExports.useState({
    id: user.id
  });
  const [dataChanged, setDataChanged] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const [processing, setProcessing] = reactExports.useState(false);
  const theme = useTheme();
  const handleChange = (key, value) => {
    setInitialUserData((prevUser) => {
      const updatedData = {
        ...prevUser,
        [key]: value
      };
      if (value === "") {
        delete updatedData[key];
      }
      if (key === "pf_contribution" && value === 0) {
        updatedData["pf_no"] = "";
        updatedData["employee_pf_rate"] = 0;
        updatedData["additional_pf_rate"] = 0;
        updatedData["total_pf_rate"] = 0;
      } else if (key === "employee_pf_rate" || key === "additional_pf_rate") {
        updatedData["total_pf_rate"] = updatedData["employee_pf_rate"] + updatedData["additional_pf_rate"];
      }
      if (key === "esi_contribution" && value === 0) {
        updatedData["esi_no"] = "";
        updatedData["employee_esi_rate"] = 0;
        updatedData["additional_esi_rate"] = 0;
        updatedData["total_esi_rate"] = 0;
      } else if (key === "employee_esi_rate" || key === "additional_esi_rate") {
        updatedData["total_esi_rate"] = updatedData["employee_esi_rate"] + updatedData["additional_esi_rate"];
      }
      return updatedData;
    });
    setChangedUserData((prevUser) => {
      const updatedData = {
        ...prevUser,
        [key]: value
      };
      if (value === "") {
        delete updatedData[key];
      }
      if (key === "pf_contribution" && value === 0) {
        updatedData["pf_no"] = "";
        updatedData["employee_pf_rate"] = 0;
        updatedData["additional_pf_rate"] = 0;
        updatedData["total_pf_rate"] = 0;
      } else if (key === "employee_pf_rate" || key === "additional_pf_rate") {
        updatedData["total_pf_rate"] = updatedData["employee_pf_rate"] + updatedData["additional_pf_rate"];
      }
      if (key === "esi_contribution" && value === 0) {
        updatedData["esi_no"] = "";
        updatedData["employee_esi_rate"] = 0;
        updatedData["additional_esi_rate"] = 0;
        updatedData["total_esi_rate"] = 0;
      } else if (key === "employee_esi_rate" || key === "additional_esi_rate") {
        updatedData["total_esi_rate"] = updatedData["employee_esi_rate"] + updatedData["additional_esi_rate"];
      }
      return updatedData;
    });
  };
  reactExports.useEffect(() => {
    for (const key in changedUserData) {
      if (key !== "id" && changedUserData[key] === user[key]) {
        delete changedUserData[key];
      }
    }
    const hasChanges = Object.keys(changedUserData).filter((key) => key !== "id").length > 0;
    setDataChanged(hasChanges);
    console.log(initialUserData);
    console.log(changedUserData);
  }, [initialUserData, changedUserData, user]);
  async function handleSubmit(event) {
    event.preventDefault();
    setProcessing(true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(route("profile.update"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify({
            ruleSet: "salary",
            ...initialUserData
          })
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          setProcessing(false);
          resolve([...data.messages]);
        } else {
          setProcessing(false);
          setErrors(data.errors);
          reject(data.error || "Failed to update salary information.");
          console.error(data.errors);
        }
      } catch (error) {
        setProcessing(false);
        console.log(error);
        reject(error.message || "An unexpected error occurred.");
      }
    });
    B.promise(promise, {
      pending: {
        render() {
          return /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ jsx(CircularProgress, {}),
            /* @__PURE__ */ jsx("span", { style: {
              marginLeft: "8px"
            }, children: "Updating salary information ..." })
          ] });
        },
        icon: false,
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      success: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data.map((message, index) => /* @__PURE__ */ jsx("div", { children: message }, index)) });
        },
        icon: "🟢",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      },
      error: {
        render({
          data
        }) {
          return /* @__PURE__ */ jsx(Fragment, { children: data });
        },
        icon: "🔴",
        style: {
          backdropFilter: "blur(16px) saturate(200%)",
          backgroundColor: theme.glassCard.backgroundColor,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      }
    });
  }
  return /* @__PURE__ */ jsxs(GlassCard, { children: [
    /* @__PURE__ */ jsx(CardHeader, { title: "Salary & Statutory Information" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx(Typography, { sx: {
          fontWeight: "bold",
          m: 2
        }, children: "Salary Information" }),
        /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 3, children: [
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsx(InputLabel, { id: "salary-basis-label", children: "Salary basis" }),
            /* @__PURE__ */ jsxs(Select, { labelId: "salary-basis-label", value: changedUserData.salary_basis || initialUserData.salary_basis || "na", onChange: (e) => handleChange("salary_basis", e.target.value), error: Boolean(errors.salary_basis), helperText: errors.salary_basis, label: "Salary basis", MenuProps: {
              PaperProps: {
                sx: {
                  backdropFilter: "blur(16px) saturate(200%)",
                  backgroundColor: theme.glassCard.backgroundColor,
                  border: theme.glassCard.border,
                  borderRadius: 2,
                  boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
                }
              }
            }, children: [
              /* @__PURE__ */ jsx(MenuItem, { value: "na", disabled: true, children: "Select salary basis type" }),
              /* @__PURE__ */ jsx(MenuItem, { value: "Hourly", children: "Hourly" }),
              /* @__PURE__ */ jsx(MenuItem, { value: "Daily", children: "Daily" }),
              /* @__PURE__ */ jsx(MenuItem, { value: "Weekly", children: "Weekly" }),
              /* @__PURE__ */ jsx(MenuItem, { value: "Monthly", children: "Monthly" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(TextField, { label: "Salary amount", type: "number", fullWidth: true, placeholder: "Type your salary amount", value: changedUserData.salary_amount || initialUserData.salary_amount || "", onChange: (e) => handleChange("salary_amount", e.target.value), InputProps: {
            startAdornment: /* @__PURE__ */ jsx(InputAdornment, { position: "start", children: "$" })
          }, error: Boolean(errors.salary_amount), helperText: errors.salary_amount }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsx(InputLabel, { id: "payment-type-label", children: "Payment type" }),
            /* @__PURE__ */ jsxs(Select, { labelId: "payment-type-label", label: "Payment type", id: `gender-select-${user.id}`, value: changedUserData.payment_type || initialUserData.payment_type || "na", onChange: (e) => handleChange("payment_type", e.target.value), error: Boolean(errors.payment_type), helperText: errors.payment_type, MenuProps: {
              PaperProps: {
                sx: {
                  backdropFilter: "blur(16px) saturate(200%)",
                  backgroundColor: theme.glassCard.backgroundColor,
                  border: theme.glassCard.border,
                  borderRadius: 2,
                  boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
                }
              }
            }, children: [
              /* @__PURE__ */ jsx(MenuItem, { value: "na", disabled: true, children: "Select payment type" }),
              /* @__PURE__ */ jsx(MenuItem, { value: "Bank transfer", children: "Bank transfer" }),
              /* @__PURE__ */ jsx(MenuItem, { value: "Check", children: "Check" }),
              /* @__PURE__ */ jsx(MenuItem, { value: "Cash", children: "Cash" })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(Divider, { sx: {
          my: 3
        } }),
        /* @__PURE__ */ jsx(Typography, { sx: {
          fontWeight: "bold",
          m: 2
        }, children: "PF Information" }),
        /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 3, children: [
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsx(InputLabel, { id: "pf-contribution-label", children: "PF contribution" }),
            /* @__PURE__ */ jsxs(Select, { labelId: "pf-contribution-label", label: "PF contribution", id: `gender-select-${user.id}`, value: changedUserData.pf_contribution !== void 0 ? changedUserData.pf_contribution : initialUserData.pf_contribution !== void 0 ? initialUserData.pf_contribution : "na", onChange: (e) => handleChange("pf_contribution", e.target.value), error: Boolean(errors.pf_contribution), helperText: errors.pf_contribution, MenuProps: {
              PaperProps: {
                sx: {
                  backdropFilter: "blur(16px) saturate(200%)",
                  backgroundColor: theme.glassCard.backgroundColor,
                  border: theme.glassCard.border,
                  borderRadius: 2,
                  boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
                }
              }
            }, children: [
              /* @__PURE__ */ jsx(MenuItem, { value: "na", disabled: true, children: "Select PF contribution" }),
              /* @__PURE__ */ jsx(MenuItem, { value: 1, children: "Yes" }),
              /* @__PURE__ */ jsx(MenuItem, { value: 0, children: "No" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(TextField, { disabled: !Boolean(changedUserData.pf_contribution || initialUserData.pf_contribution), InputLabelProps: {
            shrink: true
          }, label: "PF No.", fullWidth: true, type: "text", placeholder: "Enter PF No.", value: changedUserData.pf_no || initialUserData.pf_no, onChange: (e) => handleChange("pf_no", e.target.value), error: Boolean(errors.pf_no), helperText: errors.pf_no }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsx(InputLabel, { id: "employee-pf-rate-label", children: "Employee PF rate" }),
            /* @__PURE__ */ jsxs(Select, { disabled: !Boolean(changedUserData.pf_contribution || initialUserData.pf_contribution), labelId: "employee-pf-rate-label", label: "Employee PF rate", value: changedUserData.employee_pf_rate || initialUserData.employee_pf_rate || "na", onChange: (e) => handleChange("employee_pf_rate", e.target.value), error: Boolean(errors.employee_pf_rate), helperText: errors.employee_pf_rate, MenuProps: {
              PaperProps: {
                sx: {
                  backdropFilter: "blur(16px) saturate(200%)",
                  backgroundColor: theme.glassCard.backgroundColor,
                  border: theme.glassCard.border,
                  borderRadius: 2,
                  boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
                }
              }
            }, children: [
              /* @__PURE__ */ jsx(MenuItem, { value: "na", disabled: true, children: "Select pf rate" }),
              [...Array(11).keys()].map((value) => /* @__PURE__ */ jsxs(MenuItem, { value, children: [
                value,
                "%"
              ] }, value))
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsx(InputLabel, { id: "additional-rate-label", children: "Additional rate" }),
            /* @__PURE__ */ jsxs(Select, { disabled: !Boolean(changedUserData.pf_contribution || initialUserData.pf_contribution), labelId: "additional-rate-label", label: "Additional rate", id: `gender-select-${user.id}`, value: changedUserData.additional_pf_rate || initialUserData.additional_pf_rate || "na", onChange: (e) => handleChange("additional_pf_rate", e.target.value), error: Boolean(errors.additional_pf_rate), helperText: errors.additional_pf_rate, MenuProps: {
              PaperProps: {
                sx: {
                  backdropFilter: "blur(16px) saturate(200%)",
                  backgroundColor: theme.glassCard.backgroundColor,
                  border: theme.glassCard.border,
                  borderRadius: 2,
                  boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
                }
              }
            }, children: [
              /* @__PURE__ */ jsx(MenuItem, { value: "na", disabled: true, children: "Select additional rate" }),
              [...Array(11).keys()].map((value) => /* @__PURE__ */ jsxs(MenuItem, { value, children: [
                value,
                "%"
              ] }, value))
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(TextField, { disabled: !Boolean(changedUserData.pf_contribution || initialUserData.pf_contribution), InputLabelProps: {
            shrink: true
          }, fullWidth: true, label: "Total rate", placeholder: "N/A", value: changedUserData.total_pf_rate || initialUserData.total_pf_rate ? `${changedUserData.total_pf_rate || initialUserData.total_pf_rate}%` : "", InputProps: {
            readOnly: true
          }, error: Boolean(errors.total_pf_rate), helperText: errors.total_pf_rate }) })
        ] }),
        /* @__PURE__ */ jsx(Divider, { sx: {
          my: 3
        } }),
        /* @__PURE__ */ jsx(Typography, { sx: {
          fontWeight: "bold",
          m: 2
        }, children: "ESI Information" }),
        /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 3, children: [
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsx(InputLabel, { id: "esi-contribution-label", children: "ESI contribution" }),
            /* @__PURE__ */ jsxs(Select, { labelId: "esi-contribution-label", label: "ESI contribution", value: changedUserData.esi_contribution !== void 0 ? changedUserData.esi_contribution : initialUserData.esi_contribution !== void 0 ? initialUserData.esi_contribution : "na", onChange: (e) => handleChange("esi_contribution", e.target.value), error: Boolean(errors.esi_contribution), helperText: errors.esi_contribution, MenuProps: {
              PaperProps: {
                sx: {
                  backdropFilter: "blur(16px) saturate(200%)",
                  backgroundColor: theme.glassCard.backgroundColor,
                  border: theme.glassCard.border,
                  borderRadius: 2,
                  boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
                }
              }
            }, children: [
              /* @__PURE__ */ jsx(MenuItem, { value: "na", disabled: true, children: "Select ESI contribution" }),
              /* @__PURE__ */ jsx(MenuItem, { value: 1, children: "Yes" }),
              /* @__PURE__ */ jsx(MenuItem, { value: 0, children: "No" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(TextField, { disabled: !Boolean(changedUserData.esi_contribution || initialUserData.esi_contribution), InputLabelProps: {
            shrink: true
          }, label: "ESI No.", fullWidth: true, type: "text", placeholder: "Enter ESI No.", value: changedUserData.esi_no || initialUserData.esi_no, onChange: (e) => handleChange("esi_no", e.target.value), error: Boolean(errors.esi_no), helperText: errors.esi_no }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsx(InputLabel, { id: "esi-contribution-label", children: "Employee ESI rate" }),
            /* @__PURE__ */ jsxs(Select, { disabled: !Boolean(changedUserData.esi_contribution || initialUserData.esi_contribution), labelId: "esi-contribution-label", label: "ESI contribution", value: changedUserData.employee_esi_rate || initialUserData.employee_esi_rate || "na", onChange: (e) => handleChange("employee_esi_rate", e.target.value), error: Boolean(errors.employee_esi_rate), helperText: errors.employee_esi_rate, MenuProps: {
              PaperProps: {
                sx: {
                  backdropFilter: "blur(16px) saturate(200%)",
                  backgroundColor: theme.glassCard.backgroundColor,
                  border: theme.glassCard.border,
                  borderRadius: 2,
                  boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
                }
              }
            }, children: [
              /* @__PURE__ */ jsx(MenuItem, { value: "na", disabled: true, children: "Select esi rate" }),
              [...Array(11).keys()].map((value) => /* @__PURE__ */ jsxs(MenuItem, { value, children: [
                value,
                "%"
              ] }, value))
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsx(InputLabel, { id: "esi-contribution-label", children: "Additional rate" }),
            /* @__PURE__ */ jsxs(Select, { disabled: !Boolean(changedUserData.esi_contribution || initialUserData.esi_contribution), labelId: "esi-contribution-label", label: "ESI contribution", value: changedUserData.additional_esi_rate || initialUserData.additional_esi_rate || "na", onChange: (e) => handleChange("additional_esi_rate", e.target.value), error: Boolean(errors.additional_esi_rate), helperText: errors.additional_esi_rate, MenuProps: {
              PaperProps: {
                sx: {
                  backdropFilter: "blur(16px) saturate(200%)",
                  backgroundColor: theme.glassCard.backgroundColor,
                  border: theme.glassCard.border,
                  borderRadius: 2,
                  boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"
                }
              }
            }, children: [
              /* @__PURE__ */ jsx(MenuItem, { value: "na", disabled: true, children: "Select additional rate" }),
              [...Array(11).keys()].map((value) => /* @__PURE__ */ jsxs(MenuItem, { value, children: [
                value,
                "%"
              ] }, value))
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(TextField, { disabled: !Boolean(changedUserData.esi_contribution || initialUserData.esi_contribution), InputLabelProps: {
            shrink: true
          }, fullWidth: true, label: "Total rate", placeholder: "N/A", value: changedUserData.total_esi_rate || initialUserData.total_esi_rate ? `${changedUserData.total_esi_rate || initialUserData.total_esi_rate}%` : "", InputProps: {
            readOnly: true
          }, error: Boolean(errors.total_esi_rate), helperText: errors.total_esi_rate }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardActions, { sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }, children: /* @__PURE__ */ jsx(LoadingButton, { disabled: !dataChanged, sx: {
        borderRadius: "50px",
        padding: "6px 16px"
      }, variant: "outlined", color: "primary", type: "submit", loading: processing, children: "Submit" }) })
    ] })
  ] });
};
const BankInformationForm = ({
  project
}) => {
  const theme = useTheme();
  return /* @__PURE__ */ jsx(GlassCard, { children: /* @__PURE__ */ jsxs(Box, { sx: {
    p: 2
  }, children: [
    /* @__PURE__ */ jsx(Typography, { variant: "h6", gutterBottom: true, children: /* @__PURE__ */ jsx(ae, { style: {
      display: "flex",
      alignItems: "center",
      color: theme.palette.text.primary,
      textDecoration: "none"
    }, href: "/", as: "a", children: project.title }) }),
    /* @__PURE__ */ jsxs(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: [
      /* @__PURE__ */ jsx("b", { children: project.openTasks }),
      " open tasks, ",
      /* @__PURE__ */ jsx("b", { children: project.completedTasks }),
      " tasks completed"
    ] }),
    /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: project.description }),
    /* @__PURE__ */ jsxs(Box, { mb: 2, children: [
      /* @__PURE__ */ jsx(Typography, { variant: "subtitle2", color: "textPrimary", children: "Deadline:" }),
      /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "textSecondary", children: project.deadline })
    ] }),
    /* @__PURE__ */ jsxs(Box, { mb: 2, children: [
      /* @__PURE__ */ jsx(Typography, { variant: "subtitle2", color: "textPrimary", children: "Project Leaders:" }),
      /* @__PURE__ */ jsx(Box, { display: "flex", children: /* @__PURE__ */ jsx(AvatarGroup, { max: 4, total: 5, children: project.leaders.map((leader, index) => /* @__PURE__ */ jsx(Tooltip, { title: leader.name, arrow: true, children: /* @__PURE__ */ jsx(Avatar, { src: leader.avatar, alt: leader.name }) }, index)) }) })
    ] }),
    /* @__PURE__ */ jsxs(Box, { mb: 2, children: [
      /* @__PURE__ */ jsx(Typography, { variant: "subtitle2", color: "textPrimary", children: "Project Members:" }),
      /* @__PURE__ */ jsx(Box, { display: "flex", children: /* @__PURE__ */ jsx(AvatarGroup, { max: 4, total: 24, children: project.team.map((member, index) => /* @__PURE__ */ jsx(Tooltip, { title: member.name, arrow: true, children: /* @__PURE__ */ jsx(Avatar, { src: member.avatar, alt: member.name }) }, index)) }) })
    ] }),
    /* @__PURE__ */ jsxs(Typography, { variant: "body2", gutterBottom: true, children: [
      "Progress ",
      /* @__PURE__ */ jsxs("span", { style: {
        float: "right"
      }, children: [
        project.progress,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsx(LinearProgress, { variant: "determinate", value: project.progress })
  ] }) });
};
const projects = [
  {
    title: "Office Management",
    openTasks: 1,
    completedTasks: 9,
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    deadline: "17 Apr 2019",
    leaders: [{
      name: "John Doe",
      avatar: "assets/img/profiles/avatar-02.jpg"
    }, {
      name: "Richard Miles",
      avatar: "assets/img/profiles/avatar-09.jpg"
    }, {
      name: "John Smith",
      avatar: "assets/img/profiles/avatar-10.jpg"
    }, {
      name: "Mike Litorus",
      avatar: "assets/img/profiles/avatar-05.jpg"
    }],
    team: [{
      name: "John Doe",
      avatar: "assets/img/profiles/avatar-02.jpg"
    }, {
      name: "Richard Miles",
      avatar: "assets/img/profiles/avatar-09.jpg"
    }, {
      name: "John Smith",
      avatar: "assets/img/profiles/avatar-10.jpg"
    }, {
      name: "Mike Litorus",
      avatar: "assets/img/profiles/avatar-05.jpg"
    }],
    progress: 40
  },
  {
    title: "Office Management",
    openTasks: 1,
    completedTasks: 9,
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    deadline: "17 Apr 2019",
    leaders: [{
      name: "John Doe",
      avatar: "assets/img/profiles/avatar-02.jpg"
    }, {
      name: "Richard Miles",
      avatar: "assets/img/profiles/avatar-09.jpg"
    }, {
      name: "John Smith",
      avatar: "assets/img/profiles/avatar-10.jpg"
    }, {
      name: "Mike Litorus",
      avatar: "assets/img/profiles/avatar-05.jpg"
    }],
    team: [{
      name: "John Doe",
      avatar: "assets/img/profiles/avatar-02.jpg"
    }, {
      name: "Richard Miles",
      avatar: "assets/img/profiles/avatar-09.jpg"
    }, {
      name: "John Smith",
      avatar: "assets/img/profiles/avatar-10.jpg"
    }, {
      name: "Mike Litorus",
      avatar: "assets/img/profiles/avatar-05.jpg"
    }],
    progress: 40
  }
  // Add other projects similarly...
];
const UserProfile = ({
  title,
  allUsers,
  report_to,
  departments,
  designations
}) => {
  var _a, _b, _c, _d;
  const [user, setUser] = reactExports.useState(q().props.user);
  const [tabIndex, setTabIndex] = React.useState(0);
  React.useState(null);
  const [openModalType, setOpenModalType] = reactExports.useState(null);
  const [selectedImage, setSelectedImage] = reactExports.useState(null);
  console.log(user);
  const openModal = (modalType) => {
    setOpenModalType(modalType);
  };
  const closeModal = () => {
    setOpenModalType(null);
  };
  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };
  return /* @__PURE__ */ jsxs(App, { children: [
    /* @__PURE__ */ jsx(Y, { title: user.name }),
    openModalType === "profile" && /* @__PURE__ */ jsx(ProfileForm, { user, allUsers, departments, designations, open: openModalType === "profile", setUser, closeModal, handleImageChange, selectedImage }),
    openModalType === "personal" && /* @__PURE__ */ jsx(PersonalInformationForm, { user, open: openModalType === "personal", setUser, closeModal }),
    openModalType === "emergency" && /* @__PURE__ */ jsx(EmergencyContactForm, { user, open: openModalType === "emergency", setUser, closeModal }),
    openModalType === "bank" && /* @__PURE__ */ jsx(BankInformationForm$1, { user, open: openModalType === "bank", setUser, closeModal }),
    openModalType === "family" && /* @__PURE__ */ jsx(FamilyMemberForm, { user, open: openModalType === "family", setUser, closeModal }),
    openModalType === "education" && /* @__PURE__ */ jsx(EducationInformationDialog, { user, open: openModalType === "education", setUser, closeModal }),
    openModalType === "experience" && /* @__PURE__ */ jsx(ExperienceInformationForm, { user, open: openModalType === "experience", setUser, closeModal }),
    /* @__PURE__ */ jsx(Box, { sx: {
      display: "flex",
      justifyContent: "center",
      p: 2
    }, children: /* @__PURE__ */ jsx(Grow, { in: true, children: /* @__PURE__ */ jsxs(GlassCard, { children: [
      /* @__PURE__ */ jsx(CardHeader, { sx: {
        padding: "24px"
      }, action: /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: () => openModal("profile"), sx: {
        position: "absolute",
        top: 16,
        right: 16
      }, children: /* @__PURE__ */ jsx(default_1$1, {}) }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, direction: "row", alignItems: "flex-start", children: [
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 5, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, direction: {
          xs: "column",
          md: "row"
        }, alignItems: {
          xs: "center",
          md: "flex-start"
        }, children: [
          /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(Box, { sx: {
            display: "flex",
            alignItems: "center",
            mb: 2
          }, children: /* @__PURE__ */ jsx(Avatar, { src: `assets/images/users/${user.user_name}.jpg`, alt: user.name, sx: {
            width: 100,
            height: 100,
            mr: 2
          } }) }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: true, children: /* @__PURE__ */ jsxs(Box, { direction: {
            xs: "column",
            md: "row"
          }, alignItems: {
            xs: "center",
            md: "flex-start"
          }, sx: {
            display: "flex",
            flexDirection: "column",
            mb: 2
          }, children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h5", children: user.name }),
            /* @__PURE__ */ jsx(Typography, { variant: "subtitle1", color: "textSecondary", children: ((_a = departments.find((department) => department.id === user.department)) == null ? void 0 : _a.name) || "N/A" }),
            /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "textSecondary", children: ((_b = designations.find((designation) => designation.id === user.designation)) == null ? void 0 : _b.title) || "N/A" }),
            /* @__PURE__ */ jsxs(Typography, { variant: "body2", color: "textSecondary", children: [
              "Employee ID : ",
              user.employee_id || "N/A"
            ] }),
            /* @__PURE__ */ jsxs(Typography, { variant: "body2", color: "textSecondary", children: [
              "Date of Join : ",
              user.date_of_joining || "N/A"
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "outlined", color: "primary", sx: {
              mt: 1
            }, children: "Send Message" })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(Divider, { orientation: "vertical", flexItem: true, sx: {
          mx: 2
        } }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(List, { children: [
          /* @__PURE__ */ jsx(ListItem, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "Phone:" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.phone || "N/A" }) })
          ] }) }),
          /* @__PURE__ */ jsx(ListItem, { children: /* @__PURE__ */ jsxs(Grid, { container: true, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "Email:" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.email || "N/A" }) })
          ] }) }),
          /* @__PURE__ */ jsx(ListItem, { children: /* @__PURE__ */ jsxs(Grid, { container: true, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "Birthday:" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.birthday || "N/A" }) })
          ] }) }),
          /* @__PURE__ */ jsx(ListItem, { children: /* @__PURE__ */ jsxs(Grid, { container: true, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "Address:" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.address || "N/A" }) })
          ] }) }),
          /* @__PURE__ */ jsx(ListItem, { children: /* @__PURE__ */ jsxs(Grid, { container: true, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "Gender:" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.gender || "N/A" }) })
          ] }) }),
          /* @__PURE__ */ jsx(ListItem, { children: /* @__PURE__ */ jsxs(Grid, { container: true, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "Reports to:" }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: allUsers.find((found) => found.id === user.report_to) ? /* @__PURE__ */ jsxs(Box, { sx: {
              display: "flex",
              alignItems: "center"
            }, children: [
              /* @__PURE__ */ jsx(Avatar, { src: `/assets/images/users/${(_c = allUsers.find((found) => found.id === user.report_to)) == null ? void 0 : _c.user_name}.jpg`, alt: report_to.name, sx: {
                width: 24,
                height: 24,
                mr: 1
              } }),
              /* @__PURE__ */ jsx(Typography, { color: "primary", children: (_d = allUsers.find((found) => found.id === user.report_to)) == null ? void 0 : _d.name })
            ] }) : "N/A" }) })
          ] }) })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { sx: {
        paddingBottom: "0px !important"
      }, children: /* @__PURE__ */ jsxs(Tabs, { value: tabIndex, onChange: handleTabChange, "aria-label": "User Profile Tabs", variant: "scrollable", scrollButtons: "auto", allowScrollButtonsMobile: true, children: [
        /* @__PURE__ */ jsx(Tab, { label: "Profile" }),
        /* @__PURE__ */ jsx(Tab, { label: "Projects" }),
        /* @__PURE__ */ jsx(Tab, { label: "Salary & Statutory" }),
        /* @__PURE__ */ jsx(Tab, { label: "Assets" })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxs(Box, { sx: {
      p: 2
    }, children: [
      tabIndex === 0 && /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, sx: {
        display: "flex",
        alignItems: "stretch"
      }, children: [
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, sx: {
          display: "flex",
          flexDirection: "column"
        }, children: /* @__PURE__ */ jsxs(GlassCard, { sx: {
          mb: 2,
          flex: 1
        }, children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Personal Information", sx: {
            padding: "24px"
          }, action: /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: () => openModal("personal"), sx: {
            position: "absolute",
            top: 16,
            right: 16
          }, children: /* @__PURE__ */ jsx(default_1$1, {}) }) }),
          /* @__PURE__ */ jsx(CardContent, { children: user.passport_no || user.passport_exp_date || user.nationality || user.religion || user.marital_status || user.employment_of_spouse || user.number_of_children ? /* @__PURE__ */ jsxs(List, { children: [
            user.passport_no && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Passport No.:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.passport_no || "N/A" }) })
            ] }) }),
            user.passport_exp_date && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Passport Exp Date.:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.passport_exp_date || "N/A" }) })
            ] }) }),
            user.nid && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• NID No.:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.nid || "N/A" }) })
            ] }) }),
            user.nationality && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Nationality:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.nationality || "N/A" }) })
            ] }) }),
            user.religion && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Religion:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.religion || "N/A" }) })
            ] }) }),
            user.marital_status && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Marital Status:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.marital_status || "N/A" }) })
            ] }) }),
            user.employment_of_spouse && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Employment of Spouse:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.employment_of_spouse || "N/A" }) })
            ] }) }),
            user.number_of_children && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• No. of Children:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.number_of_children || "N/A" }) })
            ] }) })
          ] }) : /* @__PURE__ */ jsx(Typography, { children: "No personal information available" }) })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, sx: {
          display: "flex",
          flexDirection: "column"
        }, children: /* @__PURE__ */ jsxs(GlassCard, { sx: {
          mb: 2,
          flex: 1
        }, children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Emergency Contact", sx: {
            padding: "24px"
          }, action: /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: () => openModal("emergency"), sx: {
            position: "absolute",
            top: 16,
            right: 16
          }, children: /* @__PURE__ */ jsx(default_1$1, {}) }) }),
          /* @__PURE__ */ jsx(CardContent, { children: user.emergency_contact_primary_name || user.emergency_contact_secondary_name ? /* @__PURE__ */ jsxs(List, { children: [
            user.emergency_contact_primary_name && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Name:" }) }),
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.emergency_contact_primary_name || "N/A" }) })
              ] }) }),
              /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Relationship:" }) }),
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.emergency_contact_primary_relationship || "N/A" }) })
              ] }) }),
              /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Phone:" }) }),
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.emergency_contact_primary_phone || "N/A" }) })
              ] }) })
            ] }),
            user.emergency_contact_secondary_name && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Divider, { sx: {
                my: 2
              } }),
              /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Name:" }) }),
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.emergency_contact_secondary_name || "N/A" }) })
              ] }) }),
              /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Relationship:" }) }),
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.emergency_contact_secondary_relationship || "N/A" }) })
              ] }) }),
              /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Phone:" }) }),
                /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.emergency_contact_secondary_phone || "N/A" }) })
              ] }) })
            ] })
          ] }) : /* @__PURE__ */ jsx(Typography, { children: "No emergency contact information" }) })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(GlassCard, { variant: "outlined", sx: {
          mb: 2
        }, children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Bank Information", sx: {
            padding: "24px"
          }, action: /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: () => openModal("bank"), sx: {
            position: "absolute",
            top: 16,
            right: 16
          }, children: /* @__PURE__ */ jsx(default_1$1, {}) }) }),
          /* @__PURE__ */ jsx(CardContent, { children: user.bank_name || user.bank_account_no || user.ifsc_code || user.pan_no ? /* @__PURE__ */ jsxs(List, { children: [
            user.bank_name && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Bank Name:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.bank_name }) })
            ] }) }),
            user.bank_account_no && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Bank Account No.:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.bank_account_no }) })
            ] }) }),
            user.ifsc_code && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• IFSC Code:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.ifsc_code }) })
            ] }) }),
            user.pan_no && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• PAN No:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.pan_no }) })
            ] }) })
          ] }) : /* @__PURE__ */ jsx(Typography, { children: "No bank information" }) })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(GlassCard, { variant: "outlined", children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Family Information", sx: {
            padding: "24px"
          }, action: /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: () => openModal("family"), sx: {
            position: "absolute",
            top: 16,
            right: 16
          }, children: /* @__PURE__ */ jsx(default_1$1, {}) }) }),
          /* @__PURE__ */ jsx(CardContent, { children: user.family_member_name || user.family_member_relationship || user.family_member_dob || user.family_member_phone ? /* @__PURE__ */ jsxs(List, { children: [
            user.family_member_name && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Name:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.family_member_name }) })
            ] }) }),
            user.family_member_relationship && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Relationship:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.family_member_relationship }) })
            ] }) }),
            user.family_member_dob && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Date of Birth:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.family_member_dob }) })
            ] }) }),
            user.family_member_phone && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 5, children: /* @__PURE__ */ jsx(ListItemText, { primary: "• Phone:" }) }),
              /* @__PURE__ */ jsx(Grid, { item: true, xs: 7, children: /* @__PURE__ */ jsx(ListItemText, { primary: user.family_member_phone }) })
            ] }) })
          ] }) : /* @__PURE__ */ jsx(Typography, { children: "No family member information" }) })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(GlassCard, { variant: "outlined", sx: {
          mb: 2
        }, children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Education Information", sx: {
            padding: "24px"
          }, action: /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: () => openModal("education"), sx: {
            position: "absolute",
            top: 16,
            right: 16
          }, children: /* @__PURE__ */ jsx(default_1$1, {}) }) }),
          /* @__PURE__ */ jsx(CardContent, { children: user.educations && user.educations.length > 0 ? /* @__PURE__ */ jsx(List, { children: user.educations.map((education, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Typography, { variant: "h6", children: [
              "• ",
              education.institution
            ] }) }),
            /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsx(Typography, { variant: "body1", children: education.degree || "N/A" }) }),
            /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Typography, { variant: "body2", children: [
              education.starting_date ? new Date(education.starting_date).getFullYear() : "N/A",
              " -",
              education.complete_date ? new Date(education.complete_date).getFullYear() : "N/A"
            ] }) }),
            index < user.educations.length - 1 && /* @__PURE__ */ jsx(Divider, { sx: {
              my: 1
            } })
          ] }, education.id)) }) : /* @__PURE__ */ jsx(Typography, { children: "No education information" }) })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(GlassCard, { variant: "outlined", children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Experience", sx: {
            padding: "24px"
          }, action: /* @__PURE__ */ jsx(IconButton, { variant: "outlined", color: "primary", onClick: () => openModal("experience"), sx: {
            position: "absolute",
            top: 16,
            right: 16
          }, children: /* @__PURE__ */ jsx(default_1$1, {}) }) }),
          /* @__PURE__ */ jsx(CardContent, { children: user.experiences && user.experiences.length > 0 ? /* @__PURE__ */ jsx(List, { children: user.experiences.map((experience, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Typography, { variant: "h6", children: [
              "• ",
              experience.job_position,
              " at ",
              experience.company_name
            ] }) }),
            /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsxs(Typography, { variant: "body1", children: [
              experience.period_from ? new Date(experience.period_from).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long"
              }) : "N/A",
              " ",
              " - ",
              experience.period_to ? new Date(experience.period_to).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long"
              }) : "Present"
            ] }) }),
            /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsx(Typography, { variant: "body2", children: experience.location }) }),
            experience.description && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, children: /* @__PURE__ */ jsx(Typography, { variant: "body2", children: experience.description }) }),
            index < user.experiences.length - 1 && /* @__PURE__ */ jsx(Divider, { sx: {
              my: 1
            } })
          ] }, index)) }) : /* @__PURE__ */ jsx(Typography, { children: "No experience information" }) })
        ] }) })
      ] }),
      tabIndex === 1 && /* @__PURE__ */ jsx(Grid, { container: true, spacing: 2, sx: {
        display: "flex",
        alignItems: "stretch"
      }, children: projects.map((project, index) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, sx: {
        display: "flex",
        flexDirection: "column"
      }, children: /* @__PURE__ */ jsx(BankInformationForm, { project }) }, project.id || index)) }),
      tabIndex === 2 && /* @__PURE__ */ jsx(SalaryInformationForm, { user, setUser })
    ] })
  ] });
};
export {
  UserProfile as default
};
