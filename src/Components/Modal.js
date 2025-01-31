const Modal = ({ children, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-md w-1/2 relative">
          <button onClick={onClose} className="absolute top-2 right-4 text-gray-600">
            ✖
          </button>
          {children}
        </div>
      </div>
    );
  };
  
  export default Modal;
  