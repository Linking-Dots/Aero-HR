import { W, r as reactExports, j as jsxs, a as jsx, Y, b as ae } from "./app-BjPDCRlK.js";
import { d as default_1, a as default_1$1 } from "./VisibilityOff-DUzddtct.js";
import { G as Grid, l as logo, T as Typography, c as Grow, C as Card, a as CardContent, B as Box, I as IconButton, d as Button, b as Container, A as App } from "./App-BnBiQk5p.js";
import { T as TextField } from "./TextField-kmFI1LFH.js";
import { I as InputAdornment } from "./InputAdornment-BIK5_7zD.js";
import "./Select-B-1VtThS.js";
function Register(props) {
  var _a, _b;
  const {
    data,
    setData,
    post,
    processing,
    errors,
    reset
  } = W({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  reactExports.useEffect(() => {
    return () => {
      reset("password", "password_confirmation");
    };
  }, []);
  const submit = (e) => {
    e.preventDefault();
    post(route("register"));
  };
  const togglePasswordVisibility = (id) => {
    const passwordField = document.getElementById(id);
    passwordField.type = passwordField.type === "password" ? "text" : "password";
  };
  return /* @__PURE__ */ jsxs(App, { children: [
    /* @__PURE__ */ jsx(Y, { title: "Register" }),
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
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 8, lg: 6, xl: 5, children: /* @__PURE__ */ jsx(Grow, { in: true, children: /* @__PURE__ */ jsx(Card, { sx: {
        backdropFilter: "blur(16px) saturate(200%)",
        backgroundColor: "rgba(17, 25, 40, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.125)",
        p: "20px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: "20px",
        minWidth: "0px",
        wordWrap: "break-word",
        bg: mode("#ffffff", "navy.800")(props),
        boxShadow: mode("14px 17px 40px 4px rgba(112, 144, 176, 0.08)", "unset")(props),
        backgroundClip: "border-box"
      }, children: /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxs(Box, { textAlign: "center", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "h5", color: "primary", textAlign: "center", children: "Register" }),
          /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "text.secondary", textAlign: "center", children: "Access to our dashboard" })
        ] }),
        /* @__PURE__ */ jsxs(Box, { mt: 4, children: [
          /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
            /* @__PURE__ */ jsx(Box, { mb: 3, children: /* @__PURE__ */ jsx(TextField, { label: "Email", variant: "outlined", type: "email", id: "email", name: "email", value: data.email, onChange: (e) => setData("email", e.target.value), required: true, fullWidth: true, error: !!errors.email, helperText: errors.email }) }),
            /* @__PURE__ */ jsx(Box, { mb: 3, children: /* @__PURE__ */ jsx(TextField, { label: "Password", variant: "outlined", type: "password", id: "password", name: "password", value: data.password, onChange: (e) => setData("password", e.target.value), required: true, fullWidth: true, error: !!errors.password, helperText: errors.password, InputProps: {
              endAdornment: /* @__PURE__ */ jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsx(IconButton, { "aria-label": "toggle password visibility", onClick: () => togglePasswordVisibility("password"), children: ((_a = document.getElementById("password")) == null ? void 0 : _a.type) === "password" ? /* @__PURE__ */ jsx(default_1, {}) : /* @__PURE__ */ jsx(default_1$1, {}) }) })
            } }) }),
            /* @__PURE__ */ jsx(Box, { mb: 3, children: /* @__PURE__ */ jsx(TextField, { label: "Repeat Password", variant: "outlined", type: "password", id: "repeat-password", name: "password_confirmation", value: data.password_confirmation, onChange: (e) => setData("password_confirmation", e.target.value), required: true, fullWidth: true, error: !!errors.password_confirmation, helperText: errors.password_confirmation, InputProps: {
              endAdornment: /* @__PURE__ */ jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsx(IconButton, { "aria-label": "toggle password visibility", onClick: () => togglePasswordVisibility("repeat-password"), children: ((_b = document.getElementById("repeat-password")) == null ? void 0 : _b.type) === "password" ? /* @__PURE__ */ jsx(default_1, {}) : /* @__PURE__ */ jsx(default_1$1, {}) }) })
            } }) }),
            /* @__PURE__ */ jsx(Box, { mt: 4, children: /* @__PURE__ */ jsx(Button, { fullWidth: true, variant: "contained", color: "primary", type: "submit", disabled: processing, children: "Register" }) })
          ] }),
          /* @__PURE__ */ jsx(Box, { mt: 3, textAlign: "center", children: /* @__PURE__ */ jsxs(Typography, { variant: "body2", children: [
            "Already have an account? ",
            /* @__PURE__ */ jsx(ae, { href: "/login", children: "Login" })
          ] }) })
        ] })
      ] }) }) }) })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { children: /* @__PURE__ */ jsx(Container, { children: /* @__PURE__ */ jsx(Grid, { container: true, justifyContent: "center", children: /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, textAlign: "center", children: /* @__PURE__ */ jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Emam Hosen. Crafted with ",
      /* @__PURE__ */ jsx("i", { className: "mdi mdi-heart text-danger" })
    ] }) }) }) }) })
  ] });
}
export {
  Register as default
};
