import { routes } from "../config";
import { FAVORITE_BOOKS_LIST } from "../constants/bookListModes";
import SettingsMenu from "./settings_menu/SettingsMenu";
import PageHeader from "./page_header/PageHeader";
import BookEditing from "./BookEditing";
import BooksList from "./books_list/BooksList";
import BookCreating from "./BookCreating";
import BooksListTypeMenu from "./BooksListTypeMenu";
import PageNotFound from './PageNotFound';
import DataFetchingProgressIndicator from "./DataFetchingProgressIndicator";
import {
        BrowserRouter as Router,
        Routes,
        Route } from "react-router-dom";
import DataFetchingErrorMessageResetter from "./DataFetchingErrorMessageResetter";

const Layout = () => {
  return (
    <div className="bg-[#eeeeee] flex min-h-screen">
      <Router>
        {/*DataFetchingErrorMessageResetter does not output anytning but must be child of react router <Router> child
        to receive data from react router context to use it's api */}
        <DataFetchingErrorMessageResetter/>

        <div className="lg:grow lg:flex lg:justify-center xl:justify-end xl:shrink-0 xl:basis-0">
          <BooksListTypeMenu/>
        </div>
        <div className="grow lg:grow-0 lg:shrink-0 lg:basis-[840px] xl:basis-[950px] flex flex-col relative">
          <PageHeader/>
          <SettingsMenu/>

          <div className="bg-white relative pt-[30px] px-[15px] pb-[65px] sm:px-[30px] grow">
            <DataFetchingProgressIndicator />

            <Routes>
              <Route path={routes.bookListPath} element={<BooksList />} />
              <Route path={routes.favoriteBooksListPath} element={<BooksList listMode={FAVORITE_BOOKS_LIST} />} />
              <Route path={routes.bookEditPath} element={<BookEditing />} />
              <Route path={routes.createBookPath} element={<BookCreating />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </div>
        </div>
        <div className="lg:grow lg:shrink xl:shrink-0 xl:basis-0"></div>
      </Router>
    </div>
  )
}
export default Layout;
