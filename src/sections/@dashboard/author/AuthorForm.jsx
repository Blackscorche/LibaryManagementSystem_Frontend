import { Box, Button, Container, Modal, Stack, TextField, Typography, Avatar } from "@mui/material";
import { useState } from "react";
import PropTypes from "prop-types";
import Iconify from "../../../components/iconify";

const AuthorForm = ({
  isUpdateForm,
  isModalOpen,
  handleCloseModal,
  author,
  setAuthor,
  handleAddAuthor,
  handleUpdateAuthor
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', author.name);
    formData.append('description', author.description);

    if (selectedFile) {
      formData.append('photoUrl', selectedFile);
    }

    if (isUpdateForm) {
      handleUpdateAuthor(formData);
    } else {
      handleAddAuthor(formData);
    }

    // Reset file state
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    handleCloseModal();
  };

  // Get display photo URL
  const getPhotoUrl = () => {
    if (previewUrl) return previewUrl;
    if (author.photoUrl) {
      // Handle both object and string formats
      if (typeof author.photoUrl === 'object') {
        return author.photoUrl.url;
      }
      return author.photoUrl;
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author.name || 'Author')}`;
  };

  return (
    <Modal
      open={isModalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Container>
          <Typography variant="h4" textAlign="center" paddingBottom={2} paddingTop={1}>
            {isUpdateForm ? 'Update' : 'Add'} author
          </Typography>
          <Stack spacing={3} paddingY={2}>

            {/* Photo Preview */}
            <Box textAlign="center">
              <Avatar
                alt={author.name || 'Author'}
                src={getPhotoUrl()}
                sx={{ width: 100, height: 100, margin: '0 auto' }}
              />
            </Box>

            <TextField
              name="name"
              label="Author name"
              value={author.name || ''}
              autoFocus
              required
              onChange={(e) => setAuthor({
                ...author,
                name: e.target.value
              })}
            />

            <TextField
              name="description"
              label="Description"
              value={author.description || ''}
              multiline
              rows={4}
              onChange={(e) => setAuthor({
                ...author,
                description: e.target.value
              })}
            />

            <Button
              size="large"
              variant="outlined"
              component="label"
              color="info"
              startIcon={<Iconify icon="eva:camera-fill" />}
            >
              {selectedFile ? 'Change Photo' : 'Upload Photo'}
              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                hidden
                onChange={handleFileChange}
              />
            </Button>

            {selectedFile && (
              <Typography variant="caption" color="success.main" textAlign="center">
                ✓ Photo selected: {selectedFile.name}
              </Typography>
            )}

            <br />
            <Box textAlign="center">
              <Button
                size="large"
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Iconify icon="bi:check-lg" />}
                style={{ marginRight: "12px" }}
                disabled={!author.name}
              >
                Submit
              </Button>

              <Button
                size="large"
                color="inherit"
                variant="contained"
                onClick={handleClose}
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

AuthorForm.propTypes = {
  isUpdateForm: PropTypes.bool,
  isModalOpen: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  author: PropTypes.object,
  setAuthor: PropTypes.func,
  handleAddAuthor: PropTypes.func,
  handleUpdateAuthor: PropTypes.func
};

export default AuthorForm;