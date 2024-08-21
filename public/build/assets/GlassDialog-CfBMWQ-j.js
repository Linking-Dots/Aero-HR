import { m as generateUtilityClasses, k as generateUtilityClass, s as styled, ap as Backdrop, aq as Modal, p as capitalize, _ as _extends, ar as Paper, u as useDefaultProps, y as useTheme, f as _objectWithoutPropertiesLoose, v as useId, g as clsx$1, h as composeClasses, as as Fade, T as Typography, j as createSvgIcon, r as requireCreateSvgIcon, n as interopRequireDefaultExports, c as Grow } from "./App-BnBiQk5p.js";
import { g as getDefaultExportFromCjs, r as reactExports, c as jsxRuntimeExports, e as getAugmentedNamespace, f as reactDomExports, a as jsx } from "./app-BjPDCRlK.js";
var propTypes = { exports: {} };
var ReactPropTypesSecret$1 = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
var ReactPropTypesSecret_1 = ReactPropTypesSecret$1;
var ReactPropTypesSecret = ReactPropTypesSecret_1;
function emptyFunction() {
}
function emptyFunctionWithReset() {
}
emptyFunctionWithReset.resetWarningCache = emptyFunction;
var factoryWithThrowingShims = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      return;
    }
    var err = new Error(
      "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
    );
    err.name = "Invariant Violation";
    throw err;
  }
  shim.isRequired = shim;
  function getShim() {
    return shim;
  }
  var ReactPropTypes = {
    array: shim,
    bigint: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,
    any: shim,
    arrayOf: getShim,
    element: shim,
    elementType: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim,
    checkPropTypes: emptyFunctionWithReset,
    resetWarningCache: emptyFunction
  };
  ReactPropTypes.PropTypes = ReactPropTypes;
  return ReactPropTypes;
};
{
  propTypes.exports = factoryWithThrowingShims();
}
var propTypesExports = propTypes.exports;
const PropTypes = /* @__PURE__ */ getDefaultExportFromCjs(propTypesExports);
function getDialogUtilityClass(slot) {
  return generateUtilityClass("MuiDialog", slot);
}
const dialogClasses = generateUtilityClasses("MuiDialog", ["root", "scrollPaper", "scrollBody", "container", "paper", "paperScrollPaper", "paperScrollBody", "paperWidthFalse", "paperWidthXs", "paperWidthSm", "paperWidthMd", "paperWidthLg", "paperWidthXl", "paperFullWidth", "paperFullScreen"]);
const DialogContext = /* @__PURE__ */ reactExports.createContext({});
const _excluded$3 = ["aria-describedby", "aria-labelledby", "BackdropComponent", "BackdropProps", "children", "className", "disableEscapeKeyDown", "fullScreen", "fullWidth", "maxWidth", "onBackdropClick", "onClick", "onClose", "open", "PaperComponent", "PaperProps", "scroll", "TransitionComponent", "transitionDuration", "TransitionProps"];
const DialogBackdrop = styled(Backdrop, {
  name: "MuiDialog",
  slot: "Backdrop",
  overrides: (props, styles) => styles.backdrop
})({
  // Improve scrollable dialog support.
  zIndex: -1
});
const useUtilityClasses$3 = (ownerState) => {
  const {
    classes,
    scroll,
    maxWidth,
    fullWidth,
    fullScreen
  } = ownerState;
  const slots = {
    root: ["root"],
    container: ["container", `scroll${capitalize(scroll)}`],
    paper: ["paper", `paperScroll${capitalize(scroll)}`, `paperWidth${capitalize(String(maxWidth))}`, fullWidth && "paperFullWidth", fullScreen && "paperFullScreen"]
  };
  return composeClasses(slots, getDialogUtilityClass, classes);
};
const DialogRoot = styled(Modal, {
  name: "MuiDialog",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})({
  "@media print": {
    // Use !important to override the Modal inline-style.
    position: "absolute !important"
  }
});
const DialogContainer = styled("div", {
  name: "MuiDialog",
  slot: "Container",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.container, styles[`scroll${capitalize(ownerState.scroll)}`]];
  }
})(({
  ownerState
}) => _extends({
  height: "100%",
  "@media print": {
    height: "auto"
  },
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0
}, ownerState.scroll === "paper" && {
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}, ownerState.scroll === "body" && {
  overflowY: "auto",
  overflowX: "hidden",
  textAlign: "center",
  "&::after": {
    content: '""',
    display: "inline-block",
    verticalAlign: "middle",
    height: "100%",
    width: "0"
  }
}));
const DialogPaper = styled(Paper, {
  name: "MuiDialog",
  slot: "Paper",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.paper, styles[`scrollPaper${capitalize(ownerState.scroll)}`], styles[`paperWidth${capitalize(String(ownerState.maxWidth))}`], ownerState.fullWidth && styles.paperFullWidth, ownerState.fullScreen && styles.paperFullScreen];
  }
})(({
  theme,
  ownerState
}) => _extends({
  margin: 32,
  position: "relative",
  overflowY: "auto",
  // Fix IE11 issue, to remove at some point.
  "@media print": {
    overflowY: "visible",
    boxShadow: "none"
  }
}, ownerState.scroll === "paper" && {
  display: "flex",
  flexDirection: "column",
  maxHeight: "calc(100% - 64px)"
}, ownerState.scroll === "body" && {
  display: "inline-block",
  verticalAlign: "middle",
  textAlign: "left"
  // 'initial' doesn't work on IE11
}, !ownerState.maxWidth && {
  maxWidth: "calc(100% - 64px)"
}, ownerState.maxWidth === "xs" && {
  maxWidth: theme.breakpoints.unit === "px" ? Math.max(theme.breakpoints.values.xs, 444) : `max(${theme.breakpoints.values.xs}${theme.breakpoints.unit}, 444px)`,
  [`&.${dialogClasses.paperScrollBody}`]: {
    [theme.breakpoints.down(Math.max(theme.breakpoints.values.xs, 444) + 32 * 2)]: {
      maxWidth: "calc(100% - 64px)"
    }
  }
}, ownerState.maxWidth && ownerState.maxWidth !== "xs" && {
  maxWidth: `${theme.breakpoints.values[ownerState.maxWidth]}${theme.breakpoints.unit}`,
  [`&.${dialogClasses.paperScrollBody}`]: {
    [theme.breakpoints.down(theme.breakpoints.values[ownerState.maxWidth] + 32 * 2)]: {
      maxWidth: "calc(100% - 64px)"
    }
  }
}, ownerState.fullWidth && {
  width: "calc(100% - 64px)"
}, ownerState.fullScreen && {
  margin: 0,
  width: "100%",
  maxWidth: "100%",
  height: "100%",
  maxHeight: "none",
  borderRadius: 0,
  [`&.${dialogClasses.paperScrollBody}`]: {
    margin: 0,
    maxWidth: "100%"
  }
}));
const Dialog = /* @__PURE__ */ reactExports.forwardRef(function Dialog2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiDialog"
  });
  const theme = useTheme();
  const defaultTransitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen
  };
  const {
    "aria-describedby": ariaDescribedby,
    "aria-labelledby": ariaLabelledbyProp,
    BackdropComponent,
    BackdropProps,
    children,
    className,
    disableEscapeKeyDown = false,
    fullScreen = false,
    fullWidth = false,
    maxWidth = "sm",
    onBackdropClick,
    onClick,
    onClose,
    open,
    PaperComponent: PaperComponent2 = Paper,
    PaperProps = {},
    scroll = "paper",
    TransitionComponent = Fade,
    transitionDuration = defaultTransitionDuration,
    TransitionProps
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$3);
  const ownerState = _extends({}, props, {
    disableEscapeKeyDown,
    fullScreen,
    fullWidth,
    maxWidth,
    scroll
  });
  const classes = useUtilityClasses$3(ownerState);
  const backdropClick = reactExports.useRef();
  const handleMouseDown = (event) => {
    backdropClick.current = event.target === event.currentTarget;
  };
  const handleBackdropClick = (event) => {
    if (onClick) {
      onClick(event);
    }
    if (!backdropClick.current) {
      return;
    }
    backdropClick.current = null;
    if (onBackdropClick) {
      onBackdropClick(event);
    }
    if (onClose) {
      onClose(event, "backdropClick");
    }
  };
  const ariaLabelledby = useId(ariaLabelledbyProp);
  const dialogContextValue = reactExports.useMemo(() => {
    return {
      titleId: ariaLabelledby
    };
  }, [ariaLabelledby]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogRoot, _extends({
    className: clsx$1(classes.root, className),
    closeAfterTransition: true,
    components: {
      Backdrop: DialogBackdrop
    },
    componentsProps: {
      backdrop: _extends({
        transitionDuration,
        as: BackdropComponent
      }, BackdropProps)
    },
    disableEscapeKeyDown,
    onClose,
    open,
    ref,
    onClick: handleBackdropClick,
    ownerState
  }, other, {
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionComponent, _extends({
      appear: true,
      in: open,
      timeout: transitionDuration,
      role: "presentation"
    }, TransitionProps, {
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContainer, {
        className: clsx$1(classes.container),
        onMouseDown: handleMouseDown,
        ownerState,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogPaper, _extends({
          as: PaperComponent2,
          elevation: 24,
          role: "dialog",
          "aria-describedby": ariaDescribedby,
          "aria-labelledby": ariaLabelledby
        }, PaperProps, {
          className: clsx$1(classes.paper, PaperProps.className),
          ownerState,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContext.Provider, {
            value: dialogContextValue,
            children
          })
        }))
      })
    }))
  }));
});
function getDialogActionsUtilityClass(slot) {
  return generateUtilityClass("MuiDialogActions", slot);
}
generateUtilityClasses("MuiDialogActions", ["root", "spacing"]);
const _excluded$2 = ["className", "disableSpacing"];
const useUtilityClasses$2 = (ownerState) => {
  const {
    classes,
    disableSpacing
  } = ownerState;
  const slots = {
    root: ["root", !disableSpacing && "spacing"]
  };
  return composeClasses(slots, getDialogActionsUtilityClass, classes);
};
const DialogActionsRoot = styled("div", {
  name: "MuiDialogActions",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, !ownerState.disableSpacing && styles.spacing];
  }
})(({
  ownerState
}) => _extends({
  display: "flex",
  alignItems: "center",
  padding: 8,
  justifyContent: "flex-end",
  flex: "0 0 auto"
}, !ownerState.disableSpacing && {
  "& > :not(style) ~ :not(style)": {
    marginLeft: 8
  }
}));
const DialogActions = /* @__PURE__ */ reactExports.forwardRef(function DialogActions2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiDialogActions"
  });
  const {
    className,
    disableSpacing = false
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$2);
  const ownerState = _extends({}, props, {
    disableSpacing
  });
  const classes = useUtilityClasses$2(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActionsRoot, _extends({
    className: clsx$1(classes.root, className),
    ownerState,
    ref
  }, other));
});
function getDialogContentUtilityClass(slot) {
  return generateUtilityClass("MuiDialogContent", slot);
}
generateUtilityClasses("MuiDialogContent", ["root", "dividers"]);
function getDialogTitleUtilityClass(slot) {
  return generateUtilityClass("MuiDialogTitle", slot);
}
const dialogTitleClasses = generateUtilityClasses("MuiDialogTitle", ["root"]);
const _excluded$1 = ["className", "dividers"];
const useUtilityClasses$1 = (ownerState) => {
  const {
    classes,
    dividers
  } = ownerState;
  const slots = {
    root: ["root", dividers && "dividers"]
  };
  return composeClasses(slots, getDialogContentUtilityClass, classes);
};
const DialogContentRoot = styled("div", {
  name: "MuiDialogContent",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, ownerState.dividers && styles.dividers];
  }
})(({
  theme,
  ownerState
}) => _extends({
  flex: "1 1 auto",
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: "touch",
  overflowY: "auto",
  padding: "20px 24px"
}, ownerState.dividers ? {
  padding: "16px 24px",
  borderTop: `1px solid ${(theme.vars || theme).palette.divider}`,
  borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`
} : {
  [`.${dialogTitleClasses.root} + &`]: {
    paddingTop: 0
  }
}));
const DialogContent = /* @__PURE__ */ reactExports.forwardRef(function DialogContent2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiDialogContent"
  });
  const {
    className,
    dividers = false
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$1);
  const ownerState = _extends({}, props, {
    dividers
  });
  const classes = useUtilityClasses$1(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentRoot, _extends({
    className: clsx$1(classes.root, className),
    ownerState,
    ref
  }, other));
});
const _excluded = ["className", "id"];
const useUtilityClasses = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"]
  };
  return composeClasses(slots, getDialogTitleUtilityClass, classes);
};
const DialogTitleRoot = styled(Typography, {
  name: "MuiDialogTitle",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})({
  padding: "16px 24px",
  flex: "0 0 auto"
});
const DialogTitle = /* @__PURE__ */ reactExports.forwardRef(function DialogTitle2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiDialogTitle"
  });
  const {
    className,
    id: idProp
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const ownerState = props;
  const classes = useUtilityClasses(ownerState);
  const {
    titleId = idProp
  } = reactExports.useContext(DialogContext);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitleRoot, _extends({
    component: "h2",
    className: clsx$1(classes.root, className),
    ownerState,
    ref,
    variant: "h6",
    id: idProp != null ? idProp : titleId
  }, other));
});
const Clear$1 = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
}), "Clear");
var Edit = {};
var _interopRequireDefault$2 = interopRequireDefaultExports;
Object.defineProperty(Edit, "__esModule", {
  value: true
});
var default_1$1 = Edit.default = void 0;
var _createSvgIcon$1 = _interopRequireDefault$2(requireCreateSvgIcon());
var _jsxRuntime$1 = jsxRuntimeExports;
default_1$1 = Edit.default = (0, _createSvgIcon$1.default)(/* @__PURE__ */ (0, _jsxRuntime$1.jsx)("path", {
  d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"
}), "Edit");
var Clear = {};
var _interopRequireDefault$1 = interopRequireDefaultExports;
Object.defineProperty(Clear, "__esModule", {
  value: true
});
var default_1 = Clear.default = void 0;
var _createSvgIcon = _interopRequireDefault$1(requireCreateSvgIcon());
var _jsxRuntime = jsxRuntimeExports;
default_1 = Clear.default = (0, _createSvgIcon.default)(/* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
}), "Clear");
var cjs = { exports: {} };
var Draggable$2 = {};
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) for (t = 0; t < e.length; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  else for (t in e) e[t] && (n && (n += " "), n += t);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = ""; f < arguments.length; ) (e = arguments[f++]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
const clsx_m = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clsx,
  default: clsx
}, Symbol.toStringTag, { value: "Module" }));
const require$$3 = /* @__PURE__ */ getAugmentedNamespace(clsx_m);
var domFns = {};
var shims = {};
Object.defineProperty(shims, "__esModule", {
  value: true
});
shims.dontSetMe = dontSetMe;
shims.findInArray = findInArray;
shims.int = int;
shims.isFunction = isFunction;
shims.isNum = isNum;
function findInArray(array, callback) {
  for (let i = 0, length = array.length; i < length; i++) {
    if (callback.apply(callback, [array[i], i, array])) return array[i];
  }
}
function isFunction(func) {
  return typeof func === "function" || Object.prototype.toString.call(func) === "[object Function]";
}
function isNum(num) {
  return typeof num === "number" && !isNaN(num);
}
function int(a) {
  return parseInt(a, 10);
}
function dontSetMe(props, propName, componentName) {
  if (props[propName]) {
    return new Error("Invalid prop ".concat(propName, " passed to ").concat(componentName, " - do not set this, set it on the child."));
  }
}
var getPrefix$1 = {};
Object.defineProperty(getPrefix$1, "__esModule", {
  value: true
});
getPrefix$1.browserPrefixToKey = browserPrefixToKey;
getPrefix$1.browserPrefixToStyle = browserPrefixToStyle;
getPrefix$1.default = void 0;
getPrefix$1.getPrefix = getPrefix;
const prefixes = ["Moz", "Webkit", "O", "ms"];
function getPrefix() {
  var _window$document;
  let prop = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "transform";
  if (typeof window === "undefined") return "";
  const style = (_window$document = window.document) === null || _window$document === void 0 || (_window$document = _window$document.documentElement) === null || _window$document === void 0 ? void 0 : _window$document.style;
  if (!style) return "";
  if (prop in style) return "";
  for (let i = 0; i < prefixes.length; i++) {
    if (browserPrefixToKey(prop, prefixes[i]) in style) return prefixes[i];
  }
  return "";
}
function browserPrefixToKey(prop, prefix) {
  return prefix ? "".concat(prefix).concat(kebabToTitleCase(prop)) : prop;
}
function browserPrefixToStyle(prop, prefix) {
  return prefix ? "-".concat(prefix.toLowerCase(), "-").concat(prop) : prop;
}
function kebabToTitleCase(str) {
  let out = "";
  let shouldCapitalize = true;
  for (let i = 0; i < str.length; i++) {
    if (shouldCapitalize) {
      out += str[i].toUpperCase();
      shouldCapitalize = false;
    } else if (str[i] === "-") {
      shouldCapitalize = true;
    } else {
      out += str[i];
    }
  }
  return out;
}
getPrefix$1.default = getPrefix();
Object.defineProperty(domFns, "__esModule", {
  value: true
});
domFns.addClassName = addClassName;
domFns.addEvent = addEvent;
domFns.addUserSelectStyles = addUserSelectStyles;
domFns.createCSSTransform = createCSSTransform;
domFns.createSVGTransform = createSVGTransform;
domFns.getTouch = getTouch;
domFns.getTouchIdentifier = getTouchIdentifier;
domFns.getTranslation = getTranslation;
domFns.innerHeight = innerHeight;
domFns.innerWidth = innerWidth;
domFns.matchesSelector = matchesSelector;
domFns.matchesSelectorAndParentsTo = matchesSelectorAndParentsTo;
domFns.offsetXYFromParent = offsetXYFromParent;
domFns.outerHeight = outerHeight;
domFns.outerWidth = outerWidth;
domFns.removeClassName = removeClassName;
domFns.removeEvent = removeEvent;
domFns.removeUserSelectStyles = removeUserSelectStyles;
var _shims$2 = shims;
var _getPrefix = _interopRequireWildcard$1(getPrefix$1);
function _getRequireWildcardCache$1(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$1 = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$1(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$1(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
let matchesSelectorFunc = "";
function matchesSelector(el, selector) {
  if (!matchesSelectorFunc) {
    matchesSelectorFunc = (0, _shims$2.findInArray)(["matches", "webkitMatchesSelector", "mozMatchesSelector", "msMatchesSelector", "oMatchesSelector"], function(method) {
      return (0, _shims$2.isFunction)(el[method]);
    });
  }
  if (!(0, _shims$2.isFunction)(el[matchesSelectorFunc])) return false;
  return el[matchesSelectorFunc](selector);
}
function matchesSelectorAndParentsTo(el, selector, baseNode) {
  let node = el;
  do {
    if (matchesSelector(node, selector)) return true;
    if (node === baseNode) return false;
    node = node.parentNode;
  } while (node);
  return false;
}
function addEvent(el, event, handler, inputOptions) {
  if (!el) return;
  const options = {
    capture: true,
    ...inputOptions
  };
  if (el.addEventListener) {
    el.addEventListener(event, handler, options);
  } else if (el.attachEvent) {
    el.attachEvent("on" + event, handler);
  } else {
    el["on" + event] = handler;
  }
}
function removeEvent(el, event, handler, inputOptions) {
  if (!el) return;
  const options = {
    capture: true,
    ...inputOptions
  };
  if (el.removeEventListener) {
    el.removeEventListener(event, handler, options);
  } else if (el.detachEvent) {
    el.detachEvent("on" + event, handler);
  } else {
    el["on" + event] = null;
  }
}
function outerHeight(node) {
  let height = node.clientHeight;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  height += (0, _shims$2.int)(computedStyle.borderTopWidth);
  height += (0, _shims$2.int)(computedStyle.borderBottomWidth);
  return height;
}
function outerWidth(node) {
  let width = node.clientWidth;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  width += (0, _shims$2.int)(computedStyle.borderLeftWidth);
  width += (0, _shims$2.int)(computedStyle.borderRightWidth);
  return width;
}
function innerHeight(node) {
  let height = node.clientHeight;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  height -= (0, _shims$2.int)(computedStyle.paddingTop);
  height -= (0, _shims$2.int)(computedStyle.paddingBottom);
  return height;
}
function innerWidth(node) {
  let width = node.clientWidth;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  width -= (0, _shims$2.int)(computedStyle.paddingLeft);
  width -= (0, _shims$2.int)(computedStyle.paddingRight);
  return width;
}
function offsetXYFromParent(evt, offsetParent, scale) {
  const isBody = offsetParent === offsetParent.ownerDocument.body;
  const offsetParentRect = isBody ? {
    left: 0,
    top: 0
  } : offsetParent.getBoundingClientRect();
  const x = (evt.clientX + offsetParent.scrollLeft - offsetParentRect.left) / scale;
  const y = (evt.clientY + offsetParent.scrollTop - offsetParentRect.top) / scale;
  return {
    x,
    y
  };
}
function createCSSTransform(controlPos, positionOffset) {
  const translation = getTranslation(controlPos, positionOffset, "px");
  return {
    [(0, _getPrefix.browserPrefixToKey)("transform", _getPrefix.default)]: translation
  };
}
function createSVGTransform(controlPos, positionOffset) {
  const translation = getTranslation(controlPos, positionOffset, "");
  return translation;
}
function getTranslation(_ref, positionOffset, unitSuffix) {
  let {
    x,
    y
  } = _ref;
  let translation = "translate(".concat(x).concat(unitSuffix, ",").concat(y).concat(unitSuffix, ")");
  if (positionOffset) {
    const defaultX = "".concat(typeof positionOffset.x === "string" ? positionOffset.x : positionOffset.x + unitSuffix);
    const defaultY = "".concat(typeof positionOffset.y === "string" ? positionOffset.y : positionOffset.y + unitSuffix);
    translation = "translate(".concat(defaultX, ", ").concat(defaultY, ")") + translation;
  }
  return translation;
}
function getTouch(e, identifier) {
  return e.targetTouches && (0, _shims$2.findInArray)(e.targetTouches, (t) => identifier === t.identifier) || e.changedTouches && (0, _shims$2.findInArray)(e.changedTouches, (t) => identifier === t.identifier);
}
function getTouchIdentifier(e) {
  if (e.targetTouches && e.targetTouches[0]) return e.targetTouches[0].identifier;
  if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].identifier;
}
function addUserSelectStyles(doc) {
  if (!doc) return;
  let styleEl = doc.getElementById("react-draggable-style-el");
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.type = "text/css";
    styleEl.id = "react-draggable-style-el";
    styleEl.innerHTML = ".react-draggable-transparent-selection *::-moz-selection {all: inherit;}\n";
    styleEl.innerHTML += ".react-draggable-transparent-selection *::selection {all: inherit;}\n";
    doc.getElementsByTagName("head")[0].appendChild(styleEl);
  }
  if (doc.body) addClassName(doc.body, "react-draggable-transparent-selection");
}
function removeUserSelectStyles(doc) {
  if (!doc) return;
  try {
    if (doc.body) removeClassName(doc.body, "react-draggable-transparent-selection");
    if (doc.selection) {
      doc.selection.empty();
    } else {
      const selection = (doc.defaultView || window).getSelection();
      if (selection && selection.type !== "Caret") {
        selection.removeAllRanges();
      }
    }
  } catch (e) {
  }
}
function addClassName(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    if (!el.className.match(new RegExp("(?:^|\\s)".concat(className, "(?!\\S)")))) {
      el.className += " ".concat(className);
    }
  }
}
function removeClassName(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp("(?:^|\\s)".concat(className, "(?!\\S)"), "g"), "");
  }
}
var positionFns = {};
Object.defineProperty(positionFns, "__esModule", {
  value: true
});
positionFns.canDragX = canDragX;
positionFns.canDragY = canDragY;
positionFns.createCoreData = createCoreData;
positionFns.createDraggableData = createDraggableData;
positionFns.getBoundPosition = getBoundPosition;
positionFns.getControlPosition = getControlPosition;
positionFns.snapToGrid = snapToGrid;
var _shims$1 = shims;
var _domFns$1 = domFns;
function getBoundPosition(draggable, x, y) {
  if (!draggable.props.bounds) return [x, y];
  let {
    bounds
  } = draggable.props;
  bounds = typeof bounds === "string" ? bounds : cloneBounds(bounds);
  const node = findDOMNode(draggable);
  if (typeof bounds === "string") {
    const {
      ownerDocument
    } = node;
    const ownerWindow = ownerDocument.defaultView;
    let boundNode;
    if (bounds === "parent") {
      boundNode = node.parentNode;
    } else {
      boundNode = ownerDocument.querySelector(bounds);
    }
    if (!(boundNode instanceof ownerWindow.HTMLElement)) {
      throw new Error('Bounds selector "' + bounds + '" could not find an element.');
    }
    const boundNodeEl = boundNode;
    const nodeStyle = ownerWindow.getComputedStyle(node);
    const boundNodeStyle = ownerWindow.getComputedStyle(boundNodeEl);
    bounds = {
      left: -node.offsetLeft + (0, _shims$1.int)(boundNodeStyle.paddingLeft) + (0, _shims$1.int)(nodeStyle.marginLeft),
      top: -node.offsetTop + (0, _shims$1.int)(boundNodeStyle.paddingTop) + (0, _shims$1.int)(nodeStyle.marginTop),
      right: (0, _domFns$1.innerWidth)(boundNodeEl) - (0, _domFns$1.outerWidth)(node) - node.offsetLeft + (0, _shims$1.int)(boundNodeStyle.paddingRight) - (0, _shims$1.int)(nodeStyle.marginRight),
      bottom: (0, _domFns$1.innerHeight)(boundNodeEl) - (0, _domFns$1.outerHeight)(node) - node.offsetTop + (0, _shims$1.int)(boundNodeStyle.paddingBottom) - (0, _shims$1.int)(nodeStyle.marginBottom)
    };
  }
  if ((0, _shims$1.isNum)(bounds.right)) x = Math.min(x, bounds.right);
  if ((0, _shims$1.isNum)(bounds.bottom)) y = Math.min(y, bounds.bottom);
  if ((0, _shims$1.isNum)(bounds.left)) x = Math.max(x, bounds.left);
  if ((0, _shims$1.isNum)(bounds.top)) y = Math.max(y, bounds.top);
  return [x, y];
}
function snapToGrid(grid, pendingX, pendingY) {
  const x = Math.round(pendingX / grid[0]) * grid[0];
  const y = Math.round(pendingY / grid[1]) * grid[1];
  return [x, y];
}
function canDragX(draggable) {
  return draggable.props.axis === "both" || draggable.props.axis === "x";
}
function canDragY(draggable) {
  return draggable.props.axis === "both" || draggable.props.axis === "y";
}
function getControlPosition(e, touchIdentifier, draggableCore) {
  const touchObj = typeof touchIdentifier === "number" ? (0, _domFns$1.getTouch)(e, touchIdentifier) : null;
  if (typeof touchIdentifier === "number" && !touchObj) return null;
  const node = findDOMNode(draggableCore);
  const offsetParent = draggableCore.props.offsetParent || node.offsetParent || node.ownerDocument.body;
  return (0, _domFns$1.offsetXYFromParent)(touchObj || e, offsetParent, draggableCore.props.scale);
}
function createCoreData(draggable, x, y) {
  const isStart = !(0, _shims$1.isNum)(draggable.lastX);
  const node = findDOMNode(draggable);
  if (isStart) {
    return {
      node,
      deltaX: 0,
      deltaY: 0,
      lastX: x,
      lastY: y,
      x,
      y
    };
  } else {
    return {
      node,
      deltaX: x - draggable.lastX,
      deltaY: y - draggable.lastY,
      lastX: draggable.lastX,
      lastY: draggable.lastY,
      x,
      y
    };
  }
}
function createDraggableData(draggable, coreData) {
  const scale = draggable.props.scale;
  return {
    node: coreData.node,
    x: draggable.state.x + coreData.deltaX / scale,
    y: draggable.state.y + coreData.deltaY / scale,
    deltaX: coreData.deltaX / scale,
    deltaY: coreData.deltaY / scale,
    lastX: draggable.state.x,
    lastY: draggable.state.y
  };
}
function cloneBounds(bounds) {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom
  };
}
function findDOMNode(draggable) {
  const node = draggable.findDOMNode();
  if (!node) {
    throw new Error("<DraggableCore>: Unmounted during event!");
  }
  return node;
}
var DraggableCore$2 = {};
var log$1 = {};
Object.defineProperty(log$1, "__esModule", {
  value: true
});
log$1.default = log;
function log() {
}
Object.defineProperty(DraggableCore$2, "__esModule", {
  value: true
});
DraggableCore$2.default = void 0;
var React = _interopRequireWildcard(reactExports);
var _propTypes = _interopRequireDefault(propTypesExports);
var _reactDom = _interopRequireDefault(reactDomExports);
var _domFns = domFns;
var _positionFns = positionFns;
var _shims = shims;
var _log = _interopRequireDefault(log$1);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
const eventsFor = {
  touch: {
    start: "touchstart",
    move: "touchmove",
    stop: "touchend"
  },
  mouse: {
    start: "mousedown",
    move: "mousemove",
    stop: "mouseup"
  }
};
let dragEventFor = eventsFor.mouse;
let DraggableCore$1 = class DraggableCore extends React.Component {
  constructor() {
    super(...arguments);
    _defineProperty(this, "dragging", false);
    _defineProperty(this, "lastX", NaN);
    _defineProperty(this, "lastY", NaN);
    _defineProperty(this, "touchIdentifier", null);
    _defineProperty(this, "mounted", false);
    _defineProperty(this, "handleDragStart", (e) => {
      this.props.onMouseDown(e);
      if (!this.props.allowAnyClick && typeof e.button === "number" && e.button !== 0) return false;
      const thisNode = this.findDOMNode();
      if (!thisNode || !thisNode.ownerDocument || !thisNode.ownerDocument.body) {
        throw new Error("<DraggableCore> not mounted on DragStart!");
      }
      const {
        ownerDocument
      } = thisNode;
      if (this.props.disabled || !(e.target instanceof ownerDocument.defaultView.Node) || this.props.handle && !(0, _domFns.matchesSelectorAndParentsTo)(e.target, this.props.handle, thisNode) || this.props.cancel && (0, _domFns.matchesSelectorAndParentsTo)(e.target, this.props.cancel, thisNode)) {
        return;
      }
      if (e.type === "touchstart") e.preventDefault();
      const touchIdentifier = (0, _domFns.getTouchIdentifier)(e);
      this.touchIdentifier = touchIdentifier;
      const position = (0, _positionFns.getControlPosition)(e, touchIdentifier, this);
      if (position == null) return;
      const {
        x,
        y
      } = position;
      const coreEvent = (0, _positionFns.createCoreData)(this, x, y);
      (0, _log.default)("DraggableCore: handleDragStart: %j", coreEvent);
      (0, _log.default)("calling", this.props.onStart);
      const shouldUpdate = this.props.onStart(e, coreEvent);
      if (shouldUpdate === false || this.mounted === false) return;
      if (this.props.enableUserSelectHack) (0, _domFns.addUserSelectStyles)(ownerDocument);
      this.dragging = true;
      this.lastX = x;
      this.lastY = y;
      (0, _domFns.addEvent)(ownerDocument, dragEventFor.move, this.handleDrag);
      (0, _domFns.addEvent)(ownerDocument, dragEventFor.stop, this.handleDragStop);
    });
    _defineProperty(this, "handleDrag", (e) => {
      const position = (0, _positionFns.getControlPosition)(e, this.touchIdentifier, this);
      if (position == null) return;
      let {
        x,
        y
      } = position;
      if (Array.isArray(this.props.grid)) {
        let deltaX = x - this.lastX, deltaY = y - this.lastY;
        [deltaX, deltaY] = (0, _positionFns.snapToGrid)(this.props.grid, deltaX, deltaY);
        if (!deltaX && !deltaY) return;
        x = this.lastX + deltaX, y = this.lastY + deltaY;
      }
      const coreEvent = (0, _positionFns.createCoreData)(this, x, y);
      (0, _log.default)("DraggableCore: handleDrag: %j", coreEvent);
      const shouldUpdate = this.props.onDrag(e, coreEvent);
      if (shouldUpdate === false || this.mounted === false) {
        try {
          this.handleDragStop(new MouseEvent("mouseup"));
        } catch (err) {
          const event = document.createEvent("MouseEvents");
          event.initMouseEvent("mouseup", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          this.handleDragStop(event);
        }
        return;
      }
      this.lastX = x;
      this.lastY = y;
    });
    _defineProperty(this, "handleDragStop", (e) => {
      if (!this.dragging) return;
      const position = (0, _positionFns.getControlPosition)(e, this.touchIdentifier, this);
      if (position == null) return;
      let {
        x,
        y
      } = position;
      if (Array.isArray(this.props.grid)) {
        let deltaX = x - this.lastX || 0;
        let deltaY = y - this.lastY || 0;
        [deltaX, deltaY] = (0, _positionFns.snapToGrid)(this.props.grid, deltaX, deltaY);
        x = this.lastX + deltaX, y = this.lastY + deltaY;
      }
      const coreEvent = (0, _positionFns.createCoreData)(this, x, y);
      const shouldContinue = this.props.onStop(e, coreEvent);
      if (shouldContinue === false || this.mounted === false) return false;
      const thisNode = this.findDOMNode();
      if (thisNode) {
        if (this.props.enableUserSelectHack) (0, _domFns.removeUserSelectStyles)(thisNode.ownerDocument);
      }
      (0, _log.default)("DraggableCore: handleDragStop: %j", coreEvent);
      this.dragging = false;
      this.lastX = NaN;
      this.lastY = NaN;
      if (thisNode) {
        (0, _log.default)("DraggableCore: Removing handlers");
        (0, _domFns.removeEvent)(thisNode.ownerDocument, dragEventFor.move, this.handleDrag);
        (0, _domFns.removeEvent)(thisNode.ownerDocument, dragEventFor.stop, this.handleDragStop);
      }
    });
    _defineProperty(this, "onMouseDown", (e) => {
      dragEventFor = eventsFor.mouse;
      return this.handleDragStart(e);
    });
    _defineProperty(this, "onMouseUp", (e) => {
      dragEventFor = eventsFor.mouse;
      return this.handleDragStop(e);
    });
    _defineProperty(this, "onTouchStart", (e) => {
      dragEventFor = eventsFor.touch;
      return this.handleDragStart(e);
    });
    _defineProperty(this, "onTouchEnd", (e) => {
      dragEventFor = eventsFor.touch;
      return this.handleDragStop(e);
    });
  }
  componentDidMount() {
    this.mounted = true;
    const thisNode = this.findDOMNode();
    if (thisNode) {
      (0, _domFns.addEvent)(thisNode, eventsFor.touch.start, this.onTouchStart, {
        passive: false
      });
    }
  }
  componentWillUnmount() {
    this.mounted = false;
    const thisNode = this.findDOMNode();
    if (thisNode) {
      const {
        ownerDocument
      } = thisNode;
      (0, _domFns.removeEvent)(ownerDocument, eventsFor.mouse.move, this.handleDrag);
      (0, _domFns.removeEvent)(ownerDocument, eventsFor.touch.move, this.handleDrag);
      (0, _domFns.removeEvent)(ownerDocument, eventsFor.mouse.stop, this.handleDragStop);
      (0, _domFns.removeEvent)(ownerDocument, eventsFor.touch.stop, this.handleDragStop);
      (0, _domFns.removeEvent)(thisNode, eventsFor.touch.start, this.onTouchStart, {
        passive: false
      });
      if (this.props.enableUserSelectHack) (0, _domFns.removeUserSelectStyles)(ownerDocument);
    }
  }
  // React Strict Mode compatibility: if `nodeRef` is passed, we will use it instead of trying to find
  // the underlying DOM node ourselves. See the README for more information.
  findDOMNode() {
    var _this$props, _this$props2;
    return (_this$props = this.props) !== null && _this$props !== void 0 && _this$props.nodeRef ? (_this$props2 = this.props) === null || _this$props2 === void 0 || (_this$props2 = _this$props2.nodeRef) === null || _this$props2 === void 0 ? void 0 : _this$props2.current : _reactDom.default.findDOMNode(this);
  }
  render() {
    return /* @__PURE__ */ React.cloneElement(React.Children.only(this.props.children), {
      // Note: mouseMove handler is attached to document so it will still function
      // when the user drags quickly and leaves the bounds of the element.
      onMouseDown: this.onMouseDown,
      onMouseUp: this.onMouseUp,
      // onTouchStart is added on `componentDidMount` so they can be added with
      // {passive: false}, which allows it to cancel. See
      // https://developers.google.com/web/updates/2017/01/scrolling-intervention
      onTouchEnd: this.onTouchEnd
    });
  }
};
DraggableCore$2.default = DraggableCore$1;
_defineProperty(DraggableCore$1, "displayName", "DraggableCore");
_defineProperty(DraggableCore$1, "propTypes", {
  /**
   * `allowAnyClick` allows dragging using any mouse button.
   * By default, we only accept the left button.
   *
   * Defaults to `false`.
   */
  allowAnyClick: _propTypes.default.bool,
  children: _propTypes.default.node.isRequired,
  /**
   * `disabled`, if true, stops the <Draggable> from dragging. All handlers,
   * with the exception of `onMouseDown`, will not fire.
   */
  disabled: _propTypes.default.bool,
  /**
   * By default, we add 'user-select:none' attributes to the document body
   * to prevent ugly text selection during drag. If this is causing problems
   * for your app, set this to `false`.
   */
  enableUserSelectHack: _propTypes.default.bool,
  /**
   * `offsetParent`, if set, uses the passed DOM node to compute drag offsets
   * instead of using the parent node.
   */
  offsetParent: function(props, propName) {
    if (props[propName] && props[propName].nodeType !== 1) {
      throw new Error("Draggable's offsetParent must be a DOM Node.");
    }
  },
  /**
   * `grid` specifies the x and y that dragging should snap to.
   */
  grid: _propTypes.default.arrayOf(_propTypes.default.number),
  /**
   * `handle` specifies a selector to be used as the handle that initiates drag.
   *
   * Example:
   *
   * ```jsx
   *   let App = React.createClass({
   *       render: function () {
   *         return (
   *            <Draggable handle=".handle">
   *              <div>
   *                  <div className="handle">Click me to drag</div>
   *                  <div>This is some other content</div>
   *              </div>
   *           </Draggable>
   *         );
   *       }
   *   });
   * ```
   */
  handle: _propTypes.default.string,
  /**
   * `cancel` specifies a selector to be used to prevent drag initialization.
   *
   * Example:
   *
   * ```jsx
   *   let App = React.createClass({
   *       render: function () {
   *           return(
   *               <Draggable cancel=".cancel">
   *                   <div>
   *                     <div className="cancel">You can't drag from here</div>
   *                     <div>Dragging here works fine</div>
   *                   </div>
   *               </Draggable>
   *           );
   *       }
   *   });
   * ```
   */
  cancel: _propTypes.default.string,
  /* If running in React Strict mode, ReactDOM.findDOMNode() is deprecated.
   * Unfortunately, in order for <Draggable> to work properly, we need raw access
   * to the underlying DOM node. If you want to avoid the warning, pass a `nodeRef`
   * as in this example:
   *
   * function MyComponent() {
   *   const nodeRef = React.useRef(null);
   *   return (
   *     <Draggable nodeRef={nodeRef}>
   *       <div ref={nodeRef}>Example Target</div>
   *     </Draggable>
   *   );
   * }
   *
   * This can be used for arbitrarily nested components, so long as the ref ends up
   * pointing to the actual child DOM node and not a custom component.
   */
  nodeRef: _propTypes.default.object,
  /**
   * Called when dragging starts.
   * If this function returns the boolean false, dragging will be canceled.
   */
  onStart: _propTypes.default.func,
  /**
   * Called while dragging.
   * If this function returns the boolean false, dragging will be canceled.
   */
  onDrag: _propTypes.default.func,
  /**
   * Called when dragging stops.
   * If this function returns the boolean false, the drag will remain active.
   */
  onStop: _propTypes.default.func,
  /**
   * A workaround option which can be passed if onMouseDown needs to be accessed,
   * since it'll always be blocked (as there is internal use of onMouseDown)
   */
  onMouseDown: _propTypes.default.func,
  /**
   * `scale`, if set, applies scaling while dragging an element
   */
  scale: _propTypes.default.number,
  /**
   * These properties should be defined on the child, not here.
   */
  className: _shims.dontSetMe,
  style: _shims.dontSetMe,
  transform: _shims.dontSetMe
});
_defineProperty(DraggableCore$1, "defaultProps", {
  allowAnyClick: false,
  // by default only accept left click
  disabled: false,
  enableUserSelectHack: true,
  onStart: function() {
  },
  onDrag: function() {
  },
  onStop: function() {
  },
  onMouseDown: function() {
  },
  scale: 1
});
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "DraggableCore", {
    enumerable: true,
    get: function() {
      return _DraggableCore.default;
    }
  });
  exports.default = void 0;
  var React2 = _interopRequireWildcard2(reactExports);
  var _propTypes2 = _interopRequireDefault2(propTypesExports);
  var _reactDom2 = _interopRequireDefault2(reactDomExports);
  var _clsx = _interopRequireDefault2(require$$3);
  var _domFns2 = domFns;
  var _positionFns2 = positionFns;
  var _shims2 = shims;
  var _DraggableCore = _interopRequireDefault2(DraggableCore$2);
  var _log2 = _interopRequireDefault2(log$1);
  function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _getRequireWildcardCache2(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache2 = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard2(obj, nodeInterop) {
    if (obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache2(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
  function _extends2() {
    _extends2 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends2.apply(this, arguments);
  }
  function _defineProperty2(obj, key, value) {
    key = _toPropertyKey2(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey2(arg) {
    var key = _toPrimitive2(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive2(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  class Draggable2 extends React2.Component {
    // React 16.3+
    // Arity (props, state)
    static getDerivedStateFromProps(_ref, _ref2) {
      let {
        position
      } = _ref;
      let {
        prevPropsPosition
      } = _ref2;
      if (position && (!prevPropsPosition || position.x !== prevPropsPosition.x || position.y !== prevPropsPosition.y)) {
        (0, _log2.default)("Draggable: getDerivedStateFromProps %j", {
          position,
          prevPropsPosition
        });
        return {
          x: position.x,
          y: position.y,
          prevPropsPosition: {
            ...position
          }
        };
      }
      return null;
    }
    constructor(props) {
      super(props);
      _defineProperty2(this, "onDragStart", (e, coreData) => {
        (0, _log2.default)("Draggable: onDragStart: %j", coreData);
        const shouldStart = this.props.onStart(e, (0, _positionFns2.createDraggableData)(this, coreData));
        if (shouldStart === false) return false;
        this.setState({
          dragging: true,
          dragged: true
        });
      });
      _defineProperty2(this, "onDrag", (e, coreData) => {
        if (!this.state.dragging) return false;
        (0, _log2.default)("Draggable: onDrag: %j", coreData);
        const uiData = (0, _positionFns2.createDraggableData)(this, coreData);
        const newState = {
          x: uiData.x,
          y: uiData.y,
          slackX: 0,
          slackY: 0
        };
        if (this.props.bounds) {
          const {
            x,
            y
          } = newState;
          newState.x += this.state.slackX;
          newState.y += this.state.slackY;
          const [newStateX, newStateY] = (0, _positionFns2.getBoundPosition)(this, newState.x, newState.y);
          newState.x = newStateX;
          newState.y = newStateY;
          newState.slackX = this.state.slackX + (x - newState.x);
          newState.slackY = this.state.slackY + (y - newState.y);
          uiData.x = newState.x;
          uiData.y = newState.y;
          uiData.deltaX = newState.x - this.state.x;
          uiData.deltaY = newState.y - this.state.y;
        }
        const shouldUpdate = this.props.onDrag(e, uiData);
        if (shouldUpdate === false) return false;
        this.setState(newState);
      });
      _defineProperty2(this, "onDragStop", (e, coreData) => {
        if (!this.state.dragging) return false;
        const shouldContinue = this.props.onStop(e, (0, _positionFns2.createDraggableData)(this, coreData));
        if (shouldContinue === false) return false;
        (0, _log2.default)("Draggable: onDragStop: %j", coreData);
        const newState = {
          dragging: false,
          slackX: 0,
          slackY: 0
        };
        const controlled = Boolean(this.props.position);
        if (controlled) {
          const {
            x,
            y
          } = this.props.position;
          newState.x = x;
          newState.y = y;
        }
        this.setState(newState);
      });
      this.state = {
        // Whether or not we are currently dragging.
        dragging: false,
        // Whether or not we have been dragged before.
        dragged: false,
        // Current transform x and y.
        x: props.position ? props.position.x : props.defaultPosition.x,
        y: props.position ? props.position.y : props.defaultPosition.y,
        prevPropsPosition: {
          ...props.position
        },
        // Used for compensating for out-of-bounds drags
        slackX: 0,
        slackY: 0,
        // Can only determine if SVG after mounting
        isElementSVG: false
      };
      if (props.position && !(props.onDrag || props.onStop)) {
        console.warn("A `position` was applied to this <Draggable>, without drag handlers. This will make this component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the `position` of this element.");
      }
    }
    componentDidMount() {
      if (typeof window.SVGElement !== "undefined" && this.findDOMNode() instanceof window.SVGElement) {
        this.setState({
          isElementSVG: true
        });
      }
    }
    componentWillUnmount() {
      this.setState({
        dragging: false
      });
    }
    // React Strict Mode compatibility: if `nodeRef` is passed, we will use it instead of trying to find
    // the underlying DOM node ourselves. See the README for more information.
    findDOMNode() {
      var _this$props$nodeRef$c, _this$props;
      return (_this$props$nodeRef$c = (_this$props = this.props) === null || _this$props === void 0 || (_this$props = _this$props.nodeRef) === null || _this$props === void 0 ? void 0 : _this$props.current) !== null && _this$props$nodeRef$c !== void 0 ? _this$props$nodeRef$c : _reactDom2.default.findDOMNode(this);
    }
    render() {
      const {
        axis,
        bounds,
        children,
        defaultPosition,
        defaultClassName,
        defaultClassNameDragging,
        defaultClassNameDragged,
        position,
        positionOffset,
        scale,
        ...draggableCoreProps
      } = this.props;
      let style = {};
      let svgTransform = null;
      const controlled = Boolean(position);
      const draggable = !controlled || this.state.dragging;
      const validPosition = position || defaultPosition;
      const transformOpts = {
        // Set left if horizontal drag is enabled
        x: (0, _positionFns2.canDragX)(this) && draggable ? this.state.x : validPosition.x,
        // Set top if vertical drag is enabled
        y: (0, _positionFns2.canDragY)(this) && draggable ? this.state.y : validPosition.y
      };
      if (this.state.isElementSVG) {
        svgTransform = (0, _domFns2.createSVGTransform)(transformOpts, positionOffset);
      } else {
        style = (0, _domFns2.createCSSTransform)(transformOpts, positionOffset);
      }
      const className = (0, _clsx.default)(children.props.className || "", defaultClassName, {
        [defaultClassNameDragging]: this.state.dragging,
        [defaultClassNameDragged]: this.state.dragged
      });
      return /* @__PURE__ */ React2.createElement(_DraggableCore.default, _extends2({}, draggableCoreProps, {
        onStart: this.onDragStart,
        onDrag: this.onDrag,
        onStop: this.onDragStop
      }), /* @__PURE__ */ React2.cloneElement(React2.Children.only(children), {
        className,
        style: {
          ...children.props.style,
          ...style
        },
        transform: svgTransform
      }));
    }
  }
  exports.default = Draggable2;
  _defineProperty2(Draggable2, "displayName", "Draggable");
  _defineProperty2(Draggable2, "propTypes", {
    // Accepts all props <DraggableCore> accepts.
    ..._DraggableCore.default.propTypes,
    /**
     * `axis` determines which axis the draggable can move.
     *
     *  Note that all callbacks will still return data as normal. This only
     *  controls flushing to the DOM.
     *
     * 'both' allows movement horizontally and vertically.
     * 'x' limits movement to horizontal axis.
     * 'y' limits movement to vertical axis.
     * 'none' limits all movement.
     *
     * Defaults to 'both'.
     */
    axis: _propTypes2.default.oneOf(["both", "x", "y", "none"]),
    /**
     * `bounds` determines the range of movement available to the element.
     * Available values are:
     *
     * 'parent' restricts movement within the Draggable's parent node.
     *
     * Alternatively, pass an object with the following properties, all of which are optional:
     *
     * {left: LEFT_BOUND, right: RIGHT_BOUND, bottom: BOTTOM_BOUND, top: TOP_BOUND}
     *
     * All values are in px.
     *
     * Example:
     *
     * ```jsx
     *   let App = React.createClass({
     *       render: function () {
     *         return (
     *            <Draggable bounds={{right: 300, bottom: 300}}>
     *              <div>Content</div>
     *           </Draggable>
     *         );
     *       }
     *   });
     * ```
     */
    bounds: _propTypes2.default.oneOfType([_propTypes2.default.shape({
      left: _propTypes2.default.number,
      right: _propTypes2.default.number,
      top: _propTypes2.default.number,
      bottom: _propTypes2.default.number
    }), _propTypes2.default.string, _propTypes2.default.oneOf([false])]),
    defaultClassName: _propTypes2.default.string,
    defaultClassNameDragging: _propTypes2.default.string,
    defaultClassNameDragged: _propTypes2.default.string,
    /**
     * `defaultPosition` specifies the x and y that the dragged item should start at
     *
     * Example:
     *
     * ```jsx
     *      let App = React.createClass({
     *          render: function () {
     *              return (
     *                  <Draggable defaultPosition={{x: 25, y: 25}}>
     *                      <div>I start with transformX: 25px and transformY: 25px;</div>
     *                  </Draggable>
     *              );
     *          }
     *      });
     * ```
     */
    defaultPosition: _propTypes2.default.shape({
      x: _propTypes2.default.number,
      y: _propTypes2.default.number
    }),
    positionOffset: _propTypes2.default.shape({
      x: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
      y: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string])
    }),
    /**
     * `position`, if present, defines the current position of the element.
     *
     *  This is similar to how form elements in React work - if no `position` is supplied, the component
     *  is uncontrolled.
     *
     * Example:
     *
     * ```jsx
     *      let App = React.createClass({
     *          render: function () {
     *              return (
     *                  <Draggable position={{x: 25, y: 25}}>
     *                      <div>I start with transformX: 25px and transformY: 25px;</div>
     *                  </Draggable>
     *              );
     *          }
     *      });
     * ```
     */
    position: _propTypes2.default.shape({
      x: _propTypes2.default.number,
      y: _propTypes2.default.number
    }),
    /**
     * These properties should be defined on the child, not here.
     */
    className: _shims2.dontSetMe,
    style: _shims2.dontSetMe,
    transform: _shims2.dontSetMe
  });
  _defineProperty2(Draggable2, "defaultProps", {
    ..._DraggableCore.default.defaultProps,
    axis: "both",
    bounds: false,
    defaultClassName: "react-draggable",
    defaultClassNameDragging: "react-draggable-dragging",
    defaultClassNameDragged: "react-draggable-dragged",
    defaultPosition: {
      x: 0,
      y: 0
    },
    scale: 1
  });
})(Draggable$2);
const {
  default: Draggable,
  DraggableCore: DraggableCore2
} = Draggable$2;
cjs.exports = Draggable;
cjs.exports.default = Draggable;
cjs.exports.DraggableCore = DraggableCore2;
var cjsExports = cjs.exports;
const Draggable$1 = /* @__PURE__ */ getDefaultExportFromCjs(cjsExports);
const PaperComponent = (props) => {
  return /* @__PURE__ */ jsx(Draggable$1, { handle: "#draggable-dialog-title", cancel: '[class*="MuiDialogContent-root"]', children: /* @__PURE__ */ jsx(Paper, { ...props }) });
};
const GlassDialog = reactExports.forwardRef(({
  open,
  closeModal,
  children,
  ...props
}, ref) => {
  const theme = useTheme();
  return /* @__PURE__ */ jsx(Dialog, { ...props, ref, open, onClose: closeModal, maxWidth: "md", TransitionComponent: Grow, PaperComponent, "aria-labelledby": "draggable-dialog-title", PaperProps: {
    sx: {
      backdropFilter: "blur(16px) saturate(200%)",
      backgroundColor: theme.glassCard.backgroundColor,
      border: theme.glassCard.border,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      borderRadius: "20px",
      boxShadow: theme.palette.mode === "light" ? "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)" : "unset",
      backgroundClip: "border-box"
    }
  }, children });
});
export {
  Clear$1 as C,
  DialogTitle as D,
  GlassDialog as G,
  PropTypes as P,
  DialogContent as a,
  DialogActions as b,
  default_1$1 as c,
  default_1 as d,
  Dialog as e,
  dialogClasses as f
};
