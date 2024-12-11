import { Provider } from 'react-redux';
import store from './store/store';
import { fetchBookData } from "./features/booksSlice";
import Layout from "./components/Layout";

/**
 * 
 * This app was created to get experience with react, react-redux libraries. 
 * 
 * In this app state modifications are performed: creating, updating, deleting objects in redux store
 */
const App = () => {

  //load books on first and only render of this component before other components that uses data renders
  store.dispatch(fetchBookData());

  return (
    <Provider store={store}>
      <Layout/>
    </Provider>
  )
}
export default App;