import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <main className="page-shell flex items-center justify-center">
      <section className="w-full max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-950 md:text-6xl">
            Quiz App
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 md:text-lg">
            Create, host, and join live quizzes from one focused workspace.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/join"
            className="rounded-xl border border-primary/20 bg-primary p-6 text-white shadow-glow transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
          >
            <span className="text-sm font-medium text-blue-100">Player</span>
            <span className="mt-3 block text-2xl font-semibold">Join Quiz</span>
          </Link>

          <Link
            to="/signup"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-2"
          >
            <span className="text-sm font-medium text-slate-500">Host</span>
            <span className="mt-3 block text-2xl font-semibold text-slate-950">Sign Up</span>
          </Link>

          <Link
            to="/host"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-2"
          >
            <span className="text-sm font-medium text-slate-500">Host</span>
            <span className="mt-3 block text-2xl font-semibold text-slate-950">Login</span>
          </Link>

          <Link
            to="/login"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-2"
          >
            <span className="text-sm font-medium text-slate-500">Admin</span>
            <span className="mt-3 block text-2xl font-semibold text-slate-950">Login</span>
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-slate-950">Create</p>
              <p className="mt-1">Build quizzes quickly.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">Host</p>
              <p className="mt-1">Run live rooms.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">Score</p>
              <p className="mt-1">Track results instantly.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
