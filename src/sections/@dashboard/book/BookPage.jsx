import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  Typography
} from "@mui/material";
import { Alert } from "@mui/lab";
import { styled } from "@mui/material/styles";
import { useAuth } from "../../../hooks/useAuth";

import Label from "../../../components/label";
import BookDialog from "./BookDialog";
import BookForm from "./BookForm";
import Iconify from "../../../components/iconify";
import { apiUrl, methods, routes } from "../../../constants";

// ----------------------------------------------------------------------

const StyledBookImage = styled("img")({
  top: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute"
});

// Create a simple placeholder component
const BookPlaceholder = styled("div")({
  top: 0,
  width: "100%",
  height: "100%",
  position: "absolute",
  backgroundColor: "#f5f5f5",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#999",
  fontSize: "14px",
  textAlign: "center",
  border: "2px dashed #ddd"
});

const BookPage = () => {
  const { user } = useAuth();
  // Data
  const [book, setBook] = useState({
    id: "", name: "", isbn: "", summary: "", isAvailable: true, authorId: "", genreId: "", photoUrl: ""
  })
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdateForm, setIsUpdateForm] = useState(false)
  const [failedImages, setFailedImages] = useState(new Set());

  // Helper function to extract image URL from different formats
  const getImageUrl = (photoUrl) => {
    console.log('getImageUrl called with:', photoUrl, 'Type:', typeof photoUrl);

    if (!photoUrl) {
      console.log('→ No photoUrl, returning null');
      return null;
    }

    // If it's an object with url property (backend format)
    if (typeof photoUrl === 'object' && photoUrl.url) {
      console.log('→ Object format, extracting url:', photoUrl.url);
      return photoUrl.url;
    }

    // If it's a string
    if (typeof photoUrl === 'string') {
      // Skip the demo/default URL that doesn't work
      if (photoUrl.includes('res.cloudinary.com/demo/')) {
        console.log('→ Demo URL detected, returning null');
        return null;
      }
      console.log('→ String format, returning:', photoUrl);
      return photoUrl;
    }

    console.log('→ Unknown format, returning null');
    return null;
  };

  // Helper function to check if image should be displayed
  const shouldShowImage = (bookId, photoUrl) => {
    const url = getImageUrl(photoUrl);
    if (!url) return false;
    if (failedImages.has(bookId)) return false;
    return true;
  };

  // API operations
  const getAllBooks = () => {
    axios.get(apiUrl(routes.BOOK, methods.GET_ALL))
      .then((response) => {
        console.log("=== API RESPONSE DEBUG ===");
        console.log("Books received:", response.data.booksList?.length || 0);

        if (response.data.booksList && response.data.booksList.length > 0) {
          response.data.booksList.forEach((book, index) => {
            const url = getImageUrl(book.photoUrl);
            console.log(`Book ${index + 1} (${book.name}):`, {
              photoUrl: book.photoUrl,
              extractedUrl: url
            });
          });
        }
        console.log("========================");

        setBooks(response.data.booksList || [])
        setIsTableLoading(false)
      })
      .catch((error) => {
        console.error("API Error:", error);
        setIsTableLoading(false)
      })
  }

  const addBook = (imageFile) => {
    console.log('\n=== FRONTEND ADD BOOK DEBUG ===');
    console.log('1. Image file received:', imageFile);

    if (imageFile) {
      console.log('2. Image file details:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });
    } else {
      console.log('2. ❌ NO IMAGE FILE PASSED TO FUNCTION');
    }

    console.log('3. Book state:', book);

    const formData = new FormData();

    // Append text fields
    formData.append('name', book.name);
    formData.append('isbn', book.isbn);
    formData.append('summary', book.summary || '');
    formData.append('isAvailable', book.isAvailable);

    if (book.authorId) {
      formData.append('authorId', book.authorId);
    }
    if (book.genreId) {
      formData.append('genreId', book.genreId);
    }

    // Append file
    if (imageFile) {
      formData.append('photoUrl', imageFile);
      console.log('4. ✅ Image appended to FormData as "photoUrl"');
    } else {
      console.log('4. ⚠️ No image file to append');
    }

    // Debug FormData contents
    console.log('5. FormData entries:');
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`   ${key}: FILE - ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`   ${key}: ${value}`);
      }
    });
    console.log('================================\n');
    axios.post(apiUrl(routes.BOOK, methods.POST), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        console.log('\n=== ADD BOOK SUCCESS ===');
        console.log('Response:', response.data);
        console.log('PhotoUrl:', response.data.newBook?.photoUrl);
        console.log('========================\n');

        toast.success("Book added");
        handleCloseModal();
        getAllBooks();
        clearForm();
      })
      .catch((error) => {
        console.error('\n=== ADD BOOK ERROR ===');
        console.error('Error:', error);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('========================\n');
        toast.error("Something went wrong, please try again");
      });
  };

  const updateBook = (imageFile) => {
    console.log('\n=== FRONTEND UPDATE BOOK DEBUG ===');
    console.log('1. Image file:', imageFile);
    console.log('2. Book ID:', selectedBookId);

    const formData = new FormData();

    formData.append('name', book.name);
    formData.append('isbn', book.isbn);
    formData.append('summary', book.summary || '');
    formData.append('isAvailable', book.isAvailable);

    if (book.authorId) {
      formData.append('authorId', book.authorId);
    }
    if (book.genreId) {
      formData.append('genreId', book.genreId);
    }

    if (imageFile) {
      formData.append('photoUrl', imageFile);
      console.log('3. ✅ New image will be uploaded');
    } else {
      console.log('3. ℹ️ No new image (keeping existing)');
    }

    axios.put(apiUrl(routes.BOOK, methods.PUT, selectedBookId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        console.log('✅ UPDATE SUCCESS:', response.data);
        toast.success("Book updated");
        handleCloseModal();
        handleCloseMenu();
        getAllBooks();
        clearForm();
      })
      .catch((error) => {
        console.error('❌ UPDATE ERROR:', error.response?.data || error.message);
        toast.error("Something went wrong, please try again");
      });
  };

  const deleteBook = (bookId) => {
    axios.delete(apiUrl(routes.BOOK, methods.DELETE, bookId))
      .then((response) => {
        toast.success("Book deleted");
        handleCloseDialog();
        handleCloseMenu();
        console.log(response.data);
        getAllBooks();
      })
      .catch((error) => {
        console.log(error);
        toast.error("Something went wrong, please try again")
      });
  }

  const getSelectedBookDetails = () => {
    const selectedBook = books.find((element) => element._id === selectedBookId)
    console.log("Selected book:", selectedBook)
    setBook(selectedBook)
  }

  const clearForm = () => {
    setBook({ id: "", name: "", isbn: "", summary: "", isAvailable: true, authorId: "", genreId: "", photoUrl: "" })
  }

  // Handler functions
  const handleOpenMenu = (event) => {
    setIsMenuOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(null);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  useEffect(() => {
    getAllBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [openFilter, setOpenFilter] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Helmet>
        <title> Books </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" sx={{ mb: 5 }}>
            Books
          </Typography>
          {user.isAdmin && <Button variant="contained" onClick={() => {
            setIsUpdateForm(false);
            handleOpenModal();
          }} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Book
          </Button>}
        </Stack>

        {isTableLoading ? <Grid padding={2} style={{ "textAlign": "center" }}><CircularProgress /></Grid> :

          books.length > 0 ? <Grid container spacing={4}>
            {books.map((book) => {
              const imageUrl = getImageUrl(book.photoUrl);

              return (
                <Grid key={book._id} item xs={12} sm={6} md={4}>
                  <Card>
                    <Box sx={{ pt: '80%', position: 'relative' }}>
                      <Label
                        variant="filled"
                        sx={{
                          zIndex: 9,
                          top: 16,
                          left: 16,
                          position: 'absolute',
                          textTransform: 'uppercase',
                          color: 'primary.main',
                        }}
                      >
                        {book.genre?.name || 'No Genre'}
                      </Label>
                      {user.isAdmin && <Label
                        variant="filled"
                        sx={{
                          zIndex: 9,
                          top: 12,
                          right: 16,
                          position: 'absolute',
                          borderRadius: "100%",
                          width: "30px",
                          height: "30px",
                          color: "white",
                          backgroundColor: "white"
                        }}
                      >
                        <IconButton size="small" color="primary" onClick={(e) => {
                          setSelectedBookId(book._id)
                          handleOpenMenu(e)
                        }}>
                          <Iconify icon={'eva:more-vertical-fill'} />
                        </IconButton>
                      </Label>}

                      {/* Conditional rendering: show image if valid URL, otherwise show placeholder */}
                      {shouldShowImage(book._id, book.photoUrl) ? (
                        <StyledBookImage
                          alt={book.name}
                          src={imageUrl}
                          onError={(e) => {
                            console.log(`Image failed to load for ${book.name}:`, imageUrl);
                            // Mark this image as failed
                            setFailedImages(prev => new Set([...prev, book._id]));
                          }}
                        />
                      ) : (
                        <BookPlaceholder>
                          <Iconify icon="eva:image-outline" width={48} height={48} style={{ marginBottom: 8, opacity: 0.5 }} />
                          <div>No Image</div>
                          <div style={{ fontSize: "12px", opacity: 0.7 }}>Upload a cover</div>
                        </BookPlaceholder>
                      )}
                    </Box>

                    <Stack spacing={1} sx={{ p: 2 }}>
                      <Typography textAlign="center" variant="h5" margin={0} noWrap>{book.name}</Typography>
                      <Typography variant="subtitle1" sx={{ color: "#888888" }} paddingBottom={1} noWrap
                        textAlign="center">{book.author?.name || 'Unknown Author'}</Typography>
                      <Label color={book.isAvailable ? "success" : "error"}
                        sx={{ padding: 2 }}>{book.isAvailable ? 'Available' : 'Not available'}</Label>

                      <Typography variant="subtitle2" textAlign="center" paddingTop={1}>ISBN: {book.isbn}</Typography>
                      <Typography variant="body2">{book.summary}</Typography>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid> : <Alert severity="warning" color="warning">
            No books found
          </Alert>
        }
      </Container>

      <Popover
        open={Boolean(isMenuOpen)}
        anchorEl={isMenuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1, width: 140, '& .MuiMenuItem-root': {
              px: 1, typography: 'body2', borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem onClick={() => {
          setIsUpdateForm(true);
          getSelectedBookDetails();
          handleCloseMenu();
          handleOpenModal();
        }}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }} onClick={handleOpenDialog}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      <BookForm
        isUpdateForm={isUpdateForm}
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        id={selectedBookId}
        book={book}
        setBook={setBook}
        handleAddBook={addBook}
        handleUpdateBook={updateBook}
      />

      <BookDialog isDialogOpen={isDialogOpen} bookId={selectedBookId} handleDeleteBook={deleteBook}
        handleCloseDialog={handleCloseDialog} />
    </>
  );
}

export default BookPage;