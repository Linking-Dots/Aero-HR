import { r as reactExports, j as jsxs, a as jsx, Y, b as ae } from "./app-BxPs6nv_.js";
import { G as Grid, l as logo, T as Typography, c as Grow, C as Card, a as CardContent, B as Box, b as Container, A as App } from "./App-DT6Mg_2K.js";
import { T as TextField } from "./TextField-4YnViUBt.js";
import { L as LoadingButton } from "./LoadingButton-ZNPQ7tkS.js";
import "./Select-DJLxoTFW.js";
import "./CircularProgress-CmXKJJKz.js";
function ForgotPassword({
  status
}) {
  const [data, setData] = reactExports.useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = reactExports.useState({});
  const [processing, setProcessing] = reactExports.useState(false);
  const handleChange = (field, value) => {
    setData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.newPassword !== data.confirmPassword) {
      setErrors({
        confirmPassword: "Passwords do not match"
      });
      return;
    }
    setErrors({});
    setProcessing(true);
    post(route("password.update"), {
      old_password: data.oldPassword,
      new_password: data.newPassword
    }).then((response) => {
      console.log("Password updated successfully");
    }).catch((error) => {
      console.error("Password update failed:", error);
    }).finally(() => {
      setProcessing(false);
    });
  };
  return /* @__PURE__ */ jsxs(App, { children: [
    /* @__PURE__ */ jsx(Y, { title: "Reset Password" }),
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
          /* @__PURE__ */ jsx(Typography, { variant: "h5", color: "primary", children: "Welcome Back!" }),
          /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "text.secondary", children: "Sign in to continue" })
        ] }),
        /* @__PURE__ */ jsxs(Box, { mt: 4, children: [
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsx(Box, { mb: 3, children: /* @__PURE__ */ jsx(TextField, { label: "Old password", variant: "outlined", type: "password", id: "oldPassword", name: "oldPassword", value: data.oldPassword, onChange: (e) => handleChange("oldPassword", e.target.value), required: true, fullWidth: true, error: !!errors.oldPassword, helperText: errors.oldPassword }) }),
            /* @__PURE__ */ jsx(Box, { mb: 3, children: /* @__PURE__ */ jsx(TextField, { label: "New password", variant: "outlined", type: "password", id: "newPassword", name: "newPassword", value: data.newPassword, onChange: (e) => handleChange("newPassword", e.target.value), required: true, fullWidth: true, error: !!errors.newPassword, helperText: errors.newPassword }) }),
            /* @__PURE__ */ jsx(Box, { mb: 3, children: /* @__PURE__ */ jsx(TextField, { label: "Confirm password", variant: "outlined", type: "password", id: "confirmPassword", name: "confirmPassword", value: data.confirmPassword, onChange: (e) => handleChange("confirmPassword", e.target.value), required: true, fullWidth: true, error: !!errors.confirmPassword, helperText: errors.confirmPassword }) }),
            /* @__PURE__ */ jsx(Box, { mt: 4, children: /* @__PURE__ */ jsx(LoadingButton, { fullWidth: true, variant: "contained", color: "primary", type: "submit", loading: processing, children: "Update Password" }) })
          ] }),
          /* @__PURE__ */ jsx(Box, { mt: 3, textAlign: "center", children: /* @__PURE__ */ jsxs(Typography, { variant: "body2", children: [
            "Don't have an account? ",
            /* @__PURE__ */ jsx(ae, { href: "/register", children: "Register" })
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
  ForgotPassword as default
};
