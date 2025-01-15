import { RouterProvider } from 'react-router-dom';
import router from './router/index.jsx'
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';
import store from './store'; // 引入 Redux store

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition:Bounce
      />
    </Provider>
  );
}
