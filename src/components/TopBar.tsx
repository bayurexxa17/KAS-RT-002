"use client";

export function TopBar({ title, onSyncClick }: { title: string; onSyncClick: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 no-print flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
          className="text-slate-400 hover:text-slate-600"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-800">{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onSyncClick}
          className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 transition-colors hidden md:flex items-center justify-center"
          title="Sinkronisasi"
        >
          <i className="fas fa-cloud"></i>
        </button>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">admin</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">ADMIN RT</p>
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm">
            <i className="fas fa-user-shield"></i>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>
  );
}
