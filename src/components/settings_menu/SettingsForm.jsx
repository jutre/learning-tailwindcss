import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {  fetchBookData, 
          selectInitialDataFetchingStatus,
          STATUS_IDLE,
          STATUS_REJECTED
} from "../../features/booksSlice";
import { useNavigate } from "react-router-dom";
import { routes } from "../../config";

/**
 * data source settings form. Displays menu with two options of data source for application's initial data, it is possible to
 * choose one of them by clicking desired option. When other than currently selected option is choosen, data loading is
 * initiated. If data loading ends succesfully then form is hidden and page is redirected to all books list as new data is
 * loaded
 */
function SettingsForm({closeMenuHandler}){
  const [selectedRadioButtonValue, setSelectedRadioButtonValue] = useState("local");
  const [closeFormAfterDataLoaded, setCloseFormAfterDataLoaded] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  let fetchingStatus = useSelector(state => selectInitialDataFetchingStatus(state));


  //This hook closes menu and redirects to all books list after succesful loading of new initial data.
  //Redirect is needed because if currently user is on book edit page then book edit page form would  be filled
  //with new data just loaded.
  //Form closing is triggered by state variable "closeFormAfterDataLoaded". It is set to "true" after data fetching
  //is initiated. When "closeFormAfterDataLoaded" is "true" and fetching state becomes "idle" menu is closed and page is
  //redirected. If data fetching fails then menu is not closed, user can close it using menu; also loading error is 
  //displayed in another component
  useEffect(() => {
    if(closeFormAfterDataLoaded === true){
      if(fetchingStatus === STATUS_IDLE){
        //data fetching ends with success - reset "closeFormAfterDataLoaded" variable (is is not needed to track
        //data loading and close menu after data ends loading), close menu, redirect to books list
        setCloseFormAfterDataLoaded(false);
        navigate(routes.bookListPath);
        closeMenuHandler();

      }else if(fetchingStatus === STATUS_REJECTED){
        //data fetching ends with failure - reset "closeFormAfterDataLoaded" variable (is is not needed to track
        //data loading any more to close menu after successfull loading, loading has failed), menu stays opened
        setCloseFormAfterDataLoaded(false);
      }
    }
  }, [fetchingStatus, closeFormAfterDataLoaded]);
  
  let dataSourceOptions = [
    {value: "local", label: "Local sample data"},
    {value: "remote", label: "Data from gutendex.com"}
  ];

  function handleChange(event){
    let selectedValue = event.target.value;
    setSelectedRadioButtonValue(selectedValue);

    dispatch(fetchBookData(selectedValue));
    setCloseFormAfterDataLoaded(true);
  }

  return (
    <div className="p-[8px] bg-white border border-[grey] rounded-[8px]">
      <div className="form_header mb-[8px]">
        Choose source for initial app data:
      </div>
      <div className="flex border border-[grey]">
        
        {(dataSourceOptions).map((entry, index) =>
          /*every child div is data source option. Currently active is highlighted with border from all sides, an inactive one
          has dark thin border on side where active is located which acts as separator between data source options*/
          <div key={index}
            className={
              (selectedRadioButtonValue === entry.value
                ? "bg-[#eee] border-x-[3px] border-y-[2px] border-x-[white] border-y-[grey]"
                : "bg-white " +
                //border on inactive data source on side where active is located
                (index === 0
                  ? "border-r-[1px] border-r-[grey]"
                  : "border-l-[1px]  border-l-[grey]")
              )}>

            <input type="radio"
              name="data_source_options"
              id={entry.value}
              value={entry.value}
              checked={selectedRadioButtonValue === entry.value}
              onChange={handleChange}
              className="absolute opacity-0" />

            {/*an inactive option's label element has hover color to highlight that it can be chosen*/}
            <label htmlFor={entry.value}
              className={"block min-w-[135px] h-full p-[15px] " +
                (selectedRadioButtonValue === entry.value
                  ? ""
                  : "hover:bg-[#0076c0] hover:text-white")}>
              {entry.label}
            </label>

          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsForm;