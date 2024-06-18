import Backdrop from "@mui/material/Backdrop";
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  LinearProgress,
  OutlinedInput,
  Stack,
} from "@mui/material";
import { CloudUploadOutlined } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { styled } from "@mui/material/styles";
import { uploadMusic } from "@/lib/firebase/storage";
import { useState } from "react";

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

const VisuallyHiddenInput = styled("input")({
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function UploadModal(props: {
  open: boolean;
  onClose: () => void;
}) {
  const validationSchema = yup.object({
    musicName: yup.string().required("Music Name is required"),
    file: yup.mixed().required("File is required"),
  });

  const [progress, setProgress] = useState<number>(0);

  const formik = useFormik({
    initialValues: {
      musicName: "",
      file: new File([], "None"),
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      uploadMusic(
        values.musicName,
        values.file,
        (state) =>
          setProgress((state.bytesTransferred / state.totalBytes) * 100),
        () => props.onClose(),
      );
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
                Upload
              </Typography>

              <FormControl
                required
                error={formik.touched.file && Boolean(formik.errors.file)}
              >
                <Button
                  component="label"
                  variant="outlined"
                  role={undefined}
                  startIcon={<CloudUploadOutlined />}
                >
                  Upload File
                  <VisuallyHiddenInput
                    type="file"
                    onChange={(event: any) => {
                      formik.setFieldValue(
                        "file",
                        event.currentTarget.files[0],
                      );
                      formik.setFieldValue(
                        "musicName",
                        event.currentTarget.files[0]
                          ? event.currentTarget.files[0].name
                          : "",
                      );
                    }}
                  />
                </Button>

                <FormHelperText>
                  {formik.touched.file && formik.errors.file?.name}
                </FormHelperText>
              </FormControl>

              <FormControl
                required
                error={
                  formik.touched.musicName && Boolean(formik.errors.musicName)
                }
              >
                <InputLabel htmlFor="musicName">Music Name</InputLabel>
                <OutlinedInput
                  value={formik.values.musicName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  id="musicName"
                  label="Music Name"
                  type="text"
                />
                <FormHelperText>
                  {formik.touched.musicName && formik.errors.musicName}
                </FormHelperText>
              </FormControl>

              <LinearProgress variant="determinate" value={progress} />

              <Button variant="outlined" type="submit">
                Upload
              </Button>
            </Stack>
          </Container>
        </Fade>
      </Modal>
    </div>
  );
}
