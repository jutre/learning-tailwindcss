import { useSelector } from 'react-redux';
import { routes } from "../../config";
import { Link, NavLink } from "react-router-dom";
import { selectFilteredBooksIds } from "../../features/booksSlice";
import { selectSearchString } from "../../features/filtersSlice";
import BooksListItemsSelectionBar from "./BooksListItemsSelectionBar"
import { BookListItem } from "./BooksListItem";
import { getBookListBaseUrl } from "../../utils/utils";
import { FAVORITE_BOOKS_LIST } from "../../constants/bookListModes";
import { GeneralErrorMessage } from "../ui_elements/GeneralErrorMessage";

/**
 * This component displays book list from store. It might display all books or 
 * filtered list is search string is set in filters state
 * 
 * @param {string} listMode - current list mode (all books of favarites), used to calculate urls for deleting, editing operations
 * to get back to list user came from before choosing deleting or editing url
 */

function BooksListBody ({listMode = null}) {

  function getBookEditUrl(bookId, listMode){
    //replace bookId segment in book edit route pattern
    let editUrl = routes.bookEditPath.replace(":bookId", bookId);
    //if current list is other than all books list, add parameter which contains url to which list to return
    //to construct "Back to list" link and redirect url the page is redirected after book is deleted in
    //edit screen
    if(listMode){
      editUrl += "?parentListUrl=" + getBookListBaseUrl(listMode);
    }
    
    return editUrl;
  }

  /**
   * creates deleting url by adding deleteId parameter to needed book list (all books list of favourites list) url. 
   * Adds "search" get param if currently displayed list is search result list.
   * "search" param is added to keep displaying search results list after a selected book is deleted.
   * Intended to use for a book list item to create delete url for a single book.
   * @param {int|string} bookId  - 
   * @param {string} searchGetParamVal 
   * @returns 
   */
  function getBookDeletionUrl(bookId, searchGetParamVal, listMode){
    
    let deleteUrl = getBookListBaseUrl(listMode);
    deleteUrl += "?deleteId=" + bookId;
    
    if(searchGetParamVal){
      deleteUrl += "&search=" + searchGetParamVal; 
    }
    return deleteUrl;
  }

  let booksIds = useSelector(state => selectFilteredBooksIds(state, listMode));
  let currentSearchString = useSelector(state => selectSearchString(state));


  //create url for returning to unfiltered list link that will be shown when search string is filtered by search string
  let allBooksListUrl = routes.bookListPath;

  //add info how much records were found during search
  let searchResultsInfoMessage;
  let searchStrTooShortErrorMessage;
  if (currentSearchString) {
    //ensure search string is of String type to get rid of possible error as we will check length of string
    currentSearchString = String(currentSearchString);
    
    searchResultsInfoMessage = `Your searched for "${currentSearchString}".`;
    
    if(currentSearchString.length < 3){
      //search phrase length is less than three symbols - 
      //display error message that search phrase must be at least three symbols
      searchStrTooShortErrorMessage = "Searching string must contain at least three symbols"
    
    }else {
        if(booksIds.length === 0){
          searchResultsInfoMessage += " Nothing was found."
        }else{
          searchResultsInfoMessage += ` Number of records found is ${booksIds.length}.`;
        }
    }
  }

  let showEmptyFavoritesListMessage;
  let showEmptyListMessage;
  if(booksIds.length === 0){
    if(listMode === FAVORITE_BOOKS_LIST){
      showEmptyFavoritesListMessage = true;
    }else if(!currentSearchString){
      showEmptyListMessage = true;
    }
  }
  
  return  (
    <>
      <div>
        
        {//always display entered search phrase and possible results (if search string not too short)
          searchResultsInfoMessage &&
          <div className="py-[15px]">
            {searchResultsInfoMessage}
          </div>
        }

        {//dispay error if search string too short
          searchStrTooShortErrorMessage &&
          <GeneralErrorMessage msgText={searchStrTooShortErrorMessage} />
        }

        {//finally link to all records
        searchResultsInfoMessage &&
          <div className="py-[15px]">
            <NavLink className={() => "underline font-bold"}
              to={allBooksListUrl}>Display all records</NavLink>
          </div>
        }

        {showEmptyFavoritesListMessage &&
          <div>There are no books added to favorite books list.</div>
        }
        {//if books array is empty and no searching is done (it might be the case nothing is found), offer adding some books 
          (showEmptyListMessage) &&
          <p>There are no books added yet. Add them by 
             using <Link to={routes.createBookPath}>"Add book"</Link> link!
          </p>
        }
        
        {booksIds.length > 0 &&
          <>
            <BooksListItemsSelectionBar allDisplayedBooksIds={booksIds}
              searchGetParamVal={currentSearchString} 
              baseUrl={getBookListBaseUrl(listMode)}/>

            {(booksIds).map(bookId =>
              <BookListItem key={bookId}
                bookId={bookId}
                editUrl={getBookEditUrl(bookId, listMode)}
                deleteUrl={getBookDeletionUrl(bookId, currentSearchString, listMode)} />
            )}
          </>
        }
      </div>
    </>
  )
}

export default BooksListBody;
