import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <main className="page-shell flex items-center justify-center">
      <section className="w-full max-w-6xl rounded-[32px] border border-white/10 bg-white/8 p-8 shadow-soft backdrop-blur-2xl md:p-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <p className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-100">
              Professional quiz experience
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Quiz App
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-200 md:text-xl">
              Launch live sessions, guide players with elegant flows, and keep every round polished and easy to navigate.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link to="/signup" className="btn-primary text-lg">Sign Up</Link>
              <Link to="/host" className="btn-outline text-lg">Host Login</Link>
              <Link to="/login" className="btn-outline text-lg">Admin Login</Link>
              <Link to="/join" className="btn-secondary text-lg">Join Quiz</Link>
            </div>
          </div>

          <aside className="grid gap-4">
            <article className="glass-panel p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-indigo-100">Why it feels better</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Smooth, focused, and intuitive</h2>
              <p className="mt-3 text-slate-200">Clear hierarchy, sharper contrast, and cleaner calls to action make each step easier to follow.</p>
            </article>
            <article className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="glass-panel p-5">
                <p className="text-sm text-indigo-100">Navigation</p>
                <p className="mt-2 text-xl font-semibold text-white">Forward & back flows</p>
                <p className="mt-1 text-slate-200">A more guided layout keeps every action visible and predictable.</p>
              </div>
              <div className="glass-panel p-5">
                <p className="text-sm text-indigo-100">Experience</p>
                <p className="mt-2 text-xl font-semibold text-white">Polished interface</p>
                <p className="mt-1 text-slate-200">Soft gradients, glass cards, and stronger contrast bring a premium feel.</p>
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default HomePage
