import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQueryParamValue } from "../utils/utils";
import {
  getBookById,
  selectInitialDataFetchingStatus,
  bookUpdatingStatusResetToIdle,
  sendUpdatedBookDataToServer,
  selectBookUpdatingStatus,
  STATUS_IDLE,
  STATUS_LOADING,
  STATUS_REJECTED } from "../features/booksSlice";
import { useSelector, useDispatch } from 'react-redux';
import {
  routes,
  bookEditFormFieldsDef } from "../config";
import { H1Heading } from "./ui_elements/H1Heading";
import { ButtonWithIconAndBackground } from "./ui_elements/ButtonWithIconAndBackground";
import { DataFetchingStatusLabel, LABEL_TYPE_ERROR } from "./ui_elements/DataFetchingStatusLabel";
import { GeneralErrorMessage } from "./ui_elements/GeneralErrorMessage";
import { NavLinkBack } from "./ui_elements/NavLinkBack";
import { FormBuilder } from '../utils/FormBuilder';
import DisappearingMessage from './DisappearingMessage';
import { setPageTitleTagValue } from "../utils/setPageTitleTagValue";
import { BookDeletionProcessor } from "./BookDeletionProcessor";
import { useTrackThunkSuccessfulFinishing } from "../hooks/useTrackThunkSuccessfulFinishing";


/**
 * This component gets initial data from Redux store but does not use react-redux connect() because we don't need 
 * re-render component after store's state is updated because the new state corresponds to values is that is 
 * currently in input fields.
 */
function BookEditing() {
  
  //keep form initial data in compnent's state as on first render page might be opened directly using page link and at
  //that moment initial application data has not been loaded yet and there is nothing to display. When data loading finishes
  //loading, editable book data will be set to this array and component will render the form
  const [formInitialData, setFormInitialData] = useState();

  //will contain possible errors
  const [errorMsg, setErrorMsg] = useState();
  
  const dispatch = useDispatch();

  const navigate = useNavigate();

  let deleteParamVal = getQueryParamValue("delete");
  //validate delete param val, accepting only "true" if it is not null because it will be used in hook as dependency
  if(deleteParamVal !== null && deleteParamVal !== "true"){
    deleteParamVal =  null;
  }
   
  useEffect(() => {
    //for resetting "bookUpdatingStatus" state from "rejected" to "idle". It is needed in situation if submitting updated book
    //data has ended up with "rejected" status and user navigated to other page and then came back. 
    //At the moment when user comes back to book updating page the previously set "rejected" book saving status remains unchanged,
    //it must be set to "idle" on first component render
    //Also it must be reset when user submits form to update book and it fails, showng "rejected" status and "delete book" link
    //is clicked - a delete param is added to page url, modal dialog is snown, at that moment existing "rejected" status must
    //be removed from page 
    dispatch(bookUpdatingStatusResetToIdle());
    //setting page title after first render
    setPageTitleTagValue("Edit book");
  }, [deleteParamVal]);

  useEffect(() => {
    //setting page title after first render
    setPageTitleTagValue("Edit book");
  }, []);

  

  const { bookId } = useParams();
  let bookIdIntVal = parseInt(bookId);
  //book data might not be set yet because of initial fetching or path variable might be invalid. Result is ignored
  //until initial data is fetched 
  let bookData = useSelector(state => getBookById(state, bookIdIntVal));

  let initialDataFetchingStatus = useSelector(state => selectInitialDataFetchingStatus(state));
  //this hook is used to correctly populate form's fields with initial data. 
  //It prevents showing the form until initial app's initial data fetching status 
  //becomes "idle" because if data loading state is "loading" or "rejected" it means data has not arrived from 
  //REST endpoint and not been loaded to store - there is no data about book with given ID, nothing to edit
  //Such situation can happen  when application is opened for the first time using url corresponding to book editing 
  //page, like "/1/edit/" not coming from app's book list using link which means that initial data
  //has not been loaded to app before, the initial data loading might still be in progress
  useEffect(() => {
    //check if bookId segment is positive integer
    if (! /^[1-9][0-9]*$/.test(bookId)) {
      setErrorMsg(bookId + " - invalid parameter value! Value must be integer greater than zero.");

    } else {
      if(initialDataFetchingStatus === STATUS_IDLE){
        //Check if book with such id exists
        if (bookData === undefined) {
          setErrorMsg(`A book with id="${bookId}" was not found!`);
        } else {
          setFormInitialData(bookData);
        }
      }
    }

  }, [initialDataFetchingStatus]);


  let bookUpdatingStatus = useSelector(state => selectBookUpdatingStatus(state));

  const [displaySuccessMsg] = useTrackThunkSuccessfulFinishing(bookUpdatingStatus);
  
  let formDisabled = bookUpdatingStatus === STATUS_LOADING;

  let  formFieldsDefinition = bookEditFormFieldsDef;
    

  /**
   * dispatches updating thunk to update book data in redux store. Additionally gets excludes get params 
   * from current book edit url by using useNavigate hook's returned function. A "delete" get param can be 
   * page's url value if deleting failed when "Delete book" link was clicked in book edit screen. If get 
   * param would not be removed from url also a delete confirmation modal dialog would be displayed in  
   * response to "delete" get param. 
   * @param {*} bookData 
   */
  function saveSubmittedData(bookData){
    //replace bookId segment in book edit route pattern
    let bookEditUrlWithoutGetParams = routes.bookEditPath.replace(":bookId", bookId);
    navigate(bookEditUrlWithoutGetParams);
    dispatch(sendUpdatedBookDataToServer(bookData));
  }

  let parentListUrl = getQueryParamValue("parentListUrl");

  //link url for returning to list must point to list user came from to current edit page (all books list or 
  //favorites list), same is with redirecting after deleting a book from edit screen
  let backToListUrl = routes.bookListPath;
  if(parentListUrl){
    backToListUrl = parentListUrl;
  }

  //create current book delete url by adding delete parameter to book edit link.
  //if edit page was opened from other than all books list, parentListUrl get param is to be keeped in delete url
  //to redirect page to same list user opened editing page from in case user confirms or cancels deleting
  let deleteLinkUrl = routes.bookEditPath.replace(":bookId", bookId) + "?delete=true";
  if(parentListUrl){
    deleteLinkUrl += "&parentListUrl=" + parentListUrl;
  }

  //if user clicks on "Cancel" botton in delete confirmation dialog, page should redirect
  //to book editing url withoud delete get param, keeping parent list url param
  let deletionCancelActionUrl = routes.bookEditPath.replace(":bookId", bookId)
  if(parentListUrl){
    deletionCancelActionUrl += "?parentListUrl=" + parentListUrl;
  }

  //when deleting get param set and data for form is set, show confirmation dialog, otherwise, nothing to delete
  //when data is empty ( in case of initial data loading  or id of non existing book form is not displayed and
  //also there is no reason to display delete button)
  let showDeletionConfirmationDialog = false;
  if(formInitialData && deleteParamVal === "true"){
    showDeletionConfirmationDialog = true;
  }
  //to delete a single book, create array with one book's id
  let deletableBooksIdsArr = [bookIdIntVal];
  
  return  (
    <div>
      <NavLinkBack url={backToListUrl}/>
      
      <div className="relative max-w-[700px]">
        <H1Heading headingText="Edit book"/>

        
        {/*if data sending has failed, display message*/
        bookUpdatingStatus === STATUS_REJECTED &&
          <DataFetchingStatusLabel type={LABEL_TYPE_ERROR}
            labelText="book updating has failed, try again later"/>
        }
        
        {/*while data is being sent, show that data is loading*/
        bookUpdatingStatus === STATUS_LOADING && 
          <DataFetchingStatusLabel labelText="updating..."/>
        }

        {//after succesful update display message
        displaySuccessMsg && 
          <DisappearingMessage messageText="Changes saved" 
            initialDisplayDuration={1000}/>
        }

        {//display modal deleting confirmation dialog
        showDeletionConfirmationDialog &&
          <BookDeletionProcessor booksIds={deletableBooksIdsArr}
            afterDeletingRedirectUrl={backToListUrl}
            cancelActionUrl={deletionCancelActionUrl} />
        }

        {errorMsg &&
          <GeneralErrorMessage msgText={errorMsg} />
        }

        {//book edit form and delete button when book data is loaded
        formInitialData &&
          <>
            {/*delete button placed on the right top corner of container*/}
            <div className="absolute right-0 top-0">
              <ButtonWithIconAndBackground
                iconName="delete"
                //redirect to delete url on click
                clickHandler={() => { navigate(deleteLinkUrl) }} />
            </div>

            <FormBuilder formFieldsDefinition={formFieldsDefinition}
              submitButtonText="Update"
              initialData={bookData}
              successfulSubmitCallback={saveSubmittedData}
              disableAllFields={formDisabled} />
          </>
        }

      </div>
    </div>
  )
}




export default BookEditing;
