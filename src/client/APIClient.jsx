class APIClient {
  /**
     * returns books information list. Inteded to use for initial data loading to prefill application with books data or when user
     * changes data source in data source menu.
     * Returns either books list hard coded in this function or fetched from api available at openlibrary.org.
     * @param {string} dataSource - returns fetched data from remote api if parameter value is equal to "remote", otherwise
     * returns books list that is hard coded in this function
     * @returns array of book objects wrapped in Promise object which returns data with some delay to simulate network access timeout
     */
    fetchBooks = async (dataSource = "local") => {
        let booksArr;
      
        if(dataSource === "remote"){
          let data;
          //fetch twenty books
          let url = "https://gutendex.com/books/";
          try {
            const response = await fetch(url);
            data = await response.json();
            if (!response.ok) {
              Promise.reject(new Error(`Error ${response.status}: ${response.statusText}`));
            }
          } catch (err) {
            return Promise.reject(err.message ? err.message : data)
          }
          booksArr = data.results.map((bookInfo, arrIndex) => {
            return {
              id: bookInfo.id, 
              title: bookInfo.title,
              //author field is array, get only first author if fields has data
              author: bookInfo.authors[0] ? bookInfo.authors[0].name : "unknown",
              preface: "field for preface"
            }
          })
        }else{
          booksArr = [
            {
              id: 101,
              title: "Calculus, part one",
              author: "Gilbert Strang",
              preface: "field for preface"
            },
            {
              id: 102,
              title: "DEMO CASE - updating or deleting this book (alone or among multiple books) will fail",
              author: "Author Name",
              preface: "field for preface"
            },
            {
              id: 103,
              title: "Calculus, part two",
              author: "Gilbert Strang",
              preface: "field for preface"
            },
            {
              id: 104,
              title: "Calculus, part three",
              author: "Gilbert Strang",
              preface: "field for preface"
            },
            {
              id: 105,
              title: "The basics of physics",
              author: "Steven Holzner",
              preface: "field for preface"
            },
            {
              id: 106,
              title: "Transistor circuit basics",
              author: "Charles Pike",
              preface: "field for preface"
            },
            {
              id: 107,
              title: "Calculus, part six",
              author: "Gilbert Strang",
              preface: "field for preface"
            },
            {
              id: 108,
              title: "Calculus, part seven",
              author: "Gilbert Strang",
              preface: "field for preface"
            },
            {
              id: 109,
              title: "Calculus, part eight",
              author: "Gilbert Strang",
              preface: "field for preface"
            }
          ];
        }
        
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({books: booksArr})
          }, 200)
        });
        
    }
  
  
    /**
     * returns favorite books information list. Inteded to use for initial data loading to prefill application with books data or when user
     * changes data source in data source menu where user can choose to load local or remote data (from openlibrary.org).
     * In case of fetching remote data (books are fetched from openlibrary.org), define empty array which conforms to no any book added 
     * to favorite books list but when chooses local data, return favorites array filled with some values to display some books marked
     * as added to favorites. The intention of this is that user would see the difference in books list loaded from different data sources
     * also in terms of added favorite books
     * 
     * @param string dataSource - if set to "remote", method will returns empty array list, otherwise returns non empty array
     * @returns array of favorite book id integer values wrapped in Promise object which returns data with some delay to simulate 
     * network access timeout
     */
    fetchFavoriteBooksIds = async (dataSource = "local") => {
      let favoriteBooksIdsArr;
    
      if(dataSource === "remote"){
        //
  
        favoriteBooksIdsArr = [];
  
      }else{
        favoriteBooksIdsArr = [101, 103, 104];
      }
  
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({favoriteBooks: favoriteBooksIdsArr})
        }, 200)
      });
    }
  
    /**
     * async function simulating access to REST api endpoint for book saving. Accepts book data to be saved,
     * returns passed book data with "id" identifier field added
     * @param {object} newBookData - book data to be stored
     * @returns - same value as passed in parameter "bookData" with added "id" field value. Value is
     * wrapped in Promise object which returns data with some delay to simulate network access timeout
     */
    saveNewBook = async (newBookData) => {
      const date = new Date();
      const timeStr = "" + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
      const idFieldValue = parseInt(timeStr);
      //Clone original object which can be modified securely escaping possible issues caused by original object
      //modification as this is simulated REST client that did not receives data over network but returns
      //locally created promise returning modified data from passed argument value
      const bookDataAfterSaving = {id: idFieldValue, ...newBookData}
  
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({bookData: bookDataAfterSaving})
        }, 500)
      });
    }
  
    /**
     * async function simulating access to REST api endpoint for book updating. Accepts book data with new data,
     * returns same book data with with updated last modified field. To demonstrate error message display in UI, if book "id"
     * field is equal with "102", returns Promose with "reject" callback to execute rejected path in function that processes current
     * function's return value
     * @param {object} bookData - new data, must contain "id" field
     * @returns - same value as passed in parameter "bookData" with updated last modified field. Value is
     * wrapped in Promise object which returns data with some delay to simulate network access timeout
     */
    updateBook = async (bookData) => {
      //simulating lastUpdated field coming back from server after modification
      const date = new Date();
      const timeStr = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
      
      //Clone original object which can be modified securely escaping possible issues caused by original object
      //modification as this is simulated REST client that did not receives data over network but returns
      //locally created promise returning modified data from passed argument value
      const bookDataAfterUpdating = { ...bookData, lastModified: timeStr }
  
      if(bookData.id === 102){
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject({ error: {message:"book updating failed"}})
          }, 500)
        });
      }
  
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ bookData: bookDataAfterUpdating })
        }, 500)
      });
    }
  
    /**
     * async function simulating access to REST api endpoint for book deleting. Accepts array with book identifiers each
     * pointing a book to be deleted. Returns object with message describing deleting success for failure. To demonstrate 
     * error message display in UI, if array has value equal with "102", returns Promose with "reject" callback to execute
     * rejected path in function that processes current function's return value
     * 
     * @param int[] bookIdsArr - array of integers, would be sent to REST api 
     * @returns - object with success message as it would be returned from REST api backend in case of success
     */
    deleteBooks = async (bookIdsArr) => {
      if(bookIdsArr.includes(102)){
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject({ error: {message:"book deleting failed"}})
          }, 500)
        });
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ message: "book have been deleted" })
        }, 500)
      });
    }
    
  }
  
  export const apiClient = new APIClient();