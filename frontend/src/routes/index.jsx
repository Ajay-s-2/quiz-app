import React from 'react'
import { BrowserRouter, Routes as RRRoutes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import JoinPage from '../pages/JoinPage'
import HostPage from '../pages/HostPage'
import LobbyPage from '../pages/LobbyPage'
import QuizPage from '../pages/QuizPage'
import LeaderboardPage from '../pages/LeaderboardPage'
import ResultsPage from '../pages/ResultsPage'
import AdminDashboard from '../pages/AdminDashboard'
import QuizCreateEdit from '../pages/QuizCreateEdit'
import QuizStatistics from '../pages/QuizStatistics'

const Routes = () => {
  return (
    <BrowserRouter>
      <RRRoutes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/lobby/:roomCode" element={<LobbyPage />} />
        <Route path="/quiz/:roomCode" element={<QuizPage />} />
        <Route path="/leaderboard/:roomCode" element={<LeaderboardPage />} />
        <Route path="/results/:roomCode" element={<ResultsPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/quiz/create" element={<QuizCreateEdit />} />
        <Route path="/admin/quiz/:quizId/edit" element={<QuizCreateEdit />} />
        <Route path="/admin/quiz/:quizId/stats" element={<QuizStatistics />} />
      </RRRoutes>
    </BrowserRouter>
  )
}

export default Routes
