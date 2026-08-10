import { useAppContext } from '../../context/AppContext';

/**
 * 底部固定導航列
 * 包含「餐廳清單」與「美食轉盤」兩個導航項目
 * 當 Modal 或 Form 開啟時禁用導航
 */
export function NavigationBar() {
  const { state, dispatch } = useAppContext();
  const { currentPage, ui } = state;

  const isDisabled = ui.isFormOpen || !!ui.resultRestaurantId;

  const handleNavigate = (page: 'list' | 'roulette') => {
    if (isDisabled || page === currentPage) return;
    dispatch({ type: 'NAVIGATE', payload: { page } });
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 ${
        isDisabled ? 'pointer-events-none opacity-50' : ''
      }`}
      aria-label="主要導航"
    >
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {/* 餐廳清單 */}
        <button
          type="button"
          onClick={() => handleNavigate('list')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-1 transition-colors duration-300 ${
            currentPage === 'list'
              ? 'text-indigo-600 border-t-2 border-indigo-600'
              : 'text-gray-500'
          }`}
          aria-current={currentPage === 'list' ? 'page' : undefined}
          aria-label="餐廳清單"
        >
          {/* List icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="text-xs mt-1">餐廳清單</span>
        </button>

        {/* 美食轉盤 */}
        <button
          type="button"
          onClick={() => handleNavigate('roulette')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-1 transition-colors duration-300 ${
            currentPage === 'roulette'
              ? 'text-indigo-600 border-t-2 border-indigo-600'
              : 'text-gray-500'
          }`}
          aria-current={currentPage === 'roulette' ? 'page' : undefined}
          aria-label="美食轉盤"
        >
          {/* Wheel/circle icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v9l6 3"
            />
          </svg>
          <span className="text-xs mt-1">美食轉盤</span>
        </button>
      </div>
    </nav>
  );
}
