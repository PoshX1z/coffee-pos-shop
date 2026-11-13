import { Icon } from "../ui/Icon.jsx";
import { TABS } from "../../types/pos";

export const Nav = ({ activeTab, onSelectTab }) => {
  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col bg-white border-r border-slate-200 p-4 gap-6 z-30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-700 text-white grid place-items-center font-bold">
            <Icon name="cup" className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold leading-tight">
              ระบบจัดการ
              <br />
              ร้านกาแฟ POS
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => onSelectTab(key)}
              className={`flex items-center gap-3 h-11 px-4 rounded-xl text-sm font-medium cursor-pointer transition-all active:scale-95 hover:brightness-75 ${
                activeTab === key
                  ? "bg-blue-700 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
              }`}
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 grid grid-cols-4 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] gap-1 z-40">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onSelectTab(key)}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all active:scale-95 hover:brightness-75 ${
              activeTab === key
                ? "bg-blue-700 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
            }`}
          >
            <Icon name={icon} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
};
