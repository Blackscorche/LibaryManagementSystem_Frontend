import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Modal,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  Avatar
} from "@mui/material";
import PropTypes from "prop-types";
import { useState } from "react";
import Iconify from "../../../components/iconify";

const UserForm = ({
  isUpdateForm,
  isModalOpen,
  handleCloseModal,
  user,
  setUser,
  handleAddUser,
  handleUpdateUser
}) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'white',
    borderRadius: '20px',
    boxShadow: 16,
    p: 4,
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();

    formData.append('name', user.name || '');
    formData.append('dob', user.dob || '');
    formData.append('email', user.email || '');
    formData.append('phone', user.phone || '');
    formData.append('isAdmin', user.isAdmin || false);

    if (user.password) {
      formData.append('password', user.password);
    }

    if (photoFile) {
      formData.append('photoUrl', photoFile);
    }

    if (isUpdateForm) {
      handleUpdateUser(formData);
    } else {
      handleAddUser(formData);
    }

    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const getPhotoDisplay = () => {
    if (photoPreview) return photoPreview;
    if (user.photoUrl?.url) return user.photoUrl.url;
    if (typeof user.photoUrl === 'string') return user.photoUrl;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`;
  };

  return (
    <Modal
      open={isModalOpen}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Container>
          <Typography variant="h4" textAlign="center" paddingBottom={2} paddingTop={1}>
            {isUpdateForm ? <span>Update</span> : <span>Add</span>} user
          </Typography>
          <Stack spacing={3} paddingY={2}>
            <Box textAlign="center">
              <Avatar
                src={getPhotoDisplay()}
                alt={user.name}
                sx={{ width: 100, height: 100, margin: '0 auto', mb: 2 }}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<Iconify icon="eva:camera-fill" />}
              >
                Upload Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>
            </Box>

            <Grid container spacing={0}>
              <Grid item xs={12} md={8} paddingRight={1}>
                <TextField
                  fullWidth
                  name="name"
                  label="Name"
                  value={user.name}
                  autoFocus
                  required
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4} paddingLeft={1}>
                <TextField
                  fullWidth
                  name="dob"
                  label="Date of Birth"
                  type="date"
                  value={user.dob}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setUser({ ...user, dob: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={0} sx={{ paddingBottom: "4px" }}>
              <Grid item xs={12} md={6} paddingRight={1}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={user.email}
                  required
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6} paddingLeft={1}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone"
                  type="tel"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
              </Grid>
            </Grid>

            <FormControl>
              <FormLabel id="available-label" sx={{ textAlign: "center" }}>User role</FormLabel>
              <RadioGroup
                sx={{ paddingTop: "10px" }}
                aria-labelledby="available-label"
                value={user.isAdmin}
                name="radio-buttons-group"
                onChange={(e) => setUser({ ...user, isAdmin: e.target.value === 'true' })}
              >
                <Grid container spacing={0}>
                  <Grid item xs={12} md={6} paddingRight={1}>
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Librarian"
                      sx={{ textAlign: "center", justifyContent: "center", width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} paddingLeft={1}>
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="Member"
                      sx={{ textAlign: "center", justifyContent: "center", width: "100%" }}
                    />
                  </Grid>
                </Grid>
              </RadioGroup>
            </FormControl>

            <TextField
              name="password"
              type="password"
              label={isUpdateForm ? "Password (leave blank to keep current)" : "Password"}
              value={user.password}
              {...(!isUpdateForm && { required: true })}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />

            <br />
            <Box textAlign="center">
              <Button
                size="large"
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Iconify icon="bi:check-lg" />}
                style={{ marginRight: "12px" }}
              >
                Submit
              </Button>

              <Button
                size="large"
                color="inherit"
                variant="contained"
                onClick={handleCloseModal}
                startIcon={<Iconify icon="charm:cross" />}
                style={{ marginLeft: "12px" }}
              >
                Cancel
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Modal>
  );
}

UserForm.propTypes = {
  isUpdateForm: PropTypes.bool,
  isModalOpen: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  user: PropTypes.object,
  setUser: PropTypes.func,
  handleAddUser: PropTypes.func,
  handleUpdateUser: PropTypes.func
};

export default UserForm;
