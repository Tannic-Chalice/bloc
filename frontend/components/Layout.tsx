import Link from "next/link";

interface LayoutProps {
    children: React.ReactNode;
    activePage: "dashboard" | "callers";
}

export default function Layout({ children, activePage }: LayoutProps) {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light">
            {/* Header / Navigation */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 lg:px-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-2xl">sensors</span>
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900">
                        Live Leads
                    </h2>
                </div>

                <nav className="hidden md:flex flex-1 justify-center gap-8">
                    <Link
                        href="/"
                        className={`text-sm leading-normal flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activePage === "dashboard"
                                ? "text-primary font-semibold bg-primary/10"
                                : "text-slate-600 font-medium hover:text-primary"
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            dashboard
                        </span>
                        Dashboard
                    </Link>
                    <Link
                        href="/callers"
                        className={`text-sm leading-normal flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activePage === "callers"
                                ? "text-primary font-semibold bg-primary/10"
                                : "text-slate-600 font-medium hover:text-primary"
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            support_agent
                        </span>
                        Callers
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                        <span className="text-slate-600 text-xs font-medium uppercase tracking-wider">
                            System Online
                        </span>
                    </div>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-900">
                                Alex Morgan
                            </p>
                            <p className="text-xs text-slate-500">Admin</p>
                        </div>
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-white shadow-sm"
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAkA8PbLa8STMsBSqdZavCCJ8z-2OFI-VrR5XBd8V67aOcGM3jdc_s1lbJb-pSm3hXII6u3vvRVjV6gVgNBp7IXAZEGp948OetlsDNP5Hf_x8rjpQPAsu5RrHNmJLGQTIKlq9fEhnRAUYl7rWntcF-RzYXp90mjP2LJGu10lsH7P5JKqFifXnPWwlYx4LWRB3-1Eo7zruvdAnS4cu9bERWO8M7IhaD-dNDFsgxBmLRqmV3Jotx7IXP7ppqLsc3HPZ_LSuzvSs5nL4Ra")',
                            }}
                        ></div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 lg:px-10 py-8 bg-background-light">
                <div className="mx-auto max-w-[1400px]">{children}</div>
            </main>
        </div>
    );
}
