import { useState, useEffect } from "react";
import {
  STATUS_IDLE,
  STATUS_LOADING,
  STATUS_REJECTED } from "../features/booksSlice";

/**
 * hook for using in components where it is needed to track redux async thunks execution status.
 * Captures that thunk was executing and terminated seccessfully, setting first variable in array returned by
 * hook to true
 * 
 * @param string asyncThunkExecutionStatus - current execution status of redux async thunk passed from component
 * @returns array - first array element is set to "true" when hook was called subsequentelly with parameter value
 * first with "pending" and after with "idle" which corresponds to thunks execution being executed and finishing 
 * successfully;
 * first array element - function to reset hooks returnes array first element - see description of function
 * resetDisplaySuccessMsg() in compnent's body
 */
export function useTrackThunkSuccessfulFinishing(asyncThunkExecutionStatus){
  //previous status info is used after submitting when saving execution status becomes "loading",
  //until then previous status info is not needed
  const [previousExecutionStatus, setPreviousExecutionStatus] = useState(null);

  //when thunks execution status becomes "idle" after it previously has been "pending", displaySuccessMsg 
  //will be set to true to display success message
  const [displaySuccessMsg, setDisplaySuccessMsg] = useState(false);

  useEffect(() => {
    //when status becams "loading", track execution status changes to make sure that after it had been "loading" it
    //became "idle" which means that thunk was executing and terminated successfully After such state transfer 
    //seccessfully finished execution finishing info can display on page
    if (asyncThunkExecutionStatus === STATUS_LOADING) {
      setPreviousExecutionStatus(STATUS_LOADING);
      //set displaySuccess message to false to correctly display success message component in case redux thunk
      //that sends data finishes execution with fullfilled status (in case of successull finishing it must be
      //mounted after it was absent in jsx before)
      setDisplaySuccessMsg(false);
    } else if (previousExecutionStatus === STATUS_LOADING) {
      if (asyncThunkExecutionStatus === STATUS_IDLE) {
        setDisplaySuccessMsg(true);
        //reset previousExecutionStatus state variable to false to be ready for tracking next status change
        setPreviousExecutionStatus(null);

      } else if (asyncThunkExecutionStatus === STATUS_REJECTED) {
        //when after loading state there is rejected state, reset previousExecutionStatus state varible and
        //set wasSubmitted to false to be ready for repetative submitting in case user tries to submit again
        setPreviousExecutionStatus(null);
      }
    }
  }, [asyncThunkExecutionStatus]);


  /**
   * in situations where after successfull thunk execution instead of success message a created object is displayed when
   * this hook's returned displaySuccessMsg is true and there is a functionality to "create another object", a way to set 
   * displaySuccessMsg variable to "false" is needed to display initial screen with form for repatative submittion. As
   * displaySuccessMsg value comes to component from this hook, return this function for setting displaySuccessMsg to "false"
   * in this hook
   */
  function resetDisplaySuccessMsg(){
    setDisplaySuccessMsg(false);
  }
  
  return [displaySuccessMsg, resetDisplaySuccessMsg];
}