import { W, j as jsxs, a as jsx, Y, b as ae } from "./app-BxPs6nv_.js";
import { G as Grid, l as logo, T as Typography, c as Grow, C as Card, a as CardContent, B as Box, b as Container, A as App } from "./App-DT6Mg_2K.js";
import { T as TextField } from "./TextField-4YnViUBt.js";
import { L as LoadingButton } from "./LoadingButton-ZNPQ7tkS.js";
import "./Select-DJLxoTFW.js";
import "./CircularProgress-CmXKJJKz.js";
function ForgotPassword({
  status
}) {
  const {
    data,
    setData,
    post,
    processing,
    errors
  } = W({
    email: "",
    otp: "",
    newPassword: ""
  });
  console.log(status);
  console.log(post);
  const handleChange = (field, value) => {
    setData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(errors);
    post(route("password.email"), {
      email: data.email
    }).then((response) => {
      console.log("Password reset link sent to ", data.email);
    }).catch((error) => {
      console.error("Password update failed:", error);
    }).finally(() => {
      setProcessing(false);
    });
  };
  return /* @__PURE__ */ jsxs(App, { children: [
    /* @__PURE__ */ jsx(Y, { title: "Forgot Password" }),
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
        bg: mode("#ffffff", "navy.800"),
        boxShadow: mode("14px 17px 40px 4px rgba(112, 144, 176, 0.08)", "unset"),
        backgroundClip: "border-box"
      }, children: /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx(Box, { textAlign: "center", children: /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "text.secondary", children: "Please enter your email" }) }),
        /* @__PURE__ */ jsx(Box, { mt: 4, children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsx(Box, { mb: 3, children: /* @__PURE__ */ jsx(TextField, { label: "Email adrress", variant: "outlined", type: "email", id: "email", name: "email", value: data.email, onChange: (e) => handleChange("email", e.target.value), required: true, fullWidth: true, error: !!errors.email, helperText: errors.email }) }),
          /* @__PURE__ */ jsx(Box, { mt: 4, children: /* @__PURE__ */ jsx(LoadingButton, { fullWidth: true, variant: "contained", color: "primary", type: "submit", loading: processing, children: "Reset Password" }) })
        ] }) })
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
  ForgotPassword as default
};
