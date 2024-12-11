import { createSlice, createSelector } from '@reduxjs/toolkit';
import { multipleBooksDeleted, fetchBookData } from './booksSlice';
import { searchStringUpdated } from './filtersSlice';

let initialState = {booksSelectedInList:{}};

const uiControlsSlice = createSlice({
  name: 'uiControls',
  initialState,
  reducers: {
    
    //used to add a single or multiple books to selection. Single book adding use case is when user chooses to add a single book 
    //from a list using checkbox, multiple books are added when user click "select all" button in books list.
    //action.payload type must always be of array, each array element is bookId value which should be added to selection. 
    //In case of single book adding to selection, action.payload array must contain a one element; 
    //In case of selecting all books from displayed list, action.payload array must contain all books ids - all books array is
    //available in parent component containing bach selection control bar, it is convenient to create action.paylod value
    //from it
    bookCollectionAddedToSelection(state, action){
      let bookIdsArr = action.payload;
      bookIdsArr.forEach((bookId)=>{
        state.booksSelectedInList[bookId] = true;
      })
    },

    //removes a single book from current selection. action.payload value must be book id value which should be removed from currently
    //selected books. Single book removing use case is when user chooses to remove a single book from displayed list using checkbox
    singleBookRemovedFromSelection(state, action){ 
      let bookId = action.payload;
      delete state.booksSelectedInList[bookId];
    },

    //removes all books currently added to selection. All books removing use case is when user has selected at least one book 
    //is selected in books list and clicks on "unselect all" button.
    //Reducer actually sets selection state to empty array as currently there is no pagination in books list, there is no
    //need to pass a list of selected books that should be removed from selection, that is there does not exist second page
    //with selected books
    allBooksRemovedFromSelection(state, action){
      state.booksSelectedInList={};
    },

  },

  extraReducers: (builder) => {
    builder
      
      //when book(s) are deleted from books state, remove those deleted from selectem items. 
      .addCase(multipleBooksDeleted, (state, action) => {
        let bookIdsArr = action.payload;
        bookIdsArr.forEach((bookId) => {
          if (state.booksSelectedInList[bookId] === true) {
            delete state.booksSelectedInList[bookId];
          }
        })
      })
      //when user submits different search string, clear current selection. Possibly user selected some books in previous search
      //result list but with new search string that book might be not visible in list but would be deleted together with
      //selection from current result list if user clicks  "delete all selected" button.
      //Also when user navigates from a result list to "all records" page, the selection made in result list also must be cleared
      .addCase(searchStringUpdated, (state) => {
        state.booksSelectedInList={}
      })

      //when book data fetching action is fulfilled, which means new initial data (books, favorites list) is loaded, previous 
      //book selection is unrelevant, set selection to empty
      .addCase(fetchBookData.fulfilled, (state, action) => {
        uiControlsSlice.caseReducers.allBooksRemovedFromSelection(state);
      })

  }
});

//
//selectors
//

/**
 * returns true if any book is selected. Used in book list header in batch selection checkbox to unselect or select multiple books
 * 
 * @param {*} state 
 * @returns boolean
 */
export const selectIsAnyBookSelected = state =>{
  let selectedBookObj = state.uiControls.booksSelectedInList;
  var selectedBooksCount = Object.keys(selectedBookObj).length;
  return selectedBooksCount > 0
}

//
/**
 * return array of book ids thare currently are selected. Return in form of array as usually in comsuming component list of 
 * values are needed, same is in current application - there wont be need to convert object to array
 * @param {*} state 
 * @returns array - array where each element is book id currently added to selection
 */
export const selectBooksInSelection = createSelector(
  state => state.uiControls.booksSelectedInList,
  selectedBookObj => Object.keys(selectedBookObj)
)


export const { bookCollectionAddedToSelection, singleBookRemovedFromSelection, allBooksRemovedFromSelection } = uiControlsSlice.actions
export default uiControlsSlice.reducer
