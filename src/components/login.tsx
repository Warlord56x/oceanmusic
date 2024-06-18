import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { signInWithEmail } from "@/lib/firebase/auth";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function LoginModal(props: {
  open: boolean;
  onClose: () => void;
}) {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  const validationSchema = yup.object({
    email: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: yup
      .string()
      .min(8, "Password should be of minimum 8 characters length")
      .required("Password is required"),
    additionalError: yup.string().test({
      name: "Firebase-validator",
      skipAbsent: true,
      test(value, ctx) {
        if (value?.length !== 0) {
          return ctx.createError({ message: value });
        }
        return true;
      },
    }),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      additionalError: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await signInWithEmail(values.email, values.password).then(() => {
          props.onClose();
        });
      } catch (error) {
        await formik.setFieldValue("additionalError", error);
      }
    },
  });

  return (
    <div>
      <Modal
        open={props.open}
        onClose={props.onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={props.open}>
          <Container component="form" sx={style} onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              <Typography variant="h6" component="h2">
                Login
              </Typography>

              <FormControl
                required
                error={formik.touched.email && Boolean(formik.errors.email)}
              >
                <InputLabel htmlFor="email">Email</InputLabel>
                <OutlinedInput
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  id="email"
                  label="Email"
                  autoComplete="current-email"
                />

                <FormHelperText>
                  {formik.touched.email && formik.errors.email}
                </FormHelperText>
              </FormControl>

              <FormControl
                required
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
              >
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  id="password"
                  label="Password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <FormHelperText>
                  {formik.touched.password && formik.errors.password}
                </FormHelperText>
              </FormControl>

              <Button variant="outlined" type="submit">
                Login
              </Button>
            </Stack>
          </Container>
        </Fade>
      </Modal>
    </div>
  );
}
