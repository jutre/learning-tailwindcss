/**
 * This component is dedicated for processing get parameters for book list component: search string param and book delete id params.
 * Search param value is assigned to redux store; in response to delete id param delete confirm modal dialog markup is displayed.
 * 
 * Parameter processing is done in separate component because in response to url change component that uses react-router api
 * for url processing is re-rendering, it would not be optimal to process parameters where book list is displayed because the whole
 * book list would re-render in vain also on an url with deleting param when deletion confirm dialog is displayed; also if then user 
 * cancels deleting then list would re-render again as delete id param isremoved from url 
 */
import { useEffect } from "react";
import { useDispatch } from 'react-redux'; 
import { searchStringUpdated } from "../../features/filtersSlice"
import { useLocation } from "react-router-dom";
import { getQueryParamValue, getBookListBaseUrl } from "../../utils/utils";
import { BookDeletionProcessor } from "../BookDeletionProcessor";
import { GeneralErrorMessage } from "../ui_elements/GeneralErrorMessage";


function BooksListParamProcessor ({listMode = null}) {
  const dispatch = useDispatch();

  //it is needed to call a hook from react-router to cause this component to re-render when react-router generated 
  //links are changed. The changing part or link for current page is adding, removing deleteId parameter
  useLocation();
  
  let searchStringParamVal = getQueryParamValue("search");
  
  //
  //process entered search string value - trim whitespaces. If search string length after trimming is zero, ignore it by setting it
  //to null to prevent trigering conditions for entered search string further.
  //Further in code in useEffect hook set value of searchStringParamVal variable to filters state in Redux store
  //
  if(searchStringParamVal){
    searchStringParamVal = searchStringParamVal.trim();
    if(searchStringParamVal.length === 0){
      searchStringParamVal = null;

    }
  }

  //if current component re-rendered in response to search get param change, this useEffect hook
  //detects the change and sets new value to Redux state; book list component re-renders in response of that
  useEffect(() => {
    dispatch(searchStringUpdated(searchStringParamVal));
  }, [searchStringParamVal]);


  //
  //process book deletion get parameter in url 
  //
  let deletableBooksIdsArr = [];
  let deleteBookIdParamVal = getQueryParamValue("deleteId");
  //used for showing error messages
  let errorMessage;
  let displayDeletionConfirmationDialog = false;

  //the url of book list user will be redirected after he confirms or cancels book deleting 
  //List url is created here, search params might be added later 
  let baseUrl = getBookListBaseUrl(listMode);
  let afterDeletingRedirectUrl = baseUrl;
  let cancelDeletingRedirectUrl = baseUrl;
  
  if (deleteBookIdParamVal) {
    //delete id must be string consisting of comma separated positive integers. List of integers is used in case of deleting multiple
    //selected books
    if (!/^([1-9][0-9]*)(,[1-9][0-9]*)*$/.test(deleteBookIdParamVal)) {
      errorMessage = 
        `Invalid "deleteId" parameter value "${deleteBookIdParamVal}"! Value must be comma seperated integers each greater than zero.`;

    } else {
      //param value is valid, display dialog
      displayDeletionConfirmationDialog = true;

      //deleteId parameter consists only of positive integers according to regexpr test, create array of integers from string 
      let bookIdsStrValues = deleteBookIdParamVal.split(",");
      bookIdsStrValues.forEach((bookIdStrVal) => {
        deletableBooksIdsArr.push(parseInt(bookIdStrVal));
      })
       
      //if search param is entered then add it to book list page to redirect to list with search string user entered before 
      //choosing deleting option to display books that are still found by search string
      if (searchStringParamVal) {
        let searchGetParam = "?search=" + searchStringParamVal;
        afterDeletingRedirectUrl += searchGetParam
        cancelDeletingRedirectUrl += searchGetParam;
      }
    }
  }


  //there are cases then this component does not return any markup like in case of search parameter - it just displatches
  //action to set search string in redux store; there was possibility to return markup of either confirm dialog or error
  //message directly from if-else statement in case of deleteId param, but better is to separate markup creation from logic 
  //processing code. For that reason additional variables (errorMessage, displayDeletionConfirmationDialog) were created
  //to do simple condition on what is to be returned as markup
  return (
    <>
      {errorMessage &&
        <GeneralErrorMessage msgText={errorMessage} />
      }

      {displayDeletionConfirmationDialog &&
        <BookDeletionProcessor booksIds={deletableBooksIdsArr} 
                                        afterDeletingRedirectUrl={afterDeletingRedirectUrl} 
                                        cancelActionUrl={cancelDeletingRedirectUrl}/>
     }
    </>
  )
}

export default BooksListParamProcessor;
