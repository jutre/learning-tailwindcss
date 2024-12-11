import { configureStore } from '@reduxjs/toolkit'
import booksReducer from '../features/booksSlice';
import filtersReducer from '../features/filtersSlice';
import favoriteBooksReducer from '../features/favoriteBooksSlice'
import uiControlsReducer from '../features/uiControlsSlice'

const store = configureStore({
    reducer: {  books: booksReducer,
                filters: filtersReducer,
                favoriteBooks: favoriteBooksReducer,
                uiControls: uiControlsReducer
    }
});

export default store;