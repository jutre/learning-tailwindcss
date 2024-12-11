/**
 * slice that also updates it's state in response to actions from "booksSlice".
 * Possibly current state could be placed in booksSlice as it is closely related, but for trying to work with
 * all possible redux toolkit features data is placed into separate slice
 */
import { createSlice } from '@reduxjs/toolkit';
import { multipleBooksDeleted, fetchBookData } from './booksSlice';

let initialState = {};

const favoriteBooksSlice = createSlice({
  name: 'favoriteBooks',
  initialState,
  reducers: {
    
    //if books is added to favorites, removes it from favorites list and if book present in favorites list, removes it from list
    bookFavoriteStateToggled(state, action){
      
      //in general object prop keys are in form of string, convert possible int type key value to string (would work also with int type)
      let bookIdStrVal = String(action.payload);
      if(state[bookIdStrVal] === true){
        delete state[bookIdStrVal];
      }else{
        state[bookIdStrVal] = true;
      }
    },

  },

  extraReducers: (builder) => {
    builder
      
      //when book(s) are deleted from books state, remove  those deleted from favorites list. 
      //This extra reducer responds to action from other slice
      .addCase(multipleBooksDeleted, (state, action) => {
        let bookIdsArr = action.payload;
        bookIdsArr.forEach((bookId) => {
          if (state[bookId] === true) {
            delete state[bookId];
          }
        })
      })

      //when book data fetching action is fulfilled, which means new initial data (books, favorites list) is loaded, previous 
      //data from favorite  books state must be deleted and favorite ids from action payload must be added to favorite books state
      .addCase(fetchBookData.fulfilled, (state, action) => {
        let currentFavoriteBookIds = Object.keys(state);
        currentFavoriteBookIds.forEach((bookId) => {
          delete state[bookId];
        })
        action.payload.favoriteBooksIds.forEach((bookId) => {
          state[bookId] = true;
        })
      })
  }
});

export const { bookFavoriteStateToggled } = favoriteBooksSlice.actions
export default favoriteBooksSlice.reducer


