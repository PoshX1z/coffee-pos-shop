export const Toast = ({ message }) => {
  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm transition-opacity duration-300 pointer-events-none ${
        message ? "opacity-100" : "opacity-0"
      }`}
    >
      {message}
    </div>
  );
};
