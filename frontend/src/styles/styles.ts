export const styles = {
  container:
    "min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-indigo-950 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-500/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-purple-500/50",
  glowEffect:
    "shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-shadow duration-300",
  glassEffect:
    "bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-slate-700/50",
  hoverGlass:
    "hover:bg-slate-700/30 hover:border-slate-600/50 transition-all duration-300",
  gradientText:
    "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-[gradient-shift_3s_ease_infinite] bg-[length:200%_auto]",
  cardHover:
    "transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300",
  iconGlow: "filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]",
  sparkleIcon:
    "animate-[pulse-glow_2s_ease-in-out_infinite] [--tw-animate-pulse-glow:brightness(1)_opacity(1)] [--tw-animate-pulse-glow-50:brightness(1.2)_opacity(0.8)]",
  input:
    "w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder-slate-400",
  label: "block text-sm font-medium text-slate-300 mb-2",
  button:
    "px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300",
  navItem:
    "group flex items-center gap-3 w-full px-4 py-3 mb-2 rounded-xl transition-all duration-300",
  navItemActive:
    "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white shadow-lg shadow-indigo-500/10",
  navItemInactive: "text-slate-400 hover:bg-slate-800/50 hover:text-white",
  taskCard:
    "p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-all border border-slate-700/30 hover:border-indigo-500/30",
  badge: "px-2.5 py-1 rounded-full text-xs font-medium",
  statsCard:
    "p-4 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50",
  kanbanColumn:
    "flex flex-col h-full w-80 min-w-80 bg-slate-800/30 rounded-xl border border-slate-700/50",
};




