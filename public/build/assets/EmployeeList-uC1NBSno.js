import { c as jsxRuntimeExports, r as reactExports, a as jsx, j as jsxs, b as ae, F as Fragment, Y } from "./app-BjPDCRlK.js";
import { j as createSvgIcon, y as useTheme, z as Avatar, T as Typography, M as MenuItem, I as IconButton, D as AccountCircle, E as B, c as Grow, H as GlassCard, J as CardHeader, B as Box, d as Button, a as CardContent, A as App } from "./App-BnBiQk5p.js";
import { T as TableHead, a as TableRow, b as TableCell, c as TableBody, d as Table } from "./TableRow-emDU3yDK.js";
import { F as FormControl, I as InputLabel, S as Select } from "./Select-B-1VtThS.js";
import { T as TableContainer } from "./TableContainer-Cr0gzegT.js";
import { C as CircularProgress } from "./CircularProgress-CHG2eKFu.js";
import { A as Add } from "./Add-DSkIzBBT.js";
const Delete = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"
}), "Delete");
const Edit = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"
}), "Edit");
const EmployeeTable = ({
  allUsers,
  departments,
  designations
}) => {
  const [users, setUsers] = reactExports.useState(allUsers);
  console.log(users);
  const theme = useTheme();
  console.log(theme);
  const [anchorEls, setAnchorEls] = reactExports.useState({});
  async function handleChange(key, id, event) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const newValue = event.target.value;
        const response = await fetch(route("profile.update"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify({
            id,
            [key]: newValue
            // Add other fields here as needed, only if they have changed
          })
        });
        const data = await response.json();
        if (response.ok) {
          setUsers((prevUsers) => prevUsers.map((user) => {
            if (user.id === id) {
              const updatedUser = {
                ...user
              };
              if (key === "department" && user.department !== newValue) {
                updatedUser.designation = null;
              }
              updatedUser[key] = newValue;
              return updatedUser;
            }
            return user;
          }));
          resolve([...data.messages]);
          console.log(data.messages);
        } else {
          reject(data.messages);
          console.error(data.messages);
        }
      } catch (error) {
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
            /* @__PURE__ */ jsxs("span", { style: {
              marginLeft: "8px"
            }, children: [
              "Updating employee ",
              key,
              "..."
            ] })
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
  const handleDelete = async (userId) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(route("profile.delete"), {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content
          },
          body: JSON.stringify({
            user_id: userId
          })
        });
        const data = await response.json();
        if (response.ok) {
          setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
          resolve([data.message]);
        } else {
          reject([data.message]);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        reject(["An error occurred while deleting user. Please try again."]);
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
            }, children: "Deleting user..." })
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
  };
  const handleClose = (id) => {
    setAnchorEls((prev) => ({
      ...prev,
      [id]: null
    }));
  };
  return /* @__PURE__ */ jsx(TableContainer, { style: {
    maxHeight: "70vh",
    overflowY: "auto"
  }, children: /* @__PURE__ */ jsxs(Table, { "aria-label": "employee table", children: [
    /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
      /* @__PURE__ */ jsx(TableCell, { sx: {
        whiteSpace: "nowrap"
      }, children: "Employee ID" }),
      /* @__PURE__ */ jsx(TableCell, { sx: {
        whiteSpace: "nowrap"
      }, children: "Name" }),
      /* @__PURE__ */ jsx(TableCell, { sx: {
        whiteSpace: "nowrap"
      }, children: "Email" }),
      /* @__PURE__ */ jsx(TableCell, { sx: {
        whiteSpace: "nowrap"
      }, children: "Mobile" }),
      /* @__PURE__ */ jsx(TableCell, { sx: {
        whiteSpace: "nowrap"
      }, children: "Join Date" }),
      /* @__PURE__ */ jsx(TableCell, { sx: {
        whiteSpace: "nowrap"
      }, children: "Department" }),
      /* @__PURE__ */ jsx(TableCell, { sx: {
        whiteSpace: "nowrap"
      }, children: "Role" }),
      /* @__PURE__ */ jsx(TableCell, { sx: {
        whiteSpace: "nowrap"
      }, align: "right", children: "Action" })
    ] }) }),
    /* @__PURE__ */ jsx(TableBody, { children: users.map((user) => {
      var _a;
      return /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { sx: {
          whiteSpace: "nowrap"
        }, children: user.employee_id || "N/A" }),
        /* @__PURE__ */ jsxs(TableCell, { sx: {
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap"
        }, children: [
          /* @__PURE__ */ jsx(Avatar, { src: `assets/images/users/${user.user_name}.jpg`, alt: user.first_name }),
          /* @__PURE__ */ jsxs(Typography, { sx: {
            marginLeft: "10px"
          }, children: [
            /* @__PURE__ */ jsx(ae, { style: {
              textDecoration: "none",
              color: theme.palette.text.primary,
              fontWeight: "bold"
              // Make text bold
            }, href: route("profile", {
              user: user.id
            }), children: user.name || "N/A" }),
            /* @__PURE__ */ jsx("br", {}),
            ((_a = designations.find((designation) => designation.id === user.designation)) == null ? void 0 : _a.title) || "N/A"
          ] })
        ] }),
        /* @__PURE__ */ jsx(TableCell, { sx: {
          whiteSpace: "nowrap"
        }, children: user.phone || "N/A" }),
        /* @__PURE__ */ jsx(TableCell, { sx: {
          whiteSpace: "nowrap"
        }, children: user.email || "N/A" }),
        /* @__PURE__ */ jsx(TableCell, { sx: {
          whiteSpace: "nowrap"
        }, children: user.date_of_joining || "N/A" }),
        /* @__PURE__ */ jsx(TableCell, { sx: {
          whiteSpace: "nowrap"
        }, children: /* @__PURE__ */ jsxs(FormControl, { size: "small", fullWidth: true, children: [
          /* @__PURE__ */ jsx(InputLabel, { id: "department", children: "Department" }),
          /* @__PURE__ */ jsxs(Select, { labelId: "department", id: `department-select-${user.id}`, value: user.department || "na", onChange: (event) => handleChange("department", user.id, event), label: "Department", MenuProps: {
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
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { sx: {
          whiteSpace: "nowrap"
        }, children: /* @__PURE__ */ jsxs(FormControl, { size: "small", fullWidth: true, children: [
          /* @__PURE__ */ jsx(InputLabel, { id: "designation", children: "Designation" }),
          /* @__PURE__ */ jsxs(Select, { labelId: "designation", id: `designation-select-${user.id}`, value: user.designation || "na", onChange: (event) => handleChange("designation", user.id, event), disabled: !user.department, label: "Designation", MenuProps: {
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
            designations.filter((designation) => designation.department_id === user.department).map((desig) => /* @__PURE__ */ jsx(MenuItem, { value: desig.id, children: desig.title }, desig.id))
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(TableCell, { sx: {
          whiteSpace: "nowrap"
        }, align: "right", children: [
          /* @__PURE__ */ jsx(
            IconButton,
            {
              component: ae,
              href: route("profile", {
                user: user.id
              }),
              onClick: () => {
                handleClose(user.id);
              },
              children: /* @__PURE__ */ jsx(AccountCircle, {})
            }
          ),
          /* @__PURE__ */ jsx(
            IconButton,
            {
              component: ae,
              href: route("profile", {
                user: user.id
              }),
              onClick: () => {
                handleClose(user.id);
              },
              children: /* @__PURE__ */ jsx(Edit, {})
            }
          ),
          /* @__PURE__ */ jsxs(
            IconButton,
            {
              component: ae,
              href: route("profile", {
                user: user.id
              }),
              onClick: () => {
                handleDelete(user.id);
              },
              children: [
                /* @__PURE__ */ jsx(Delete, {}),
                " "
              ]
            }
          )
        ] })
      ] }, user.id);
    }) })
  ] }) });
};
const EmployeesList = ({
  title,
  allUsers,
  departments,
  designations
}) => {
  return /* @__PURE__ */ jsxs(App, { children: [
    /* @__PURE__ */ jsx(Y, { title }),
    /* @__PURE__ */ jsx(Box, { sx: {
      display: "flex",
      justifyContent: "center",
      p: 2
    }, children: /* @__PURE__ */ jsx(Grow, { in: true, children: /* @__PURE__ */ jsxs(GlassCard, { children: [
      /* @__PURE__ */ jsx(CardHeader, { title: "Employees", sx: {
        padding: "24px"
      }, action: /* @__PURE__ */ jsx(Box, { display: "flex", gap: 2, children: /* @__PURE__ */ jsx(Button, { title: "Add Employee", variant: "outlined", color: "success", startIcon: /* @__PURE__ */ jsx(Add, {}), children: "Add Employee" }) }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(EmployeeTable, { allUsers, departments, designations }) })
    ] }) }) })
  ] });
};
export {
  EmployeesList as default
};
