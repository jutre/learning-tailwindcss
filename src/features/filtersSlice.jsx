import { createSlice } from '@reduxjs/toolkit';

let initialState = { searchString: null };

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: { 
    searchStringUpdated(state, action){      
      state.searchString = action.payload;
    }

  }
});

export const { searchStringUpdated } = filtersSlice.actions
export default filtersSlice.reducer

//
//selectors
//
export const selectSearchString = (state) => {
  return state.filters.searchString;
}

