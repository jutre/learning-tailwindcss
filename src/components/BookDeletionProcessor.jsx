import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  getBookById,
  selectInitialDataFetchingStatus,
  bookDeletingStatusResetToIdle,
  sendDeletableBooksListToServer,
  selectBookDeletingStatus,
  STATUS_IDLE,
  STATUS_LOADING,
  STATUS_REJECTED } from "../features/booksSlice";
  import { useTrackThunkSuccessfulFinishing } from "../hooks/useTrackThunkSuccessfulFinishing";
  import { ModalDialog } from "./ModalDialog";
  import { DataFetchingStatusLabel, LABEL_TYPE_ERROR } from "./ui_elements/DataFetchingStatusLabel";
  import { GeneralErrorMessage } from "./ui_elements/GeneralErrorMessage";

/**
 * displays deletion confirmation modal dialog before deleting and invokes redux thunks to delete book(s). 
 * If one book is to be deleted, dialog displays
 * confirmation question about deleting a single book while also displaying deletable book title. If multiple books are selected 
 * for deleting confirmation question displays amount of deleteable books. Dialog has two options: confirm deleting and cancel.
 * If user confirms deleting, book deleting from redux store is performed and user is redirected to url speficied in components
 * "afterDeletingRedirectUrl" property. If user cancels deleting, page is redirected to url speficied in a "cancelActionUrl" prop.
 * In case of deleting one book, the existance of book is checked in store, if book does not exist returns error message. In case of 
 * deleting multiple books, book existance is not checked, not any error messages are displayed, the books deleting redux thunk
 * is invoked
 * @param arr[int] booksIds - an array where each element is book id to be deleted (in case of deleting single book, array must contain
 * one element)
 * @param string afterDeletingRedirectUrl - when book is deleted page tipically will be redirected to book list url, but in some cases
 * additional params might be needed to be keeped also after deleting like search params
 * @param string cancelActionUrl - an url to which page should be redirected if user chooses "cancel" action in dialog. Current 
 * component is used in items list and edit pages, both pages have different url and form of get parameter that initiates delete confirmation
 * dialog, for list param would be in form "deleteId=1", edit screen "delete=true", there is no pattern that delete param would be identified 
 * to be removed from deletion initiation url, for that reason an url where to redirect after user cancellation of deletion must be defined
 * in page and passed to deletion dialog as property
 *
 * @returns jsx - markup that shapes html for confirmation dialog or error message
 */
export function BookDeletionProcessor({ booksIds, afterDeletingRedirectUrl, cancelActionUrl }) {
  //it is needed to remember that user has clicked "Confirm" because to create correct condition
  //as not to show confirmation dialog after deletion trunk has finisked, it's execution state ir "Idle",
  //but useTrackThunkSuccessfulFinishing has not returned that thunk execution status has successfully funished
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const [wasDisplayedDuringInitialDataLoading, setWasDisplayedDuringInitialDataLoading] = useState(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    //for resetting "bookDeletingStatus" state from "rejected" to "idle". It is needed in situation if book deleting
    //thunk execution has ended up with "rejected" status and user navigated to other page and then came back and clicked
    //"Delete book" link on book list or clicked "Delete book" immediatelly after previous deletion ended as "rejected"
    dispatch(bookDeletingStatusResetToIdle());
    //"hasClicked" is being reset for case when user clicked another "Delete book" link immediatelly after deleting
    //failed on previous click on "Delete book" link
    setHasConfirmed(false)

  }, [booksIds]);

  /**
   * deletes book in redux store and redirects to book list url.
   * Intended to invoke when in modal confirmation dialog user clicks button "Confirm"
   */
  function deleteBooks(booksIds) {
    setHasConfirmed(true);
    dispatch(sendDeletableBooksListToServer(booksIds));
  }

  /**
   * redirects to book list page without params that way no book is selected
   * for deletion
   */
  function cancelSelectionForDeleting() {
    navigate(cancelActionUrl);
  }

  let bookDeletingStatus = useSelector(state => selectBookDeletingStatus(state));
  const [isThunkExecutionSuccessfullyFinished] = useTrackThunkSuccessfulFinishing(bookDeletingStatus);


  useEffect(() => {
    if(isThunkExecutionSuccessfullyFinished){
      navigate(afterDeletingRedirectUrl);
    }
  }, [isThunkExecutionSuccessfullyFinished]);


  let modalDialogMessageStr
  let errorMessage;
  //it is needed to get book title in case of deleting single book to display book's title in confirmation dialog,
  //it is the first element in array as deletable books ids are always passed contained in array.
  //In case of deleting multiple books first book's in array information is also seleced but ignored because
  //it is not possible to conditionally invoke useSelector hook only in case of single book deletion 
  let bookInfo = useSelector(state => getBookById(state, booksIds[0]));
  
  
  
  //Prevent showing the confirm dialog if deletion link opened during initial app's data fetching status. 
  //If data loading state is "loading" or "rejected" it means data has not arrived from 
  //REST endpoint and not been loaded to store - there is no data about book with given ID, nothing to ask deletion
  //confirmation about.
  let initialDataFetchingStatus = useSelector(state => selectInitialDataFetchingStatus(state));
  

  useEffect(() => {
    //remember that dialog has been trying to be displayed during initial app's data fetching. When
    //component is re-rendered because redux selector select's new status becomes ("idle" or "rejected")
    //the component immediatelly would display modal dialog but that would be followed setting's menu
    //initiated redirect to app's initial page, which results in that confirmation dialog would appear for
    //a moment and dissapear then followed by redirect. To prevent such short appearing of modal dialog on screen,
    //and just not display anything until redirect happens, use state variable to remember that initially compnent
    //was rendered during data loading
    if(initialDataFetchingStatus === STATUS_LOADING ){
      setWasDisplayedDuringInitialDataLoading(true);
    }
  }, [initialDataFetchingStatus]);

  if(initialDataFetchingStatus === STATUS_LOADING || wasDisplayedDuringInitialDataLoading){
    return;
  }
  
  
  //thunk for book deleting was launched by "Confirm" option, had been in execution state and finished with success state,
  //deleting is done, should be redirecting to needed page but it will be done in hook after rendering because redirect 
  //with react-router means a react router component will change state but it can not be done while it's child component  
  //(this component is rendering
  if(isThunkExecutionSuccessfullyFinished){
    return;
  
  }else if(bookDeletingStatus === STATUS_LOADING){
    return <DataFetchingStatusLabel labelText="deleting in progress..."/>;

  }else if(bookDeletingStatus === STATUS_REJECTED){
    return <DataFetchingStatusLabel type={LABEL_TYPE_ERROR}
      labelText="deleting failed, try again later" />;

  //if user has not clicked "Confirm" option and
  //book deleting thunk execution status is iddle (not in progress, not failed) then display confirmation modal dialog 
  }else if(!hasConfirmed && bookDeletingStatus === STATUS_IDLE){
    if(booksIds.length === 1){
      //in case of deleting single book, display confirmation dialog with question if user wants to delete a selected book which
      //contains deletable book title
      if (bookInfo) {
        modalDialogMessageStr = `Are you sure you want to delete "${bookInfo.title}"?`;

      //a book with such id is not found, display error 
      } else {
        errorMessage = `A book with id="${booksIds[0]}" was not found!`;
      }
    
    }else{
      //in case of deleting multiple books, display confirmation dialog with question which contains the number of deletable books.
      //Book existance according to booksIds array element value are not checked, non existing books are ignored
      modalDialogMessageStr = `Are you sure you want to delete ${booksIds.length} books?`;
    }

    if(errorMessage){
      return <GeneralErrorMessage msgText={errorMessage} />
    }else{

      return <ModalDialog content={modalDialogMessageStr}
                          confirmFunction={() => deleteBooks(booksIds)}
                          cancelFunction={cancelSelectionForDeleting} />
    }
  
  }
}
