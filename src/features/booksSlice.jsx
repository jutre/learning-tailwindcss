import {  createSlice, 
          createEntityAdapter, 
          createSelector, 
          createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from "../client/APIClient";
import { FAVORITE_BOOKS_LIST } from "../constants/bookListModes";

//async thunk execution status is used in some components for logic comparison therefore
//status values constants are created for using in those comparisons
export const STATUS_LOADING = "loading";
export const STATUS_IDLE = "idle";
export const STATUS_REJECTED = "rejected"


const booksAdapter = createEntityAdapter();

let initialState = booksAdapter.getInitialState({
  //initial data loading thunk that execution state is stored in separate state field as it is displayed on all pages,
  //it can't be reused for other async thunks like updating single item status because single item update status 
  //value output logic is different
  initialDataLoadingStatus: STATUS_IDLE,

  //book saving thunk execution state
  bookSavingStatus: STATUS_IDLE,
  lastSavedBookId: null,

  //book updating thunk execution state
  bookUpdatingStatus: STATUS_IDLE,

  //book deleting thunk execution state
  bookDeletingStatus: STATUS_IDLE
})

/**
 * fetches data from two endpoints: book list and favorite book list.
 * @param string url - thunk function parameter - parameter value determines which data source to load data from
 * @returns action with payload containing both book list and favorites list 
 */
export const fetchBookData = createAsyncThunk(
  'books/fetchBookData', 
  async (url) => {
    //fetching from endpoints is done sequentially, not in parallel - when fetches from first is done, fetching from second 
    //source occurs
    const booksDataResponse = await apiClient.fetchBooks(url);
    const favoriteBooksDataResponse = await apiClient.fetchFavoriteBooksIds(url);
    return {
      books: booksDataResponse.books,
      favoriteBooksIds: favoriteBooksDataResponse.favoriteBooks
    }
})

/**
 * sends book data to REST endpoing for creating new record
 * @param string newBookData - thunk function parameter - book data to be saved
 * @returns action with payload that contains saved book data which consists of data sent with added unique identifier field
 */
export const sendNewBookDataToServer = createAsyncThunk(
  'books/saveBookData', 
  async (newBookData) => {
    const response = await apiClient.saveNewBook(newBookData);
    return response.bookData;
})


/**
 * sends book data to REST endpoing for updating existing book
 * @param string bookData - thunk function parameter - book data to update book with
 * @returns action with payload that contains saved book data possibly with some fields updated
 */
export const sendUpdatedBookDataToServer = createAsyncThunk(
  'books/updateBookData', 
  async (bookData) => {
    const response = await apiClient.updateBook(bookData);
    return response.bookData;
})


export const sendDeletableBooksListToServer = createAsyncThunk(
  'books/deleteBooks', 
  async (bookIdsArr, thunkAPI) => {
    await apiClient.deleteBooks(bookIdsArr);
    //when api function finishes executing, dispath book collection action
    thunkAPI.dispatch(multipleBooksDeleted(bookIdsArr));
})

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    bookUpdated(state, action){
      //ensure entity id field is of int type 
      const bookId = parseInt(action.payload.id);
      let newData = {...action.payload}; 
      //removing id property from update object to prevent updating id of existing entity in state
      delete newData["id"];
      let updateObj = { id: bookId, changes: newData }
      booksAdapter.updateOne(state, updateObj)
    },


    bookDeleted:booksAdapter.removeOne,

    //action for deleting multiple books
    multipleBooksDeleted(state, action){
      let bookIdsArr = action.payload;
      bookIdsArr.forEach((bookId)=>{
        booksSlice.caseReducers.bookDeleted(state, { type: 'bookDeleted', payload: bookId });
      })
    },


    //for resetting "initialDataLoadingStatus" state from "rejected" to "idle". It is needed in situation if unitial data loading
    //thunk execution ended with "rejected" status and user navigates to some other next page
    initialDataLoadingStatusResetToIdle(state){ 
      if(state.initialDataLoadingStatus === STATUS_REJECTED){    
        state.initialDataLoadingStatus = STATUS_IDLE;
      }
    },

    //for resetting "bookSavingStatus" state from "rejected" to "idle". It is needed in situation if corresponding thunk
    //execution ended with "rejected" status and user navigated to other page and then came back to new book creation page.
    //At the moment when user comes back to book list the previously set "rejected" execution status remains unchanged,
    //it must be set to "idle" using this reducer
    bookSavingStatusResetToIdle(state){
      if(state.bookSavingStatus === STATUS_REJECTED){   
        state.bookSavingStatus = STATUS_IDLE;
      }
    },

    //for resetting "bookUpdatingStatus" state from "rejected" to "idle". It is needed in situation if corresponding thunk
    //execution ended with "rejected" status and user navigated to other page and then came back to book updating page.
    //At the moment when user comes back to book list the previously set "rejected" execution status remains unchanged,
    //it must be set to "idle" using this reducer
    bookUpdatingStatusResetToIdle(state){
      if(state.bookUpdatingStatus === STATUS_REJECTED){   
        state.bookUpdatingStatus = STATUS_IDLE;
      }
    },


    //for resetting "bookDeletingStatus" state from "rejected" to "idle". It is needed in situation if corresponding thunk
    //execution ended with "rejected" status and user navigated to other page and then came back to book updating page.
    //At the moment when user comes back to book list the previously set "rejected" execution status remains unchanged,
    //it must be set to "idle" using this reducer 
    bookDeletingStatusResetToIdle(state){
      if(state.bookDeletingStatus === STATUS_REJECTED){   
        state.bookDeletingStatus = STATUS_IDLE;
      }
    }
    

  },

  extraReducers: (builder) => {
    builder
      //
      //reducers for initial data loading thunk function execution state actions
      //
      .addCase(fetchBookData.pending, (state, action) => {
        state.initialDataLoadingStatus = STATUS_LOADING
      })
      .addCase(fetchBookData.fulfilled, (state, action) => {
        booksAdapter.setAll(state, action.payload.books)
        state.initialDataLoadingStatus = STATUS_IDLE
      })
      .addCase(fetchBookData.rejected, (state, action) => {
        state.initialDataLoadingStatus = STATUS_REJECTED
      })


      //
      //reducers for new book creating thunk function execution state actions
      //
      .addCase(sendNewBookDataToServer.pending, (state, action) => {
        state.bookSavingStatus = STATUS_LOADING
      })
      .addCase(sendNewBookDataToServer.fulfilled, (state, action) => {
        state.bookSavingStatus = STATUS_IDLE
        //add saved book data to book list state an add saved book primary key to track last saved book
        let savedBookData = action.payload;
        booksAdapter.addOne(state, savedBookData);
        state.lastSavedBookId = savedBookData.id;
      })
      .addCase(sendNewBookDataToServer.rejected, (state, action) => {
        state.bookSavingStatus = STATUS_REJECTED
      })


      //
      //reducers for book updating thunk function execution state actions
      //
      .addCase(sendUpdatedBookDataToServer.pending, (state, action) => {
        state.bookUpdatingStatus = STATUS_LOADING
      })
      .addCase(sendUpdatedBookDataToServer.fulfilled, (state, action) => {
        state.bookUpdatingStatus = STATUS_IDLE
        //set updated book data to state
        //ensure entity id field is of int type 
        const bookId = parseInt(action.payload.id);
        let newData = {...action.payload}; 
        //removing id property from update object to prevent updating id of existing entity in state
        delete newData["id"];
        let updateObj = { id: bookId, changes: newData }
        booksAdapter.updateOne(state, updateObj);
      })
      .addCase(sendUpdatedBookDataToServer.rejected, (state, action) => {
        state.bookUpdatingStatus = STATUS_REJECTED
      })

      //sendDeletableBooksListToServer
      //
      //reducers for books deleting thunk function execution state actions
      //
      .addCase(sendDeletableBooksListToServer.pending, (state, action) => {
        state.bookDeletingStatus = STATUS_LOADING
      })
      .addCase(sendDeletableBooksListToServer.fulfilled, (state, action) => {
        state.bookDeletingStatus = STATUS_IDLE
      })
      .addCase(sendDeletableBooksListToServer.rejected, (state, action) => {
        state.bookDeletingStatus = STATUS_REJECTED
      })
  }
});

export const { 
  bookUpdated, multipleBooksDeleted, initialDataLoadingStatusResetToIdle, 
  bookSavingStatusResetToIdle, bookUpdatingStatusResetToIdle, bookDeletingStatusResetToIdle } = booksSlice.actions 

export default booksSlice.reducer


//
//selectors
//
export const {
  selectById: getBookById,
  selectIds: getAllBooksIds,
  selectAll: getAllBooks,
  selectEntities: getBookEntities
} = booksAdapter.getSelectors((state) => state.books)


export const selectBookFullInfoById = createSelector(
  //input selector - book info from books state
  getBookById,
  //input selector - presence of book in favorite books state
  (state, bookId) => state.favoriteBooks[bookId],
  //input selector - presence of book in selection for deleting state
  (state, bookId) => state.uiControls.booksSelectedInList[bookId],
  (bookInfo, addedToFavorites, selectedForDeleting) => {
    let fullBookInfo = {...bookInfo};
    fullBookInfo["isAddedToFavorites"] = addedToFavorites === true;
    fullBookInfo["isSelectedForDeleting"] = selectedForDeleting === true;
    return fullBookInfo;
  }
)

/**
 * Function that implements actual search algorithm - performs search in array of book objects for objects where "title" field 
 * has a substring equal to parameter's "searchStr" value. 
 * Function is used in two different selectors which do same search logic but receive input parameters in different way
 * 
 * @param {array of objects} booksArr - books array to be filtered by title fields. Each object must contain "title" field
 * @param {string} searchStr - string to be searched in book.title field
 * @returns book array consisting of books where "title" field has a substring equal to parameter's "searchStr" value
 */
const performSearchByTitle = (booksArr, searchStr) => {
  //don't perform any filtering if search string value is falsey (null,undefined, empty string), return whole list.
  //This behaviour is what is needed when current function is invoked in selector used in book list component, in
  //this case selector returns whole book list without filtering - the value of search string in filters state is null when
  //not any filtering is done. Such result would not fit for selector that is used for autocomplete search bar component result list
  //but it is possible to use current function in that selector in other cases as no searching is done (selector is not invoked) until 
  //user inputs at least three symbols
  if(!searchStr){
    return booksArr;
  }
  //ensure input parameter is string type to invoke trim() function
  searchStr = String(searchStr);

  //return unfiltered book list if search string value after trimming is empty string. This if what is needed for selector
  //used in book list component - when user submits search form with search string containing only whitespaces, this input is ignored
  //as filter value. For selector used for autocomplete search bar this result is not used as no searching is done until 
  //user inputs at least three symbols
  searchStr = searchStr.trim();
  if (searchStr === "") {
    return booksArr;

  //return empty book list if search string not empty but length is less than three symbols. In such case display empty book list in 
  //book list component (then also message is displayed that seach string must be of length of at least three symbols). In case of 
  //autocomplete search bar this result is not used as no searching is done until user inputs at least three symbols
  }else if (searchStr.length === 1 || searchStr.length === 2) {
    return [];
  }

  return booksArr.filter((book)=>
    book.title.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1
  )
}
/**
 * returns array of book objects where book title contains a search string. This selector is intended to use in
 * autocomplete search bar where search string is obtained from input form, books must be filtered while user
 * types, so this selector has two input parameters: state and search string to search in title
 */
export const selectBooksListByTitle = createSelector(
  //input selector - all books from current slice
  getAllBooks,
  //input selector - returns second argument of parent selector to transformation function
  (state, searchStr) => searchStr,
  (books, searchStr) => {
    return performSearchByTitle(books, searchStr)
  }
)

/**
 * selects books from state filtered by title field using search string residing in filters state or returns favorite books.
 * Books list state array if filtered using search string or favorite books are returned depending on second parameter of selector
 * "listMode"
 * 
 * @param {string} listMode - empty of equal to FAVORITE_BOOKS_LIST constant
 * 
 */
const selectFilteredBooks = createSelector(
  //input selector - all books from current slice
  getAllBooks,
  
  //input selector - get filters state
  (state) => state.filters,
  
  //input selector - returns second argument of parent selector to transformation function
  (state, listMode) => listMode,
  
  //input selector - returns favourites books state to transformation function only if second argument of parent selector 
  //is equal to favorite book list mode. Output selector needs favorite books state only in case of selecting only favorites 
  //books, it would not be optimal to return favorites state object to transformation function when all books are selected 
  //as in this case output selector would run every time a book is added or removed from favorites list - it would cause
  //unnecesary re-renders. Favorite books information is used only while displaying favorite books list
  (state, listMode) => listMode === FAVORITE_BOOKS_LIST && state.favoriteBooks,
  
  (books, filters, listMode, favoriteBooksObj) => {
    if (listMode){
      return books.filter((book)=>favoriteBooksObj[book.id] === true);
    }else{
      return performSearchByTitle(books, filters.searchString);
    }
  }
);




export const selectFilteredBooksIds = createSelector(
  
  //input selector - filtered books 
  (state, listMode) => selectFilteredBooks(state, listMode),
  (booksObjArr) => {
    return booksObjArr.map((book)=> book.id)
  }
);

/**
 * status of async thunk that fetches books from remore source, used for loading indicator
 * @param {*} state 
 * @returns 
 */
export const selectInitialDataFetchingStatus = (state) => state.books.initialDataLoadingStatus


/**
 * status of async thunk that saves new book data
 * @param {*} state 
 * @returns 
 */
export const selectBookSavingStatus = (state) => state.books.bookSavingStatus


/**
 * last saved book id, will be used to create link to a book that was just saved in page that appears
 * after successful book saving
 * @param {*} state 
 * @returns 
 */
export const selectLastSavedBookId = (state) => state.books.lastSavedBookId


/**
 * status of async thunk that updates book 
 * @param {*} state 
 * @returns 
 */
export const selectBookUpdatingStatus = (state) => state.books.bookUpdatingStatus

/**
 * status of async thunk that deletes books 
 * @param {*} state 
 * @returns 
 */
export const selectBookDeletingStatus = (state) => state.books.bookDeletingStatus
