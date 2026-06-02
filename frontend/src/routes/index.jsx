import React from 'react'
import { BrowserRouter, Routes as RRRoutes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import JoinPage from '../pages/JoinPage'
import HostPage from '../pages/HostPage'
import HostDashboard from '../pages/HostDashboard'
import LobbyPage from '../pages/LobbyPage'
import QuizPage from '../pages/QuizPage'
import LeaderboardPage from '../pages/LeaderboardPage'
import ResultsPage from '../pages/ResultsPage'
import AdminDashboard from '../pages/AdminDashboard'
import QuizCreateEdit from '../pages/QuizCreateEdit'
import QuizStatistics from '../pages/QuizStatistics'
import ProtectedRoute from '../components/ProtectedRoute'

const Routes = () => {
  return (
    <BrowserRouter>
      <RRRoutes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route
          path="/host"
          element={
            <ProtectedRoute roles={['host']}>
              <HostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute roles={['host']}>
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/lobby/:roomCode" element={<LobbyPage />} />
        <Route path="/quiz/:roomCode" element={<QuizPage />} />
        <Route path="/leaderboard/:roomCode" element={<LeaderboardPage />} />
        <Route path="/results/:roomCode" element={<ResultsPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/quiz/create"
          element={
            <ProtectedRoute roles={['host']}>
              <QuizCreateEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/quiz/:quizId/edit"
          element={
            <ProtectedRoute roles={['host']}>
              <QuizCreateEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/quiz/:quizId/stats"
          element={
            <ProtectedRoute roles={['host']}>
              <QuizStatistics />
            </ProtectedRoute>
          }
        />
      </RRRoutes>
    </BrowserRouter>
  )
}

export default Routes
