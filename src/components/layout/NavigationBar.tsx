import { useAppContext } from '../../context/AppContext';

/**
 * 底部固定導航列
 * 包含「餐廳清單」、「美食轉盤」、「熱量計算」與「AI 助手」四個導航項目
 * 當 Modal 或 Form 開啟時禁用導航
 */
export function NavigationBar() {
  const { state, dispatch } = useAppContext();
  const { currentPage, ui } = state;

  const isDisabled = ui.isFormOpen || !!ui.resultRestaurantId;

  const handleNavigate = (page: 'list' | 'roulette' | 'calories' | 'chat') => {
    if (isDisabled || page === currentPage) return;
    dispatch({ type: 'NAVIGATE', payload: { page } });
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 ${
        isDisabled ? 'pointer-events-none opacity-50' : ''
      }`}
      aria-label="主要導航"
    >
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {/* 餐廳清單 */}
        <button
          type="button"
          onClick={() => handleNavigate('list')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 transition-colors duration-300 ${
            currentPage === 'list'
              ? 'text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          aria-current={currentPage === 'list' ? 'page' : undefined}
          aria-label="餐廳清單"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[10px] mt-0.5">清單</span>
        </button>

        {/* 美食轉盤 */}
        <button
          type="button"
          onClick={() => handleNavigate('roulette')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 transition-colors duration-300 ${
            currentPage === 'roulette'
              ? 'text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          aria-current={currentPage === 'roulette' ? 'page' : undefined}
          aria-label="美食轉盤"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9l6 3" />
          </svg>
          <span className="text-[10px] mt-0.5">轉盤</span>
        </button>

        {/* 熱量計算 */}
        <button
          type="button"
          onClick={() => handleNavigate('calories')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 transition-colors duration-300 ${
            currentPage === 'calories'
              ? 'text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          aria-current={currentPage === 'calories' ? 'page' : undefined}
          aria-label="熱量計算"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
          </svg>
          <span className="text-[10px] mt-0.5">熱量</span>
        </button>

        {/* AI 助手 */}
        <button
          type="button"
          onClick={() => handleNavigate('chat')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 transition-colors duration-300 ${
            currentPage === 'chat'
              ? 'text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          aria-current={currentPage === 'chat' ? 'page' : undefined}
          aria-label="AI 助手"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span className="text-[10px] mt-0.5">AI 助手</span>
        </button>
      </div>
    </nav>
  );
}
