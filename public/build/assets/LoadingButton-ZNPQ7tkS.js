import { m as generateUtilityClasses, k as generateUtilityClass, s as styled, d as Button, _ as _extends, p as capitalize, q as ButtonGroupContext, t as resolveProps, u as useDefaultProps, f as _objectWithoutPropertiesLoose, v as useId, h as composeClasses } from "./App-DT6Mg_2K.js";
import { r as reactExports, c as jsxRuntimeExports } from "./app-BxPs6nv_.js";
import { C as CircularProgress } from "./CircularProgress-CmXKJJKz.js";
function getLoadingButtonUtilityClass(slot) {
  return generateUtilityClass("MuiLoadingButton", slot);
}
const loadingButtonClasses = generateUtilityClasses("MuiLoadingButton", ["root", "loading", "loadingIndicator", "loadingIndicatorCenter", "loadingIndicatorStart", "loadingIndicatorEnd", "endIconLoadingEnd", "startIconLoadingStart"]);
const _excluded = ["children", "disabled", "id", "loading", "loadingIndicator", "loadingPosition", "variant"];
const useUtilityClasses = (ownerState) => {
  const {
    loading,
    loadingPosition,
    classes
  } = ownerState;
  const slots = {
    root: ["root", loading && "loading"],
    startIcon: [loading && `startIconLoading${capitalize(loadingPosition)}`],
    endIcon: [loading && `endIconLoading${capitalize(loadingPosition)}`],
    loadingIndicator: ["loadingIndicator", loading && `loadingIndicator${capitalize(loadingPosition)}`]
  };
  const composedClasses = composeClasses(slots, getLoadingButtonUtilityClass, classes);
  return _extends({}, classes, composedClasses);
};
const rootShouldForwardProp = (prop) => prop !== "ownerState" && prop !== "theme" && prop !== "sx" && prop !== "as" && prop !== "classes";
const LoadingButtonRoot = styled(Button, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
  name: "MuiLoadingButton",
  slot: "Root",
  overridesResolver: (props, styles) => {
    return [styles.root, styles.startIconLoadingStart && {
      [`& .${loadingButtonClasses.startIconLoadingStart}`]: styles.startIconLoadingStart
    }, styles.endIconLoadingEnd && {
      [`& .${loadingButtonClasses.endIconLoadingEnd}`]: styles.endIconLoadingEnd
    }];
  }
})(({
  ownerState,
  theme
}) => _extends({
  [`& .${loadingButtonClasses.startIconLoadingStart}, & .${loadingButtonClasses.endIconLoadingEnd}`]: {
    transition: theme.transitions.create(["opacity"], {
      duration: theme.transitions.duration.short
    }),
    opacity: 0
  }
}, ownerState.loadingPosition === "center" && {
  transition: theme.transitions.create(["background-color", "box-shadow", "border-color"], {
    duration: theme.transitions.duration.short
  }),
  [`&.${loadingButtonClasses.loading}`]: {
    color: "transparent"
  }
}, ownerState.loadingPosition === "start" && ownerState.fullWidth && {
  [`& .${loadingButtonClasses.startIconLoadingStart}, & .${loadingButtonClasses.endIconLoadingEnd}`]: {
    transition: theme.transitions.create(["opacity"], {
      duration: theme.transitions.duration.short
    }),
    opacity: 0,
    marginRight: -8
  }
}, ownerState.loadingPosition === "end" && ownerState.fullWidth && {
  [`& .${loadingButtonClasses.startIconLoadingStart}, & .${loadingButtonClasses.endIconLoadingEnd}`]: {
    transition: theme.transitions.create(["opacity"], {
      duration: theme.transitions.duration.short
    }),
    opacity: 0,
    marginLeft: -8
  }
}));
const LoadingButtonLoadingIndicator = styled("span", {
  name: "MuiLoadingButton",
  slot: "LoadingIndicator",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.loadingIndicator, styles[`loadingIndicator${capitalize(ownerState.loadingPosition)}`]];
  }
})(({
  theme,
  ownerState
}) => _extends({
  position: "absolute",
  visibility: "visible",
  display: "flex"
}, ownerState.loadingPosition === "start" && (ownerState.variant === "outlined" || ownerState.variant === "contained") && {
  left: ownerState.size === "small" ? 10 : 14
}, ownerState.loadingPosition === "start" && ownerState.variant === "text" && {
  left: 6
}, ownerState.loadingPosition === "center" && {
  left: "50%",
  transform: "translate(-50%)",
  color: (theme.vars || theme).palette.action.disabled
}, ownerState.loadingPosition === "end" && (ownerState.variant === "outlined" || ownerState.variant === "contained") && {
  right: ownerState.size === "small" ? 10 : 14
}, ownerState.loadingPosition === "end" && ownerState.variant === "text" && {
  right: 6
}, ownerState.loadingPosition === "start" && ownerState.fullWidth && {
  position: "relative",
  left: -10
}, ownerState.loadingPosition === "end" && ownerState.fullWidth && {
  position: "relative",
  right: -10
}));
const LoadingButton = /* @__PURE__ */ reactExports.forwardRef(function LoadingButton2(inProps, ref) {
  const contextProps = reactExports.useContext(ButtonGroupContext);
  const resolvedProps = resolveProps(contextProps, inProps);
  const props = useDefaultProps({
    props: resolvedProps,
    name: "MuiLoadingButton"
  });
  const {
    children,
    disabled = false,
    id: idProp,
    loading = false,
    loadingIndicator: loadingIndicatorProp,
    loadingPosition = "center",
    variant = "text"
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const id = useId(idProp);
  const loadingIndicator = loadingIndicatorProp != null ? loadingIndicatorProp : /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {
    "aria-labelledby": id,
    color: "inherit",
    size: 16
  });
  const ownerState = _extends({}, props, {
    disabled,
    loading,
    loadingIndicator,
    loadingPosition,
    variant
  });
  const classes = useUtilityClasses(ownerState);
  const loadingButtonLoadingIndicator = loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingButtonLoadingIndicator, {
    className: classes.loadingIndicator,
    ownerState,
    children: loadingIndicator
  }) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(LoadingButtonRoot, _extends({
    disabled: disabled || loading,
    id,
    ref
  }, other, {
    variant,
    classes,
    ownerState,
    children: [ownerState.loadingPosition === "end" ? children : loadingButtonLoadingIndicator, ownerState.loadingPosition === "end" ? loadingButtonLoadingIndicator : children]
  }));
});
export {
  LoadingButton as L
};
