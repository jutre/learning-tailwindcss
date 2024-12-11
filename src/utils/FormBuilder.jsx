import { useState, useEffect } from 'react';

/**
 * 
 * @param {array} formFieldsDefinition - array of objects. Each object in array represents form field's
 * definition, object properties are dedicated for following purpose
 * "label" - label text for input field, 
 * "name" - input element's "name" attribute value,  
 * "type" - input element's "type" attribute value
 * "rule" - validation rule for fields value,
 * for example, three fields are defined as follows - 
 * 
 * [{label: "id", name:"id", type:"hidden"},
 *  {label: "Title", name:"title", type:"text", rule:"required"}, 
 *  {label: "Description", name:"description", type:"textarea", rule:"required"}]
 *
 * @param {string} submitButtonText - text for submit button, can be empty, if parameter empty, text will be "Submit"
 * @param {object} initialData - object with data that will be filled in form input fields on initial display.
 * Each object propertie's value will be displayed in input field with name same as propertie's name
 * @param {function(submittedData)} successfulSubmitCallback -function what will be invoked after form submit
 * if all fields pass validation
 * @param {boolean} disableAllFields - if set to true, all input fields, also submit button will be disabled using "disabled".
 * Intended to be used in cases when form must be disabled like while data sending is in process after submit but meanwhile page
 * still displays form
 * attribure
 * @returns
 */
export function FormBuilder({
  formFieldsDefinition,
  submitButtonText,
  initialData,
  successfulSubmitCallback,
  disableAllFields }) {

  
  submitButtonText = submitButtonText ?? "Submit";
  /*
  TODO finish code for creating radio input, select
  TODO - currently in case if initial data object contains properties that are not present as form fields they are also
  submitted (unmodified). Decide is it is needed to eliminate them and submit only object with fields that are 
  present in form fields definition prop as input fields */

  //will track all input fields values
  const [inputFieldValues, setInputFieldValues] = useState({});
  const [inputErrors, setInputErrors] = useState({});

  
  useEffect(() => {
    /*Setting initial form data to component's state in useEffect hook which depends on @param initialData value. 
    We can't do just  useState(initialData) as doing such way in case parent component re-renders with other @param initialData value,
    new value won't be set to component's state as useState runs once. This is done for case a design pattern is used when parent component 
    renders for the first time with empty data (then form as it's child is rendered with empty fields) and then parent component loads data 
    from somehow in useEffect hook and re-renders with loaded data that must be initially sed in form fields*/


    /*Code to reach consistency. Initial data for form is plain object with key/value pairs, where value suplies initial
    value for all kind of input elements, for checkbox that value is used for "checked" attribute. Any type of data can be suplied
    for ths attribute in this object, React would convert it to Truthy/Falsey value when setting it for input element. If user changes
    in form checkbox to opposite value and then sets back like removing initial check mark and then puting it back 
    and then submits it, the value passed to successfulSubmitCallback will be 'true' withboolean type. But in case user does not 
    change the checkbox state and submits the form, the data passed to successfulSubmitCallback for the ckeckbox field will be same
    value that was passed in initial data object having expactly same type, for example a string value "on". 
    The following code converts all initial values for checkboxes to boolean type to correct than inconsitency. The outcome is 
    always passing boolean type value to successfulSubmitCallback for checbox fields*/

    //Create a copy of @param initialData object as it might be modified. In some cases passed value might be readonly as with
    //objects coming from Redux, but we need an object that can be modified for checkbox fields values correction
    let initialDataCopy = {...initialData};
    if(! initialDataCopy){
      initialDataCopy = {};
    }
    let correctedCheckboxValues = {};
    formFieldsDefinition.forEach(formElementDef => {
      let fieldName = formElementDef.name;
      if(formElementDef.type === "checkbox"){
        if( typeof (initialDataCopy[fieldName]) !== "boolean"){
          correctedCheckboxValues[fieldName] = Boolean(initialDataCopy[fieldName]);
        }
      }
    })

    if(Object.keys(correctedCheckboxValues).length !== 0){
      initialDataCopy = { ...initialDataCopy, ...correctedCheckboxValues };
    }

    //TODO - add type casting for all input fields with type "text", "textarea", "hidden", "select" (possibly others) to text
    //before calling successfulSubmitCallback(). This way can help iliminate errors like when initial input data is set
    //but a certain field is not modified in form, it is submitted back with same type as it was in initial data, like
    //"integer", but when it was modified in form, is changes to "string" type and that could cause errors when looking
    //object by same type and not finding it 

    //finally set corrected data to state
    setInputFieldValues(initialDataCopy);

  }, [initialData]);


  const onInputFieldsChange = (event) => {
    //sets changed input's value in state variable
    let name = event.target.name;
    let value = event.target.value;

    //process value for checkbox by examining checked state of checkbox
    if (event.target.type === "checkbox") {
      value = event.target.checked;
    }
    setInputFieldValues(values => ({ ...values, [name]: value }));
  };

  /**
   * when form is submited, validate each field's value according each fields validation rules from form definition array. 
   * If no errors found, invoke function passed to successfulSubmitCallback parameter
   * @param {*} event 
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    //clear previous errors, as this will be filled with errors from current validation
    let errors = {}; 

    for (const formElementDef of formFieldsDefinition) {
      //if validation rules are absent for this field, go to next field
      if(!Array.isArray(formElementDef.validationRules)){
        continue;
      }

      let fieldName = formElementDef.name;
      formElementDef.validationRules.forEach((validatRulesObj) => {
        let errMsgForCurrentField = null;

        //rule "required" - don't allow empty string
        if (validatRulesObj.name === "required" && 
            (inputFieldValues[fieldName] === undefined || inputFieldValues[fieldName].trim() === "")) {
            const defaultErrMsg = "this field must not be empty";

            //use error message from form definition if it is set
            errMsgForCurrentField = validatRulesObj.message ? validatRulesObj.message : defaultErrMsg;
        
            
        //rule "minLength" - don't allow shorter than string length than defined in rule's "value" field.
        //If field is empty string, create error message that field must not be empty and minimal length that 
        //string should be, if string is not empty and too short, create error message that field value's length
        //should not be shorter than specified in rule
        } else if (validatRulesObj.name === "minLength") {
          let fieldValueMinLength = parseInt(validatRulesObj.value);
          
          if(inputFieldValues[fieldName] === undefined || 
            inputFieldValues[fieldName].trim().length < fieldValueMinLength) {
              const defaultErrorMsg =  `field's length must be at least ${fieldValueMinLength} 
                symbol${ fieldValueMinLength > 1 ? "s" : "" }`;
                
            //use error message from form definition if it is set
            errMsgForCurrentField = validatRulesObj.message ? validatRulesObj.message : defaultErrorMsg;
            
          }
        }

        if(errMsgForCurrentField !== null){
          errors = { ...errors, [fieldName]: errMsgForCurrentField };
        }
      })
    }
  

    //if there are no input errors, call sucessfull submit callback
    if (Object.keys(errors).length === 0) {
      successfulSubmitCallback(inputFieldValues);
    }

    //set actual errors to state for displaying
    setInputErrors(errors);
  }
   
  return (
    <form onSubmit={handleSubmit} className="form_builder">
      {(formFieldsDefinition).map((formElementDef) => {
        let fieldName = formElementDef.name;

        //Adding attributes present in all input elements.
        //All input elements also have change handler as they are controlled input fields
        let inputElemAttributes = {
          name: fieldName ,
          id: fieldName ,
          onChange: onInputFieldsChange
        };

        if(disableAllFields){
          inputElemAttributes.disabled = true;
        }

        //in "checbox" input element assign current field's value to "checked" attribute,
        //for all other input types value goes to "value" attribute.
        //Do not allow 'undefined' value for "checked" or "value" attributes to have controlled input element -
        //field's value's initial data might be 'undefined' usually for forms without initial data
        if (formElementDef.type === "checkbox") {
          inputElemAttributes.checked = inputFieldValues[fieldName];
          if(inputElemAttributes.checked === undefined){
            inputElemAttributes.checked = false;
          }
        }else{
          inputElemAttributes.value = inputFieldValues[fieldName] || "";
        }

        //create "input", "textarea", etc. html tag corresponding to type of input in form definition object
        //TODO - add code for "select" tag creation, "<input type='radio' />
        let inputTag;
        if (formElementDef.type === "text" || formElementDef.type === "checkbox" || formElementDef.type === "hidden") {
          inputElemAttributes.type = formElementDef.type;
          inputTag = <input {...inputElemAttributes} />;

        } else if (formElementDef.type === "textarea") {
          inputTag = <textarea {...inputElemAttributes} />;
        }

        /**
         * input tag is created, we must wrap it in div and place label as needed according 
         * to type of input element
         */

        //for "hidden" type input return just <input> tag here, no additional wrapping or label
        if(formElementDef.type === "hidden"){
          //recteate tag by adding "key" attribute which is needed for React in list rendering
          return <input {...inputElemAttributes}  key={fieldName}/>;
        }

        /*for all input tags except checkbox, label comes before input field, checkbox also have
        additional markup to have ability to style it as needed*/
        let inputTagWithLabel;
        let fieldWrapperCssClass = "field " + formElementDef.type;
        if(formElementDef.type === "checkbox"){
          inputTagWithLabel = (
            <>
              <div>{inputTag}</div> 
              <label htmlFor={fieldName}>{formElementDef.label}</label>
            </>) ;
        }else{
          inputTagWithLabel = <> <label htmlFor={fieldName}>{formElementDef.label}</label> {inputTag} </>;
        }
        return (
          <div className={fieldWrapperCssClass} key={fieldName}>
            {inputTagWithLabel}

            {inputErrors[fieldName] &&
              <div className='input_error'>{inputErrors[fieldName]}</div>}
          </div>);
      }
      )}

      <input  type="submit" 
              value={submitButtonText}
              disabled={disableAllFields}/>

    </form>
  );
}