import { r as reactExports, W, j as jsxs, a as jsx, Y } from "./app-BxPs6nv_.js";
import { d as default_1, a as default_1$1 } from "./VisibilityOff-BfL7cQew.js";
import { B as Box, G as Grid, T as Typography, C as Card, a as CardContent, I as IconButton, b as Container, A as App } from "./App-DT6Mg_2K.js";
import { T as TextField } from "./TextField-4YnViUBt.js";
import { I as InputAdornment } from "./InputAdornment-Ki57Td_k.js";
import { L as LoadingButton } from "./LoadingButton-ZNPQ7tkS.js";
import "./Select-DJLxoTFW.js";
import "./CircularProgress-CmXKJJKz.js";
function ConfirmPassword() {
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const {
    data,
    setData,
    post,
    processing,
    errors,
    reset
  } = W({
    password: ""
  });
  reactExports.useEffect(() => {
    return () => {
      reset("password");
    };
  }, []);
  const submit = (e) => {
    e.preventDefault();
    post(route("password.confirm"));
  };
  return /* @__PURE__ */ jsxs(App, { children: [
    /* @__PURE__ */ jsx(Y, { title: "Confirm Password" }),
    /* @__PURE__ */ jsx(Container, { maxWidth: "sm", children: /* @__PURE__ */ jsx(Box, { sx: {
      display: "flex",
      justifyContent: "center",
      p: 2
    }, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, justifyContent: "center", children: [
      /* @__PURE__ */ jsxs(Grid, { item: true, xs: 12, textAlign: "center", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "h5", color: "primary", children: "Confirm Password" }),
        /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "text.secondary", className: "mb-4", children: "This is a secure area of the application. Please confirm your password before continuing." })
      ] }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
        /* @__PURE__ */ jsx(Box, { mb: 3, children: /* @__PURE__ */ jsx(TextField, { label: "Password", variant: "outlined", type: showPassword ? "text" : "password", id: "password", name: "password", value: data.password, onChange: (e) => setData("password", e.target.value), required: true, fullWidth: true, error: !!errors.password, helperText: errors.password, InputProps: {
          endAdornment: /* @__PURE__ */ jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsx(IconButton, { "aria-label": "toggle password visibility", onClick: () => setShowPassword(!showPassword), onMouseDown: (e) => e.preventDefault(), edge: "end", children: showPassword ? /* @__PURE__ */ jsx(default_1, {}) : /* @__PURE__ */ jsx(default_1$1, {}) }) })
        } }) }),
        /* @__PURE__ */ jsx(Box, { mt: 4, display: "flex", justifyContent: "flex-end", children: /* @__PURE__ */ jsx(LoadingButton, { variant: "contained", color: "primary", type: "submit", loading: processing, children: "Confirm" }) })
      ] }) }) }) })
    ] }) }) })
  ] });
}
export {
  ConfirmPassword as default
};
