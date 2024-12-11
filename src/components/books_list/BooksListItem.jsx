import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { selectBookFullInfoById } from "../../features/booksSlice";
import { bookFavoriteStateToggled } from "../../features/favoriteBooksSlice";
import { bookCollectionAddedToSelection, singleBookRemovedFromSelection } from "../../features/uiControlsSlice";
import { ButtonWithIconAndBackground } from '../ui_elements/ButtonWithIconAndBackground';

export function BookListItem({bookId, editUrl, deleteUrl}) {
  
  //button with redirection will be used instead of react router <Link/> element to have uniform styling - 
  //most of elements on page are html <button> elements, only couple of anchor <a/> elements might be needed on page
  //use <ButtonWithIcon/> component which generates <button> with click handler that redirects to needed url
  const navigate = useNavigate();

  let book = useSelector(state => selectBookFullInfoById(state, bookId));
  
  const dispatch = useDispatch();

  /**
   * handles checbox checking/unchecking event for a single book by adding or removing that book to selection for deleging.
   * Adds to deletable books selection whne checkbox is checked and removes from selection if checbox is unchecked
   * @param {change event object} event 
   */
  function handleBookSelectionForDeleting(event){
    let isCheckboxChecked = event.target.checked;
    if(isCheckboxChecked){
      //a general function for adding a collection of books is used to add single book to selection, action.payload value must be 
      //an array consisting of single element which value is bookId 
      dispatch(bookCollectionAddedToSelection([bookId]));
    
    }else{
      //to remove a book from selection, action.payload value must be integer - bookId to be removed from selection
      dispatch(singleBookRemovedFromSelection(bookId));
    }
  }

  /**
   * when cliking on favourites icon, add or remove from favourites
   */
  function handleAddToFavoritesClick(){
    dispatch(bookFavoriteStateToggled(bookId));
  }

  
  let addToFavoritesButtonIconName = "add-to-favorites";
  if(book.isAddedToFavorites){
    addToFavoritesButtonIconName = "is-added-to-favorites";
  }

  return  (
    <div className="flex border-b-[1px] border-[grey] last:border-b-0">
      
      {/*custom checkbox for list item selecting for deletion*/}
      <div className="flex items-center pr-[15px]">
        <label>
          {/*make checkbox input invisible and not occupying space, add "peer" class to track checkbox checked/unckecked state in
          custom checkbox div*/}
          <input  type="checkbox" 
                  checked={book.isSelectedForDeleting}
                  onChange={handleBookSelectionForDeleting}
                  className="absolute opacity-0 peer"/>

          {/*create square with custom checkmark which is displayed or not depending on checkbox checked/unckecked state*/}
          <div className="block relative w-[18px] h-[18px] border-[2px] border-solid border-[#4066a5] rounded-[3px] 
            bg-white peer-checked:bg-[#ccc] after:hidden peer-checked:after:block peer-focus-visible:[outline-style:auto] 
            after:absolute after:left-[4px] after:top-0 after:w-[6px] after:h-[11px] after:border after:border-solid 
            after:border-[#4066a5] after:border-t-0 after:border-r-[2px] after:border-b-[2px] after:border-l-0 after:rotate-45">
          </div>
        </label>
      </div>

      {/*book author and title*/}
      <div className="grow shring basis-0 py-[15px]">
        <div className="author text-[0.8em]">{book.author}</div>
        <div className='title'>{book.title}</div>
      </div>
      
      <div className="grow-0 shrink-0 flex items-center gap-[10px] ml-[10px]">
        
        {/*add to favorites button*/}
        <ButtonWithIconAndBackground
          iconName = {addToFavoritesButtonIconName}
          clickHandler={handleAddToFavoritesClick}/>

        {/*edit button*/}
        <ButtonWithIconAndBackground
          iconName = "edit"
          //redirect to edit url on click
          clickHandler={()=>{navigate(editUrl)}}/>
        
        {/*delete button*/}
        <ButtonWithIconAndBackground
          iconName = "delete"
          //redirect to delete url on click
          clickHandler={()=>{navigate(deleteUrl)}}/>
      </div>
    </div>
  )
}
