
import { useSelector } from 'react-redux';
import {
  selectInitialDataFetchingStatus,
  STATUS_LOADING, 
  STATUS_REJECTED
} from "../features/booksSlice";
import { DataFetchingStatusLabel, LABEL_TYPE_ERROR } from "./ui_elements/DataFetchingStatusLabel";


/**
 * This component displays state from books slice dedicated to execution state of async thunk 
 * that fetches book data from remote source. Two states may be displayed: "loading"
 * which means data fetching is in progress and "failed" which means data fetching has failed
 * @returns 
 */
function DataFetchingProgressIndicator () {
  let fetchingStatus = useSelector(state => selectInitialDataFetchingStatus(state));
    
  return (
    <>
      {/*if fetching has failed, display message*/}
      {fetchingStatus === STATUS_REJECTED &&
        <DataFetchingStatusLabel type={LABEL_TYPE_ERROR}
          labelText="initial data fetching has failed"/>
      }
      
      {/*while data is fetching, show that data is loading*/}
      {fetchingStatus === STATUS_LOADING &&
        <DataFetchingStatusLabel labelText="loading..."/>
      }
    </>
  )
}

export default DataFetchingProgressIndicator;