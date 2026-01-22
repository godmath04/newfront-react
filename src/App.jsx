import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Componentes de articulos
import ArticleList from './components/articles/ArticleList';
import ArticleCreate from './components/articles/ArticleCreate';
import ArticleEdit from './components/articles/ArticleEdit';
import ArticleDetail from './components/articles/ArticleDetail';

// Componentes de aprobaciones
import ApprovalList from './components/approvals/ApprovalList';
import ApprovalArticleDetail from './components/approvals/ApprovalArticleDetail';

// Componentes publicos
import PublicArticleList from './components/public/PublicArticleList';
import PublicArticleDetail from './components/public/PublicArticleDetail';

// Importar interceptor de axios para inicializarlo
import './utils/axios.interceptor';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas publicas - Sin autenticacion */}
          <Route path="/login" element={<Login />} />
          <Route path="/public/articles" element={<PublicArticleList />} />
          <Route path="/public/articles/:id" element={<PublicArticleDetail />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Rutas de articulos - Protegidas */}
          <Route
            path="/articles"
            element={
              <ProtectedRoute>
                <ArticleList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles/create"
            element={
              <ProtectedRoute>
                <ArticleCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles/edit/:id"
            element={
              <ProtectedRoute>
                <ArticleEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles/detail/:id"
            element={
              <ProtectedRoute>
                <ArticleDetail />
              </ProtectedRoute>
            }
          />

          {/* Rutas de aprobaciones - Solo para aprobadores */}
          <Route
            path="/approvals"
            element={
              <ProtectedRoute requiredRoles={['Editor', 'Revisor Legal', 'Jefe de Redacción']}>
                <ApprovalList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals/article/:id"
            element={
              <ProtectedRoute requiredRoles={['Editor', 'Revisor Legal', 'Jefe de Redacción']}>
                <ApprovalArticleDetail />
              </ProtectedRoute>
            }
          />

          {/* Rutas de administracion - Solo para administradores */}
          {/*
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRoles={['Administrador']}>
                <UserList />
              </ProtectedRoute>
            }
          />
          */}

          {/* Redireccion por defecto a la lista publica de articulos */}
          <Route path="/" element={<Navigate to="/public/articles" replace />} />
          <Route path="*" element={<Navigate to="/public/articles" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
