import { initBooksPage } from "./pages/books.js";

// Simple router - show desired page
function navigate(page) {
  switch (page) {
    case 'books':
      initBooksPage();
      break;
  }
}

navigate('books');